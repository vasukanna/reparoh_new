import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dbService } from '../services/db';
import { WorkerProfile, Review, Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { Star, MapPin, Phone, MessageSquare, Calendar, ShieldCheck, User, Clock, CheckCircle2, ChevronRight, Share2, Heart, Award, Trash2, Edit, XCircle } from 'lucide-react';
import { where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { AP_DISTRICTS, NELLORE_AREAS } from '../lib/constants';

export default function WorkerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile, login } = useAuth();
  const navigate = useNavigate();
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [bookingTime, setBookingTime] = useState('09:00');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [hasBooked, setHasBooked] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editData, setEditData] = useState<Partial<WorkerProfile>>({});

  useEffect(() => {
    const fetchWorkerData = async () => {
      if (!id) return;
      setLoading(true);
      const workerData = await dbService.getDoc<WorkerProfile>('workers', id);
      if (workerData) {
        setWorker(workerData);
        const reviewsData = await dbService.getDocs<Review>('reviews', [
          where('workerId', '==', id),
          orderBy('createdAt', 'desc'),
          limit(10)
        ]);
        setReviews(reviewsData);
      }

      if (user) {
        const userBookings = await dbService.getDocs<Booking>('bookings', [
          where('customerId', '==', user.uid),
          where('workerId', '==', id)
        ]);
        if (userBookings.length > 0) {
          setHasBooked(true);
        }
      }

      setLoading(false);
    };

    fetchWorkerData();
  }, [id, user]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to book a worker');
      login();
      return;
    }

    if (!worker) return;

    setIsBooking(true);
    try {
      const newBooking: Booking = {
        customerId: user.uid,
        workerId: worker.uid,
        category: worker.category,
        date: bookingDate,
        time: bookingTime,
        status: 'pending',
        createdAt: new Date().toISOString(),
        customerName: user.displayName || 'Anonymous',
        workerName: worker.name,
        notes: bookingNotes,
      };

      await dbService.addDoc('bookings', newBooking);
      toast.success('Booking request sent successfully!');
      
      // Open WhatsApp with booking details
      const message = `Hi ${worker.name}, I would like to book your ${worker.category.replace('-', ' ')} services on ${bookingDate} at ${bookingTime}. ${bookingNotes ? `Notes: ${bookingNotes}` : ''}`;
      const whatsappUrl = `https://wa.me/91${worker.phone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      navigate('/bookings');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to send booking request');
    } finally {
      setIsBooking(false);
    }
  };

  const handleDeleteWorker = async () => {
    try {
      await dbService.deleteDoc('workers', worker!.uid);
      toast.success('Worker profile deleted successfully');
      navigate('/search');
    } catch (error) {
      toast.error('Failed to delete worker profile');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleEditWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worker) return;
    try {
      await dbService.updateDoc('workers', worker.uid, editData);
      setWorker({ ...worker, ...editData } as WorkerProfile);
      setShowEditModal(false);
      toast.success('Worker profile updated successfully');
    } catch (error) {
      toast.error('Failed to update worker profile');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-bold">Loading profile...</p>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Worker not found</h2>
        <Link to="/search" className="text-orange-600 font-bold hover:underline">Back to search</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header / Cover */}
      <div className="h-64 bg-slate-900 relative overflow-hidden">
        <img 
          src={`https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=2000`} 
          alt="Cover" 
          className="w-full h-full object-cover opacity-40"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl flex-shrink-0">
                  <img 
                    src={`https://picsum.photos/seed/${worker.uid}/400/400`} 
                    alt={worker.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-3xl font-black text-slate-900">{worker.name}</h1>
                    {worker.isFeatured && (
                      <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider">
                        Featured Expert
                      </span>
                    )}
                  </div>
                  <p className="text-orange-600 font-bold text-lg mb-4 uppercase tracking-wide">{worker.category.replace('-', ' ')}</p>
                  
                  <div className="flex flex-wrap gap-6 text-gray-600 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">{worker.location}, {worker.district}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-slate-900">{worker.rating.toFixed(1)}</span>
                      <span className="text-gray-400">({worker.reviewCount} Reviews)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">{worker.experience} Years Exp.</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-gray-700 font-bold hover:bg-gray-200 transition-all text-sm">
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-gray-700 font-bold hover:bg-gray-200 transition-all text-sm">
                      <Heart className="w-4 h-4" />
                      Save
                    </button>
                    {profile?.role === 'admin' && (
                      <>
                        <button 
                          onClick={() => {
                            setEditData(worker);
                            setShowEditModal(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-xl text-blue-700 font-bold hover:bg-blue-200 transition-all text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Worker
                        </button>
                        <button 
                          onClick={() => setShowDeleteModal(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-100 rounded-xl text-red-700 font-bold hover:bg-red-200 transition-all text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Worker
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <User className="w-6 h-6 text-orange-600" />
                  About Professional
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {worker.bio || `Skilled professional with ${worker.experience} years of experience in ${worker.category}. Providing high-quality services in ${worker.location} and surrounding areas.`}
                </p>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
                <Star className="w-6 h-6 text-orange-600" />
                Customer Reviews
              </h3>
              
              {reviews.length > 0 ? (
                <div className="space-y-8">
                  {reviews.map(review => (
                    <div key={review.id} className="border-b border-gray-50 pb-8 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
                            {review.customerName[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{review.customerName}</h4>
                            <p className="text-xs text-gray-400">{format(new Date(review.createdAt), 'MMM d, yyyy')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-xs font-black">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          {review.rating}
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-500 font-bold">No reviews yet for this professional.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Booking Widget */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-orange-100 sticky top-24">
              <div className="flex justify-between items-center mb-8">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Book Service</span>
              </div>

              <form onSubmit={handleBooking} className="space-y-6">
                <div>
                  <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">Select Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="date" 
                      required
                      min={format(new Date(), 'yyyy-MM-dd')}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">Select Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select 
                      required
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold appearance-none"
                    >
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">Notes (Optional)</label>
                  <textarea 
                    placeholder="Briefly describe your requirements..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium h-24 resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isBooking}
                  className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isBooking ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      Book Now
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-4 text-gray-500 mb-4">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest">Direct Contact</p>
                    <p className="text-slate-900 font-black">
                      {hasBooked ? `+91 ${worker.phone}` : `+91 ${worker.phone.slice(0, 5)}*****`}
                    </p>
                  </div>
                </div>
                {!hasBooked && (
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Phone number will be fully visible after you book this professional.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl text-white">
              <h4 className="font-black text-lg mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-orange-500" />
                ReparoH Guarantee
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                All our featured professionals are verified for background. We ensure you get the best service.
              </p>
              <Link to="/about" className="text-orange-500 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                Learn more about our verification <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Worker Modal */}
      {showEditModal && profile?.role === 'admin' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900">Edit Worker Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditWorker} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={editData.name || ''}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">Category</label>
                  <select 
                    required
                    value={editData.category || ''}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  >
                    <option value="construction">Construction</option>
                    <option value="painting">Painting</option>
                    <option value="woodwork">Woodwork</option>
                    <option value="granite-tiles">Granite & Tiles</option>
                    <option value="interior">Interior Works</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="borewell">Borewell</option>
                    <option value="ac-fridge">AC & Fridge</option>
                    <option value="water-purifier">Water Purifier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">Experience (Years)</label>
                  <input 
                    type="number" 
                    required
                    value={editData.experience || 0}
                    onChange={(e) => setEditData({ ...editData, experience: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">District</label>
                  <select 
                    required
                    value={editData.district || ''}
                    onChange={(e) => setEditData({ ...editData, district: e.target.value, location: '' })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  >
                    <option value="">Select District</option>
                    {AP_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">Location / Area</label>
                  {editData.district === 'Sri Potti Sriramulu Nellore' ? (
                    <select 
                      required
                      value={editData.location || ''}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                    >
                      <option value="">Select Area</option>
                      {NELLORE_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      required
                      value={editData.location || ''}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">Bio / Description</label>
                <textarea 
                  value={editData.bio || ''}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium h-24 resize-none"
                />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Worker Modal */}
      {showDeleteModal && profile?.role === 'admin' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
            <button 
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                <Trash2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Delete Worker?</h2>
              <p className="text-gray-600 mb-8">
                Are you sure you want to delete this worker profile? This action cannot be undone and all data will be permanently removed.
              </p>
              <div className="flex w-full gap-4">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteWorker}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
