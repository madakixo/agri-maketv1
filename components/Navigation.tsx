
import React from 'react';
import { Home, Search, PlusCircle, User, Zap, ShoppingBag, Globe, LayoutDashboard } from 'lucide-react';
import { AppRoute } from '../types';

interface NavigationProps {
  currentRoute: AppRoute;
  setRoute: (route: AppRoute) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentRoute, setRoute }) => {
  const navItems = [
    { route: AppRoute.HOME, icon: <Home className="w-5 h-5" />, label: 'Home' },
    { route: AppRoute.LISTINGS, icon: <Search className="w-5 h-5" />, label: 'Market' },
    { route: AppRoute.GROUPS, icon: <Globe className="w-5 h-5" />, label: 'Groups' },
    { route: AppRoute.ORDERS, icon: <ShoppingBag className="w-5 h-5" />, label: 'Orders' },
    { route: AppRoute.AI_ADVISOR, icon: <Zap className="w-5 h-5 text-yellow-500" />, label: 'Advisor' },
    { route: AppRoute.CREATE, icon: <PlusCircle className="w-5 h-5" />, label: 'Sell' },
    { route: AppRoute.ADMIN, icon: <LayoutDashboard className="w-5 h-5 text-purple-500" />, label: 'Admin' },
    { route: AppRoute.PROFILE, icon: <User className="w-5 h-5" />, label: 'Account' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="hidden md:flex items-center space-x-2 text-emerald-600 font-bold text-xl cursor-pointer" onClick={() => setRoute(AppRoute.HOME)}>
            <div className="bg-emerald-100 p-1.5 rounded-lg">
              <PlusCircle className="w-6 h-6 rotate-45" />
            </div>
            <span>AgriMarket</span>
          </div>

          <div className="flex flex-1 justify-around md:flex-none md:space-x-4">
            {navItems.map((item) => (
              <button
                key={item.route}
                onClick={() => setRoute(item.route)}
                className={`flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  currentRoute === item.route 
                  ? 'text-emerald-600 font-semibold bg-emerald-50 md:bg-transparent' 
                  : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span className="text-[10px] md:text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
