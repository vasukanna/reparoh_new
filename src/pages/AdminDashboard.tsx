import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { UserProfile, WorkerProfile, Booking } from '../types';
import { orderBy, limit, where } from 'firebase/firestore';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  Trash2, 
  AlertCircle, 
  Search, 
  Filter, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock4,
  LayoutDashboard,
  Settings,
  PieChart,
  BarChart3,
  Star
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'workers' | 'bookings'>('overview');
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState<string | null>(null);
  const [newWorker, setNewWorker] = useState<Partial<WorkerProfile>>({
    name: '',
    category: 'construction',
    experience: 0,
    location: 'Nellore City',
    district: 'Sri Potti Sriramulu Nellore',
    phone: '',
    bio: '',
  });

  useEffect(() => {
    if (profile?.role !== 'admin') return;

    const fetchData = async () => {
      setLoading(true);
      const [usersData, workersData, bookingsData] = await Promise.all([
        dbService.getDocs<UserProfile>('users', [orderBy('createdAt', 'desc'), limit(50)]),
        dbService.getDocs<WorkerProfile>('workers', [orderBy('rating', 'desc'), limit(50)]),
        dbService.getDocs<Booking>('bookings', [orderBy('createdAt', 'desc'), limit(50)])
      ]);
      setUsers(usersData);
      setWorkers(workersData);
      setBookings(bookingsData);
      setLoading(false);
    };

    fetchData();
  }, [profile]);

  const handleDeleteWorker = async (workerId: string) => {
    try {
      await dbService.deleteDoc('workers', workerId);
      setWorkers(prev => prev.filter(w => w.uid !== workerId));
      setWorkerToDelete(null);
      toast.success('Worker removed successfully');
    } catch (error) {
      toast.error('Failed to remove worker');
    }
  };

  const handleSuspendWorker = async (workerId: string, status: 'active' | 'suspended') => {
    try {
      await dbService.updateDoc('workers', workerId, { status });
      setWorkers(prev => prev.map(w => w.uid === workerId ? { ...w, status } : w));
      toast.success(`Worker ${status}`);
    } catch (error) {
      toast.error('Failed to update worker status');
    }
  };

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const workerId = `manual_${Date.now()}`;
      const fullWorkerData: WorkerProfile = {
        uid: workerId,
        name: newWorker.name || '',
        category: newWorker.category || 'construction',
        experience: Number(newWorker.experience) || 0,
        location: newWorker.location || 'Nellore City',
        district: newWorker.district || 'Sri Potti Sriramulu Nellore',
        phone: newWorker.phone || '',
        rating: 5.0,
        reviewCount: 0,
        isFeatured: false,
        bio: newWorker.bio || '',
        status: 'active',
      };

      await dbService.setDoc('workers', workerId, fullWorkerData);
      setWorkers(prev => [fullWorkerData, ...prev]);
      setShowAddWorkerModal(false);
      setNewWorker({
        name: '',
        category: 'construction',
        experience: 0,
        location: 'Nellore City',
        district: 'Sri Potti Sriramulu Nellore',
        phone: '',
        bio: '',
      });
      toast.success('Worker added successfully');
    } catch (error) {
      toast.error('Failed to add worker');
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-slate-900 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-8">You do not have administrative privileges to access this panel.</p>
        <Link to="/" className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg">Back to Home</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-bold">Loading admin panel...</p>
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Active Workers', value: workers.filter(w => w.status === 'active').length, icon: Briefcase, color: 'text-green-600 bg-green-50' },
    { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'text-orange-600 bg-orange-50' },
    { label: 'Revenue (Est.)', value: `₹${bookings.filter(b => b.status === 'completed').length * 500}`, icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Nav */}
        <aside className="lg:w-64 space-y-2">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-900">Admin Panel</h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">ReparoH Control</p>
          </div>
          
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'users', label: 'Manage Users', icon: Users },
            { id: 'workers', label: 'Manage Workers', icon: Briefcase },
            { id: 'bookings', label: 'All Bookings', icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all",
                activeTab === tab.id 
                  ? "bg-orange-600 text-white shadow-lg" 
                  : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
              )}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
          
          <div className="pt-8 mt-8 border-t border-gray-100">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50">
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-12">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                    Recent Activity
                  </h3>
                  <div className="space-y-6">
                    {bookings.slice(0, 5).map(booking => (
                      <div key={booking.id} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-500">
                            {booking.customerName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{booking.customerName} booked {booking.workerName}</p>
                            <p className="text-xs text-gray-400">{format(new Date(booking.createdAt), 'MMM d, h:mm a')}</p>
                          </div>
                        </div>
                        <div className={cn(
                          "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                          booking.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                        )}>
                          {booking.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analytics Placeholder */}
                <div className="bg-slate-900 p-8 rounded-3xl text-white">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <PieChart className="w-6 h-6 text-orange-500" />
                    Category Distribution
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Construction', percent: 45 },
                      { name: 'Plumbing', percent: 25 },
                      { name: 'Electrical', percent: 20 },
                      { name: 'Others', percent: 10 },
                    ].map(item => (
                      <div key={item.name}>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span>{item.name}</span>
                          <span>{item.percent}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-600" style={{ width: `${item.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workers' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900">Manage Workers</h3>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Search workers..." 
                      className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <button 
                    onClick={() => setShowAddWorkerModal(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-orange-700 transition-all"
                  >
                    + Add Worker
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                      <th className="px-8 py-4">Worker</th>
                      <th className="px-8 py-4">Category</th>
                      <th className="px-8 py-4">Location</th>
                      <th className="px-8 py-4">Rating</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {workers.map(worker => (
                      <tr key={worker.uid} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                              <img src={`https://picsum.photos/seed/${worker.uid}/100/100`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{worker.name}</p>
                              <p className="text-xs text-gray-400">ID: {worker.uid.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-sm font-bold text-orange-600 uppercase tracking-wide">{worker.category}</td>
                        <td className="px-8 py-4 text-sm text-gray-600">{worker.location}</td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-1 text-yellow-600 font-bold text-sm">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            {worker.rating.toFixed(1)}
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className={cn(
                            "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                            worker.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                          )}>
                            {worker.status}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleSuspendWorker(worker.uid, worker.status === 'active' ? 'suspended' : 'active')}
                              className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                              title={worker.status === 'active' ? 'Suspend' : 'Activate'}
                            >
                              {worker.status === 'active' ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                            </button>
                            <button 
                              onClick={() => setWorkerToDelete(worker.uid)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Worker Modal */}
      {showAddWorkerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900">Add New Worker</h3>
              <button onClick={() => setShowAddWorkerModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddWorker} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={newWorker.name}
                    onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">Category</label>
                  <select 
                    required
                    value={newWorker.category}
                    onChange={(e) => setNewWorker({ ...newWorker, category: e.target.value })}
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
                    value={newWorker.phone}
                    onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">Experience (Years)</label>
                  <input 
                    type="number" 
                    required
                    value={newWorker.experience}
                    onChange={(e) => setNewWorker({ ...newWorker, experience: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">District</label>
                  <select 
                    required
                    value={newWorker.district}
                    onChange={(e) => setNewWorker({ ...newWorker, district: e.target.value, location: '' })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  >
                    <option value="">Select District</option>
                    {AP_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">Location / Area</label>
                  {newWorker.district === 'Sri Potti Sriramulu Nellore' ? (
                    <select 
                      required
                      value={newWorker.location}
                      onChange={(e) => setNewWorker({ ...newWorker, location: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                    >
                      <option value="">Select Area</option>
                      {NELLORE_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      required
                      value={newWorker.location}
                      onChange={(e) => setNewWorker({ ...newWorker, location: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">Bio / Description</label>
                <textarea 
                  value={newWorker.bio}
                  onChange={(e) => setNewWorker({ ...newWorker, bio: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium h-24 resize-none"
                />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddWorkerModal(false)}
                  className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg"
                >
                  Save Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {workerToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Delete Worker?</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to remove this worker? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setWorkerToDelete(null)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteWorker(workerToDelete)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { AP_DISTRICTS, NELLORE_AREAS } from '../lib/constants';
