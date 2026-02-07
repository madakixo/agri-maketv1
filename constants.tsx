
import React from 'react';
import { ShoppingBasket, Leaf, Carrot, Apple, Wheat, Coffee, Users, Truck, ShieldCheck } from 'lucide-react';
import { Category, ProduceListing, Review, Order, MarketGroup, User } from './types';

export const CATEGORIES: Category[] = [
  { id: 1, name: 'Vegetables', icon: 'carrot' },
  { id: 2, name: 'Fruits', icon: 'apple' },
  { id: 3, name: 'Grains', icon: 'wheat' },
  { id: 4, name: 'Tubers', icon: 'leaf' },
  { id: 5, name: 'Beverages', icon: 'coffee' },
];

export const MOCK_USERS: User[] = [
  { id: 1, name: "Samuel Adeboye", role: 'farmer', status: 'active', email: 'samuel@farm.ng', joined_date: '2023-10-12', income_level: 'middle' },
  { id: 101, name: "Green Valley Farm", role: 'farmer', status: 'active', email: 'gv@farm.ng', joined_date: '2023-01-15' },
  { id: 202, name: "John Buyer", role: 'buyer', status: 'active', email: 'john@market.ng', joined_date: '2024-02-20', income_level: 'high' },
  { id: 303, name: "Bad Actor", role: 'farmer', status: 'suspended', email: 'spam@bad.ng', joined_date: '2024-03-01' },
];

export const MOCK_GROUPS: MarketGroup[] = [
  {
    id: 1,
    name: "Lagos Central Organic Hub",
    location: "Ikeja, Lagos",
    ambassador_id: 501,
    ambassador_name: "Chief Tunde",
    member_count: 124,
    description: "A community marketplace focused on pesticide-free leafy greens and tubers.",
    image: "https://images.unsplash.com/photo-1488459711635-de86ed2fd9a4?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 2,
    name: "Riverside Grain Collective",
    location: "Port Harcourt",
    ambassador_id: 502,
    ambassador_name: "Mrs. Okoro",
    member_count: 89,
    description: "Direct supply of high-grade rice, maize and millet from the river basins.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400"
  }
];

export const MOCK_REVIEWS: Review[] = [
  { id: 1, listing_id: 1, user_name: "John Doe", rating: 5, comment: "Incredible tomatoes! So fresh and juicy.", date: "2024-05-20" },
  { id: 2, listing_id: 1, user_name: "Sarah M.", rating: 4, comment: "Very good quality, arrived on time.", date: "2024-05-18" },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 1001,
    listing_id: 2,
    listing_title: "Honeycrisp Apples",
    buyer_id: 1,
    seller_id: 102,
    quantity: 5,
    total_price: 120000,
    platform_fee: 4200, // 3.5%
    seller_net: 115800,
    status: 'delivered',
    created_at: "2024-05-10T14:00:00Z",
    image: "https://picsum.photos/seed/apple/200/200"
  },
  {
    id: 1002,
    listing_id: 1,
    listing_title: "Organic Vine Tomatoes",
    buyer_id: 1,
    seller_id: 101,
    quantity: 2,
    total_price: 65000,
    platform_fee: 1625, // 2.5%
    seller_net: 63375,
    status: 'shipped',
    created_at: "2024-05-21T09:30:00Z",
    image: "https://picsum.photos/seed/tomato/200/200"
  }
];

export const MOCK_LISTINGS: ProduceListing[] = [
  {
    id: 1,
    seller_id: 101,
    seller_name: "Green Valley Farm",
    category_id: 1,
    category_name: "Vegetables",
    title: "Organic Vine Tomatoes",
    description: "Bursting with flavor, these organic tomatoes are picked at peak ripeness. Perfect for salads, sauces, or snacks.",
    price_per_unit: 4500,
    unit: "basket",
    quantity_available: 50,
    location_name: "Ikeja, Lagos",
    distance: 2.5,
    market_group_id: 1,
    images: ["https://picsum.photos/seed/tomato/800/600"],
    harvest_date: "2024-05-15T00:00:00Z",
    created_at: "2024-05-16T10:30:00Z",
    rating: 4.8,
    review_count: 12,
    is_verified: true,
    verified_by: "QA Officer Sarah"
  },
  {
    id: 2,
    seller_id: 102,
    seller_name: "Sunnyside Orchards",
    category_id: 2,
    category_name: "Fruits",
    title: "Honeycrisp Apples",
    description: "Extra crunchy and sweet. Our Honeycrisp apples are cooled immediately after picking to lock in the freshness.",
    price_per_unit: 55000,
    unit: "crate",
    quantity_available: 200,
    location_name: "Ikorodu, Lagos",
    distance: 15.2,
    images: ["https://picsum.photos/seed/apple/800/600"],
    harvest_date: "2024-05-10T00:00:00Z",
    created_at: "2024-05-11T08:00:00Z",
    rating: 4.5,
    review_count: 8,
    is_verified: false
  },
  {
    id: 3,
    seller_id: 103,
    seller_name: "Golden Grain Estates",
    category_id: 3,
    category_name: "Grains",
    title: "Premium Basmati Rice",
    description: "Long-grain aromatic rice grown in silt-rich soil. Aged for 12 months for the best texture and fragrance.",
    price_per_unit: 85000,
    unit: "50kg Bag",
    quantity_available: 40,
    location_name: "Lekki, Lagos",
    distance: 25.8,
    images: ["https://picsum.photos/seed/rice/800/600"],
    harvest_date: "2024-04-20T00:00:00Z",
    created_at: "2024-04-25T14:20:00Z",
    rating: 5.0,
    review_count: 5,
    is_verified: true,
    verified_by: "Ministry of Agric"
  },
  {
    id: 4,
    seller_id: 104,
    seller_name: "Oyo Hills Produce",
    category_id: 4,
    category_name: "Tubers",
    title: "Fresh Yam Tubers",
    description: "Large, starch-rich yams straight from the fertile hills of Oyo. Harvested only 3 days ago.",
    price_per_unit: 12000,
    unit: "Large Tuber",
    quantity_available: 500,
    location_name: "Ibadan, Oyo",
    distance: 120.0,
    images: ["https://picsum.photos/seed/yam/800/600"],
    harvest_date: "2024-05-18T00:00:00Z",
    created_at: "2024-05-19T11:00:00Z",
    rating: 4.9,
    review_count: 22,
    is_verified: true,
    verified_by: "Admin Admin"
  }
];

export const getIcon = (name: string) => {
  switch(name) {
    case 'carrot': return <Carrot className="w-5 h-5" />;
    case 'apple': return <Apple className="w-5 h-5" />;
    case 'wheat': return <Wheat className="w-5 h-5" />;
    case 'leaf': return <Leaf className="w-5 h-5" />;
    case 'coffee': return <Coffee className="w-5 h-5" />;
    case 'users': return <Users className="w-5 h-5" />;
    case 'truck': return <Truck className="w-5 h-5" />;
    case 'shield': return <ShieldCheck className="w-5 h-5" />;
    default: return <ShoppingBasket className="w-5 h-5" />;
  }
};
