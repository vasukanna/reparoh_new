export type UserRole = 'customer' | 'worker' | 'admin';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
  phoneNumber?: string;
  location?: string;
}

export interface WorkerProfile {
  uid: string;
  name: string;
  category: string;
  experience: number;
  location: string;
  district: string;
  phone: string;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  bio: string;
  status: 'active' | 'suspended';
}

export interface Booking {
  id?: string;
  customerId: string;
  workerId: string;
  category: string;
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  createdAt: string;
  customerName: string;
  workerName: string;
  notes?: string;
}

export interface Review {
  id?: string;
  workerId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Category {
  id?: string;
  name: string;
  icon: string;
  slug: string;
}
