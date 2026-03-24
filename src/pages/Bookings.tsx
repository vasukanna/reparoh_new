import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { Booking } from '../types';
import { where, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, User, CheckCircle2, XCircle, Clock4, MessageSquare, Phone, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function Bookings() {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = dbService.onSnapshot<Booking>(
      'bookings',
      [where('customerId', '==', user.uid), orderBy('createdAt', 'desc')],
      (data) => {
        setBookings(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await dbService.updateDoc('bookings', bookingId, { status: 'cancelled' });
      toast.success('Booking cancelled');
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'accepted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock4 className="w-4 h-4" />;
      case 'accepted': return <CheckCircle2 className="w-4 h-4" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock4 className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-bold">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-slate-900">My Bookings</h1>
        <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-xl font-bold text-sm border border-orange-100">
          {bookings.length} Total Bookings
        </div>
      </div>

      {bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex gap-6">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0">
                      <img 
                        src={`https://picsum.photos/seed/${booking.workerId}/200/200`} 
                        alt={booking.workerName} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-black text-slate-900">{booking.workerName}</h3>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5",
                          getStatusColor(booking.status)
                        )}>
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-orange-600 font-bold text-sm uppercase tracking-wide mb-4">{booking.category.replace('-', ' ')}</p>
                      
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-bold text-slate-700">{format(new Date(booking.date), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="font-bold text-slate-700">{booking.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center gap-3">
                    {booking.status === 'pending' && (
                      <button 
                        onClick={() => handleCancel(booking.id!)}
                        className="px-6 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all border border-red-100"
                      >
                        Cancel Booking
                      </button>
                    )}
                    {booking.status === 'accepted' && (
                      <div className="flex gap-2">
                        <button className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all border border-green-100">
                          <Phone className="w-5 h-5" />
                        </button>
                        <button className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all border border-blue-100">
                          <MessageSquare className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    {booking.status === 'completed' && (
                      <button className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 transition-all shadow-lg">
                        <Star className="w-4 h-4" />
                        Rate Worker
                      </button>
                    )}
                  </div>
                </div>

                {booking.notes && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Your Notes</p>
                    <p className="text-gray-600 text-sm italic">"{booking.notes}"</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Calendar className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings yet</h3>
          <p className="text-gray-500">When you book a worker, it will appear here.</p>
          <Link 
            to="/search" 
            className="mt-6 inline-block bg-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-orange-700 transition-all"
          >
            Find Workers
          </Link>
        </div>
      )}
    </div>
  );
}

import { cn } from '../lib/utils';
