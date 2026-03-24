import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { WorkerProfile, Booking } from '../types';
import { where, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  Clock4, 
  Phone, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Star,
  Settings,
  Briefcase
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function WorkerDashboard() {
  const { user, profile } = useAuth();
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchWorker = async () => {
      const data = await dbService.getDoc<WorkerProfile>('workers', user.uid);
      setWorker(data);
    };

    const unsubscribe = dbService.onSnapshot<Booking>(
      'bookings',
      [where('workerId', '==', user.uid), orderBy('createdAt', 'desc')],
      (data) => {
        setBookings(data);
        setLoading(false);
      }
    );

    fetchWorker();
    return () => unsubscribe();
  }, [user]);

  const handleStatusUpdate = async (bookingId: string, status: Booking['status']) => {
    try {
      await dbService.updateDoc('bookings', bookingId, { status });
      toast.success(`Booking ${status}`);
    } catch (error) {
      toast.error('Failed to update booking status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-bold">Loading dashboard...</p>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Worker Profile Required</h2>
        <p className="text-gray-600 mb-8">Please complete your worker profile to start receiving bookings.</p>
        <Link to="/profile" className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg">Complete Profile</Link>
      </div>
    );
  }

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'text-blue-600 bg-blue-50' },
    { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, icon: Clock4, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
    { label: 'Rating', value: worker.rating.toFixed(1), icon: Star, color: 'text-orange-600 bg-orange-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Worker Dashboard</h1>
          <p className="text-gray-500 font-medium flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Welcome back, {worker.name}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/profile" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-all shadow-sm">
            <Settings className="w-4 h-4" />
            Edit Profile
          </Link>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-xl text-green-700 font-bold">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Active
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-orange-600" />
            Recent Booking Requests
          </h2>

          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 font-black text-lg">
                        {booking.customerName[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{booking.customerName}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-xs text-gray-500 font-bold">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(booking.date), 'MMM d')}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 font-bold">
                            <Clock className="w-3 h-3" />
                            {booking.time}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {booking.status === 'pending' ? (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(booking.id!, 'accepted')}
                            className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-lg"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(booking.id!, 'rejected')}
                            className="px-4 py-2 bg-white border border-red-100 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 transition-all"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <div className={cn(
                          "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border",
                          booking.status === 'accepted' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                          booking.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' :
                          'bg-gray-50 text-gray-500 border-gray-100'
                        )}>
                          {booking.status}
                        </div>
                      )}
                      
                      {booking.status === 'accepted' && (
                        <button 
                          onClick={() => handleStatusUpdate(booking.id!, 'completed')}
                          className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg"
                        >
                          Mark Done
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {booking.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-xl text-sm text-gray-600 italic">
                      "{booking.notes}"
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500 font-bold">No bookings found yet.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-slate-900 p-8 rounded-3xl text-white">
            <h3 className="font-black text-lg mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-orange-500" />
              Quick Actions
            </h3>
            <div className="space-y-4">
              <button className="w-full text-left p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10 group">
                <p className="font-bold text-sm group-hover:text-orange-500 transition-colors">Featured Listing</p>
                <p className="text-xs text-gray-400">Get 5x more bookings</p>
              </button>
              <button className="w-full text-left p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10 group">
                <p className="font-bold text-sm group-hover:text-orange-500 transition-colors">Support</p>
                <p className="text-xs text-gray-400">Contact admin for help</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
