
export type UserStatus = 'active' | 'suspended' | 'banned';

export interface User {
  id: number;
  name: string;
  role: 'farmer' | 'buyer' | 'ambassador' | 'delivery' | 'regulator' | 'admin';
  rating?: number;
  status: UserStatus;
  email: string;
  joined_date: string;
  income_level?: 'low' | 'middle' | 'high';
}

export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: number;
  listing_id: number;
  listing_title: string;
  buyer_id: number;
  seller_id: number;
  quantity: number;
  total_price: number;
  platform_fee: number;
  seller_net: number;
  status: OrderStatus;
  created_at: string;
  image: string;
}

export interface MarketIntelligence {
  fairPrice: number;
  purchasingPowerScore: number; // 1-10
  locationContext: string;
  strategyAdvice: string;
  competitorPriceRange: string;
}

// Added Review interface to fix import errors in constants.tsx and App.tsx
export interface Review {
  id: number;
  listing_id: number;
  user_name: string;
  rating: number;
  comment: string;
  date: string;
}

// Added MarketGroup interface to fix import errors in constants.tsx and App.tsx
export interface MarketGroup {
  id: number;
  name: string;
  location: string;
  ambassador_id: number;
  ambassador_name: string;
  member_count: number;
  description: string;
  image: string;
}

export interface ProduceListing {
  id: number;
  seller_id: number;
  seller_name: string;
  category_id: number;
  category_name: string;
  title: string;
  description: string;
  price_per_unit: number;
  unit: string;
  quantity_available: number;
  location_name: string;
  distance: number; // Simulated distance in km from user
  market_group_id?: number;
  images: string[];
  harvest_date: string;
  created_at: string;
  rating?: number;
  review_count?: number;
  is_verified?: boolean;
  verified_by?: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
}

export enum AppRoute {
  HOME = 'home',
  LISTINGS = 'listings',
  CREATE = 'create',
  PROFILE = 'profile',
  AI_ADVISOR = 'ai-advisor',
  ORDERS = 'orders',
  GROUPS = 'groups',
  ADMIN = 'admin'
}
