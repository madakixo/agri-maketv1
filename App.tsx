
import React, { useState, useRef, useMemo } from 'react';
import { AppRoute, ProduceListing, Category, Order, OrderStatus, Review, MarketGroup, User, UserStatus, MarketIntelligence } from './types';
import { MOCK_LISTINGS, CATEGORIES, getIcon, MOCK_ORDERS, MOCK_REVIEWS, MOCK_GROUPS, MOCK_USERS } from './constants';
import Navigation from './components/Navigation';
import ListingCard from './components/ListingCard';
import { generateListingDetails, getMarketAdvice, getPriceIntelligence } from './services/geminiService';
import { 
  Sparkles, ArrowRight, Send, Loader2, RefreshCw, X, Search, 
  ShoppingBag, Package, CheckCircle, Clock, Camera, Trash2, Star,
  ChevronLeft, MessageSquare, ShieldCheck, Globe, Users, Truck, 
  TrendingUp, Activity, UserCheck, AlertTriangle, Ban, UserMinus, UserPlus,
  Map as MapIcon, Target, Navigation as NavIcon, BarChart3, Wallet, LogOut, Settings, CreditCard,
  // Added PlusCircle to fix the missing icon error
  PlusCircle
} from 'lucide-react';

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.HOME);
  const [listings, setListings] = useState<ProduceListing[]>(MOCK_LISTINGS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [groups, setGroups] = useState<MarketGroup[]>(MOCK_GROUPS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [radius, setRadius] = useState<number>(50); // Default 50km
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  // Intelligence State
  const [intelligence, setIntelligence] = useState<MarketIntelligence | null>(null);
  const [isIntelligenceLoading, setIsIntelligenceLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Admin View State
  const [adminSubTab, setAdminSubTab] = useState<'analytics' | 'users' | 'qa'>('analytics');

  // Detail state
  const [selectedListing, setSelectedListing] = useState<ProduceListing | null>(null);

  // Listing creation state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newListing, setNewListing] = useState({
    title: '',
    category: '',
    price: '',
    unit: 'basket',
    quantity: '',
    harvestDate: new Date().toISOString().split('T')[0]
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  // AI Advisor state
  const [advisorQuery, setAdvisorQuery] = useState('');
  const [advisorResponse, setAdvisorResponse] = useState('');
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);

  // User Context (Mocking current user as Samuel)
  const currentUser = users[0];

  const filteredListings = useMemo(() => {
    return listings.filter(l => {
      const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            l.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? l.category_id === selectedCategory : true;
      const matchesLocation = locationSearch ? l.location_name.toLowerCase().includes(locationSearch.toLowerCase()) : true;
      const matchesRadius = l.distance <= radius;
      return matchesSearch && matchesCategory && matchesLocation && matchesRadius;
    });
  }, [listings, searchQuery, selectedCategory, locationSearch, radius]);

  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + o.total_price, 0), [orders]);
  const platformEarnings = useMemo(() => orders.reduce((sum, o) => sum + o.platform_fee, 0), [orders]);

  const calculateFees = (total: number) => {
    let fee = 0;
    if (total > 100000) {
      fee = total * 0.035; // 3.5%
    } else if (total >= 50000) {
      fee = total * 0.025; // 2.5%
    }
    return { platform_fee: fee, seller_net: total - fee };
  };

  const handleBuy = (listing: ProduceListing) => {
    const totalPrice = listing.price_per_unit; 
    const { platform_fee, seller_net } = calculateFees(totalPrice);

    const newOrder: Order = {
      id: Date.now(),
      listing_id: listing.id,
      listing_title: listing.title,
      buyer_id: currentUser.id,
      seller_id: listing.seller_id,
      quantity: 1,
      total_price: totalPrice,
      platform_fee,
      seller_net,
      status: 'pending',
      created_at: new Date().toISOString(),
      image: listing.images[0]
    };
    setOrders([newOrder, ...orders]);
    alert(`Order placed successfully! ₦${platform_fee.toLocaleString()} platform fee deducted.`);
    setRoute(AppRoute.ORDERS);
  };

  const handleFetchIntelligence = async (listing: ProduceListing) => {
    setIsIntelligenceLoading(true);
    setIntelligence(null);
    try {
      const data = await getPriceIntelligence(
        listing.title, 
        listing.price_per_unit, 
        listing.location_name, 
        currentUser.income_level || 'middle'
      );
      setIntelligence(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsIntelligenceLoading(false);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    const listing: ProduceListing = {
      id: Date.now(),
      seller_id: currentUser.id,
      seller_name: currentUser.name,
      category_id: CATEGORIES.find(c => c.name === newListing.category)?.id || 1,
      category_name: newListing.category || 'Vegetables',
      title: newListing.title,
      description: aiSuggestions?.description || "Freshly harvested produce directly from the farm.",
      price_per_unit: parseFloat(newListing.price),
      unit: newListing.unit,
      quantity_available: parseFloat(newListing.quantity),
      location_name: "Ikeja, Lagos",
      distance: 0,
      images: uploadedImages.length > 0 ? uploadedImages : ["https://picsum.photos/seed/newharvest/800/600"],
      harvest_date: newListing.harvestDate,
      created_at: new Date().toISOString(),
      rating: 5,
      review_count: 0,
      is_verified: false
    };
    setListings([listing, ...listings]);
    setRoute(AppRoute.LISTINGS);
    setNewListing({ title: '', category: '', price: '', unit: 'basket', quantity: '', harvestDate: new Date().toISOString().split('T')[0] });
    setUploadedImages([]);
    setAiSuggestions(null);
  };

  const handleGenerateAiDescription = async () => {
    if (!newListing.title || !newListing.category) {
      alert("Please provide a title and category first.");
      return;
    }
    setIsGenerating(true);
    try {
      const suggestions = await generateListingDetails(newListing.title, newListing.category);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateUserStatus = (userId: number, status: UserStatus) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status } : u));
  };

  const handleVerify = (listingId: number) => {
    setListings(listings.map(l => l.id === listingId ? { ...l, is_verified: true, verified_by: "Admin Admin" } : l));
  };

  const formatCurrency = (val: number) => `₦${val.toLocaleString()}`;

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16 bg-slate-50 text-slate-900">
      <Navigation currentRoute={route} setRoute={(r) => { setRoute(r); setSelectedListing(null); setIntelligence(null); }} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* HOME ROUTE */}
        {route === AppRoute.HOME && (
          <div className="space-y-12 animate-in fade-in duration-500">
             <section className="relative rounded-[2.5rem] overflow-hidden bg-emerald-950 text-white p-8 md:p-16">
              <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-2 bg-emerald-500/20 w-fit px-4 py-1.5 rounded-full text-emerald-300 font-bold text-xs mb-6 border border-emerald-500/30">
                  <ShieldCheck className="w-4 h-4" />
                  <span>NIGERIA'S TRUSTED AGRI-HUB</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1]">
                  Location-Aware <span className="text-emerald-400">Trading</span>.
                </h1>
                <p className="text-emerald-100/70 text-lg mb-10 leading-relaxed">
                  Discover local harvests within your radius. Use AI Market Intelligence to understand purchasing power and fair pricing in your specific area.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button onClick={() => setRoute(AppRoute.LISTINGS)} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-3">
                    Search Near Me <NavIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => setRoute(AppRoute.GROUPS)} className="bg-white/5 hover:bg-white/10 backdrop-blur-md text-white border border-white/10 font-bold py-4 px-10 rounded-2xl transition-all">
                    Regional Hubs
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-1/3 h-full hidden lg:flex items-center justify-center opacity-20">
                <Globe className="w-96 h-96 text-emerald-500" />
              </div>
            </section>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: <Target className="text-emerald-500" />, title: "Radius Search", desc: "Filter produce based on proximity to your doorstep to save on logistics." },
                { icon: <BarChart3 className="text-blue-500" />, title: "Price Intelligence", desc: "AI-driven market insights calibrated to your local economy and income level." },
                { icon: <Wallet className="text-purple-500" />, title: "Direct Settlement", desc: "No middle-man markup. You pay the farmer's price + minimal hub fee." }
              ].map((f, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                  <div className="bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">{f.icon}</div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{f.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
            
            <section>
              <h2 className="text-3xl font-black text-slate-800 mb-8">Harvests Near You</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {listings.slice(0, 3).map(l => <ListingCard key={l.id} listing={l} onBuy={handleBuy} onClick={setSelectedListing} />)}
              </div>
            </section>
          </div>
        )}

        {/* LISTINGS ROUTE */}
        {route === AppRoute.LISTINGS && !selectedListing && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-black text-slate-800">Verified Marketplace</h1>
                  <p className="text-slate-500">Discover fresh produce by location and proximity.</p>
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-xl border transition-all ${viewMode === 'grid' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500'}`}
                   >
                     <Users className="w-5 h-5" />
                   </button>
                   <button 
                    onClick={() => setViewMode('map')}
                    className={`p-3 rounded-xl border transition-all ${viewMode === 'map' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500'}`}
                   >
                     <MapIcon className="w-5 h-5" />
                   </button>
                </div>
             </div>

             <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                     type="text" 
                     placeholder="Search produce (e.g. Tomatoes)..." 
                     className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
                <div className="relative flex-1 w-full">
                   <NavIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                   <input 
                     type="text" 
                     placeholder="Enter Location (e.g. Ikeja)..." 
                     className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                     value={locationSearch}
                     onChange={(e) => setLocationSearch(e.target.value)}
                   />
                </div>
                <div className="w-full lg:w-48 space-y-2">
                   <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                      <span>Radius</span>
                      <span>{radius} km</span>
                   </div>
                   <input 
                     type="range" 
                     min="1" 
                     max="500" 
                     step="5"
                     className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                     value={radius}
                     onChange={(e) => setRadius(parseInt(e.target.value))}
                   />
                </div>
             </div>

             {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                   {filteredListings.map(l => (
                     <div key={l.id} className="relative">
                       <ListingCard listing={l} onBuy={handleBuy} onClick={setSelectedListing} />
                       <div className="absolute bottom-24 right-4 bg-white/80 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 border border-slate-200 shadow-sm">
                          {l.distance} km away
                       </div>
                     </div>
                   ))}
                </div>
             ) : (
                <div className="bg-white rounded-[2.5rem] border border-slate-200 h-[600px] relative overflow-hidden flex items-center justify-center p-8 text-center">
                   <div className="space-y-6 max-w-md">
                      <div className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                         <NavIcon className="w-10 h-10 text-emerald-600 animate-pulse" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800">Map Interface</h3>
                      <p className="text-slate-500 leading-relaxed">
                        Currently displaying <strong>{filteredListings.length}</strong> markers in <strong>{locationSearch || "your area"}</strong>.
                      </p>
                      <button onClick={() => setViewMode('grid')} className="text-emerald-600 font-bold hover:underline">Switch to List View</button>
                   </div>
                </div>
             )}
          </div>
        )}

        {/* SELECTED LISTING DETAIL */}
        {selectedListing && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
             <button onClick={() => { setSelectedListing(null); setIntelligence(null); }} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-8 group">
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Market
             </button>

             <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                   <div className="aspect-[4/3] rounded-[3rem] overflow-hidden border border-slate-200 shadow-xl bg-white relative">
                      <img src={selectedListing.images[0]} className="w-full h-full object-cover" />
                      <div className="absolute top-6 left-6 bg-emerald-600 text-white px-5 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" /> Verified Harvest
                      </div>
                   </div>

                   {/* AI Market Intelligence Component */}
                   <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border border-slate-700">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                      
                      <div className="relative z-10">
                         <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                               <div className="bg-emerald-500 p-2 rounded-xl">
                                  <BarChart3 className="w-5 h-5 text-white" />
                               </div>
                               <h3 className="text-xl font-black">AI Market Intelligence</h3>
                            </div>
                            {!intelligence && (
                               <button 
                                 onClick={() => handleFetchIntelligence(selectedListing)}
                                 disabled={isIntelligenceLoading}
                                 className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold border border-white/10 flex items-center gap-2 disabled:opacity-50"
                               >
                                 {isIntelligenceLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                 Generate Insight
                               </button>
                            )}
                         </div>

                         {isIntelligenceLoading && (
                            <div className="space-y-4 animate-pulse">
                               <div className="h-4 bg-white/10 rounded w-3/4" />
                               <div className="h-4 bg-white/10 rounded w-1/2" />
                               <div className="h-20 bg-white/5 rounded w-full" />
                            </div>
                         )}

                         {intelligence && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                     <div className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest mb-1">Purchasing Power</div>
                                     <div className="flex items-end gap-2">
                                        <span className="text-2xl font-black">{intelligence.purchasingPowerScore}</span>
                                        <span className="text-white/40 text-[10px] mb-1.5">/ 10</span>
                                     </div>
                                  </div>
                                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                     <div className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest mb-1">Fair Market Price</div>
                                     <div className="text-2xl font-black">₦{intelligence.fairPrice.toLocaleString()}</div>
                                  </div>
                               </div>

                               <div>
                                  <div className="text-[10px] font-bold uppercase text-white/40 tracking-widest mb-2 flex items-center gap-2">
                                     <Target className="w-3 h-3" />
                                     Selling Strategy for {selectedListing.location_name}
                                  </div>
                                  <p className="text-sm text-slate-300 leading-relaxed italic">
                                     "{intelligence.strategyAdvice}"
                                  </p>
                               </div>
                            </div>
                         )}
                      </div>
                   </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col h-fit sticky top-24">
                   <div className="mb-10">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">
                               {selectedListing.category_name}
                            </span>
                            <h1 className="text-4xl font-black text-slate-800">{selectedListing.title}</h1>
                         </div>
                         <div className="text-right">
                            <div className="text-3xl font-black text-emerald-600">₦{selectedListing.price_per_unit.toLocaleString()}</div>
                            <div className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">per {selectedListing.unit}</div>
                         </div>
                      </div>
                      <p className="text-slate-500 leading-relaxed text-lg">{selectedListing.description}</p>
                   </div>

                   <div className="space-y-6 flex-1 mb-10">
                      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                         <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-50">
                            <NavIcon className="w-6 h-6 text-emerald-600" />
                         </div>
                         <div>
                            <div className="text-xs text-slate-400 font-bold uppercase">Location</div>
                            <div className="text-slate-800 font-bold">{selectedListing.location_name}</div>
                         </div>
                      </div>
                   </div>

                   <button onClick={() => handleBuy(selectedListing)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center gap-3">
                      <ShoppingBag className="w-6 h-6" /> Place Order
                   </button>
                </div>
             </div>
           </div>
        )}

        {/* SELL ROUTE (CREATE) */}
        {route === AppRoute.CREATE && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-black text-slate-800">List Your Harvest</h1>
                <p className="text-slate-500">Farmers earn more when selling direct.</p>
              </div>
              <div className="bg-emerald-100 p-4 rounded-3xl text-emerald-700">
                <PlusCircle className="w-8 h-8" />
              </div>
            </div>

            <form onSubmit={handleCreateListing} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-widest px-2">Produce Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Red Bell Peppers"
                    className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    value={newListing.title}
                    onChange={(e) => setNewListing({...newListing, title: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-widest px-2">Category</label>
                  <select 
                    className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    value={newListing.category}
                    onChange={(e) => setNewListing({...newListing, category: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-widest px-2">Price (₦)</label>
                  <input 
                    type="number" 
                    placeholder="5000"
                    className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    value={newListing.price}
                    onChange={(e) => setNewListing({...newListing, price: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-widest px-2">Per Unit</label>
                  <select 
                    className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    value={newListing.unit}
                    onChange={(e) => setNewListing({...newListing, unit: e.target.value})}
                  >
                    <option value="basket">Basket</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="tuber">Tuber</option>
                    <option value="crate">Crate</option>
                    <option value="bag">50kg Bag</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-widest px-2">Quantity</label>
                  <input 
                    type="number" 
                    placeholder="20"
                    className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    value={newListing.quantity}
                    onChange={(e) => setNewListing({...newListing, quantity: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-widest px-2">Smart Description (AI Powered)</label>
                  <button 
                    type="button" 
                    onClick={handleGenerateAiDescription}
                    disabled={isGenerating}
                    className="flex items-center gap-2 text-emerald-600 font-bold text-xs hover:bg-emerald-50 px-3 py-1 rounded-full transition-all"
                  >
                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Auto-Generate
                  </button>
                </div>
                <textarea 
                  placeholder="Tell buyers about your harvest methods, freshness, and quality..."
                  rows={4}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  value={aiSuggestions?.description || ""}
                  onChange={(e) => setAiSuggestions({...aiSuggestions, description: e.target.value})}
                ></textarea>
                {aiSuggestions?.suggestedPriceRange && (
                  <div className="bg-blue-50 text-blue-700 p-4 rounded-2xl text-xs font-medium">
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    Market Insight: Recommended price range for this item is {aiSuggestions.suggestedPriceRange}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-3xl transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3"
              >
                Launch Listing
              </button>
            </form>
          </div>
        )}

        {/* ORDERS ROUTE */}
        {route === AppRoute.ORDERS && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex justify-between items-center">
                <h1 className="text-4xl font-black text-slate-800">Your Trade History</h1>
                <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm text-sm font-bold text-slate-500">
                   Total Volume: {formatCurrency(totalRevenue)}
                </div>
             </div>

             <div className="grid gap-6">
                {orders.map(order => (
                  <div key={order.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
                    <img src={order.image} className="w-24 h-24 rounded-3xl object-cover shadow-sm" />
                    <div className="flex-1 space-y-4 w-full">
                       <div className="flex justify-between items-start">
                          <div>
                             <h3 className="text-xl font-black text-slate-800">{order.listing_title}</h3>
                             <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Order #{order.id}</p>
                          </div>
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {order.status}
                          </span>
                       </div>
                       <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                          <div>
                             <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Transaction Total</span>
                             <span className="text-slate-800 font-black text-lg">{formatCurrency(order.total_price)}</span>
                          </div>
                          <div>
                             <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Hub Fee</span>
                             <span className="text-rose-500 font-bold">{formatCurrency(order.platform_fee)}</span>
                          </div>
                          <div>
                             <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Farmer Settlement</span>
                             <span className="text-emerald-600 font-bold">{formatCurrency(order.seller_net)}</span>
                          </div>
                          <div>
                             <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Date</span>
                             <span className="text-slate-800 font-bold">{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                       </div>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                     <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                     <h3 className="text-xl font-bold text-slate-800">No orders yet</h3>
                     <p className="text-slate-500 mt-2">Browse the market and start trading!</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {/* ACCOUNT ROUTE (PROFILE) */}
        {route === AppRoute.PROFILE && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <h1 className="text-4xl font-black text-slate-800">Profile Dashboard</h1>
            
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="w-40 h-40 rounded-[3rem] bg-emerald-100 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
                     <img src={`https://i.pravatar.cc/150?u=${currentUser.id}`} className="w-full h-full object-cover" alt={currentUser.name} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                     <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                        <span className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                           {currentUser.role}
                        </span>
                        <span className="bg-slate-100 text-slate-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                           {currentUser.status}
                        </span>
                     </div>
                     <h2 className="text-4xl font-black text-slate-800 mb-2">{currentUser.name}</h2>
                     <p className="text-slate-500 mb-6 font-medium">{currentUser.email}</p>
                     
                     <div className="flex gap-4 justify-center md:justify-start">
                        <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-lg shadow-slate-200">
                           <Settings className="w-4 h-4" /> Edit Profile
                        </button>
                        <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all">
                           <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-center">
                  <div className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-2">Total Listings</div>
                  <div className="text-4xl font-black text-slate-800">14</div>
               </div>
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-center">
                  <div className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-2">Seller Rating</div>
                  <div className="text-4xl font-black text-emerald-600 flex items-center justify-center gap-2">
                     4.9 <Star className="w-6 h-6 fill-emerald-500 text-emerald-500" />
                  </div>
               </div>
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-center">
                  <div className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-2">Member Since</div>
                  <div className="text-xl font-black text-slate-800">Oct 2023</div>
               </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
               <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                  <CreditCard className="text-emerald-600" /> Payment Wallet (Naira)
               </h3>
               <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div>
                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Available Balance</div>
                     <div className="text-4xl font-black text-slate-800">₦245,600.00</div>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                     <button className="flex-1 md:flex-none bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-emerald-600/20 active:scale-[0.98]">Withdraw Funds</button>
                     <button className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-black text-sm shadow-sm active:scale-[0.98]">Transaction History</button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* ADMIN ROUTE */}
        {route === AppRoute.ADMIN && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black text-slate-800">Admin Command Center</h1>
                <p className="text-slate-500">System revenue: {formatCurrency(platformEarnings)}</p>
              </div>
              <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                <button 
                  onClick={() => setAdminSubTab('analytics')}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${adminSubTab === 'analytics' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Analytics
                </button>
                <button 
                  onClick={() => setAdminSubTab('users')}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${adminSubTab === 'users' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  User Mgmt
                </button>
              </div>
            </div>

            {adminSubTab === 'analytics' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   {[
                     { label: "Volume (₦)", val: totalRevenue.toLocaleString(), icon: <TrendingUp className="text-emerald-500" /> },
                     { label: "Platform Cut", val: platformEarnings.toLocaleString(), icon: <BarChart3 className="text-blue-500" /> },
                     { label: "Total Users", val: users.length, icon: <Users className="text-purple-500" /> },
                     { label: "Active Orders", val: orders.length, icon: <Package className="text-orange-500" /> }
                   ].map((s, i) => (
                     <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">{s.icon}</div>
                        <div className="text-2xl font-black text-slate-800">{s.val}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</div>
                     </div>
                   ))}
                </div>
            )}

            {adminSubTab === 'users' && (
                <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-100">
                         <tr>
                            <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase">User</th>
                            <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                            <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase text-right">Action</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {users.map(u => (
                           <tr key={u.id}>
                              <td className="px-8 py-6">
                                 <div className="font-bold text-slate-800">{u.name}</div>
                                 <div className="text-xs text-slate-400">{u.email}</div>
                              </td>
                              <td className="px-8 py-6">
                                 <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${u.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                    {u.status}
                                 </span>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 {u.status === 'active' ? (
                                   <button onClick={() => handleUpdateUserStatus(u.id, 'banned')} className="flex items-center gap-2 ml-auto text-rose-600 font-bold text-xs hover:bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 transition-all">
                                      <Ban className="w-3.5 h-3.5" /> Suspend
                                   </button>
                                 ) : (
                                   <button onClick={() => handleUpdateUserStatus(u.id, 'active')} className="flex items-center gap-2 ml-auto text-emerald-600 font-bold text-xs hover:bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 transition-all">
                                      <UserPlus className="w-3.5 h-3.5" /> Restore
                                   </button>
                                 )}
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}
          </div>
        )}

        {/* AI ADVISOR ROUTE */}
        {route === AppRoute.AI_ADVISOR && (
           <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
              <div className="bg-emerald-900 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
                 <div className="relative z-10">
                    <h1 className="text-4xl font-black mb-4">Agri-Advisor AI</h1>
                    <p className="text-emerald-100 opacity-70 mb-8">Expert guidance on Nigerian soil, pricing, and timing.</p>
                    <div className="flex gap-4">
                       <input 
                         value={advisorQuery}
                         onChange={(e) => setAdvisorQuery(e.target.value)}
                         placeholder="Ask about fertilizer, market prices..." 
                         className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-emerald-200/40" 
                       />
                       <button onClick={async () => {
                         setIsAdvisorLoading(true);
                         const r = await getMarketAdvice(advisorQuery);
                         setAdvisorResponse(r || "");
                         setIsAdvisorLoading(false);
                       }} className="bg-emerald-500 hover:bg-emerald-400 px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all">
                          {isAdvisorLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                       </button>
                    </div>
                 </div>
              </div>
              {advisorResponse && (
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm prose max-w-none">
                   <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                      <Sparkles className="text-emerald-500" /> AI Insights
                   </h2>
                   <p className="whitespace-pre-wrap text-slate-600 leading-relaxed text-lg">{advisorResponse}</p>
                </div>
              )}
           </div>
        )}

        {/* GROUPS ROUTE */}
        {route === AppRoute.GROUPS && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-4xl font-black text-slate-800">Regional Hubs</h1>
                <p className="text-slate-500">Farmers collectives managed by trusted ambassadors.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
              {groups.map(group => (
                <div key={group.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-sm group hover:shadow-xl transition-all">
                  <div className="relative h-64">
                    <img src={group.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={group.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">
                        <Globe className="w-3 h-3" />
                        {group.location}
                      </div>
                      <h2 className="text-3xl font-black">{group.name}</h2>
                    </div>
                  </div>
                  <div className="p-8">
                    <p className="text-slate-500 mb-8 leading-relaxed">
                      {group.description}
                    </p>
                    <div className="flex items-center justify-between py-6 border-y border-slate-50 mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                           {group.ambassador_name[0]}
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 font-bold uppercase">Ambassador</div>
                          <div className="text-slate-800 font-bold">{group.ambassador_name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400 font-bold uppercase">Members</div>
                        <div className="text-emerald-600 font-black text-xl">{group.member_count}</div>
                      </div>
                    </div>
                    <button className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98]">
                      View Hub Market
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
