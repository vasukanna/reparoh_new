import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { WorkerProfile, UserRole } from '../types';
import { User, Mail, Phone, MapPin, Briefcase, ShieldCheck, Camera, Save, Star, Award, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { AP_DISTRICTS, NELLORE_AREAS } from '../lib/constants';

export default function Profile() {
  const { user, profile, updateRole } = useAuth();
  const [searchParams] = useSearchParams();
  const [isWorker, setIsWorker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Worker Profile State
  const [workerData, setWorkerData] = useState<Partial<WorkerProfile>>({
    name: '',
    category: 'construction',
    experience: 0,
    location: 'Nellore City',
    district: 'Sri Potti Sriramulu Nellore',
    phone: '',
    bio: '',
  });

  useEffect(() => {
    if (searchParams.get('register') === 'true') {
      setIsWorker(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;

    const fetchWorkerProfile = async () => {
      const data = await dbService.getDoc<WorkerProfile>('workers', user.uid);
      if (data) {
        setWorkerData(data);
        setIsWorker(true);
      }
      setLoading(false);
    };

    fetchWorkerProfile();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const fullWorkerData: WorkerProfile = {
        uid: user.uid,
        name: workerData.name || user.displayName || '',
        category: workerData.category || 'construction',
        experience: Number(workerData.experience) || 0,
        location: workerData.location || 'Nellore City',
        district: workerData.district || 'Sri Potti Sriramulu Nellore',
        phone: workerData.phone || '',
        rating: workerData.rating || 5.0,
        reviewCount: workerData.reviewCount || 0,
        isFeatured: workerData.isFeatured || false,
        bio: workerData.bio || '',
        status: 'active',
      };

      await dbService.setDoc('workers', user.uid, fullWorkerData);
      if (profile?.role !== 'worker' && profile?.role !== 'admin') {
        await updateRole('worker');
      }
      setIsWorker(true);
      toast.success('Worker profile updated successfully!');
    } catch (error) {
      console.error('Profile save error:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-bold">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-12">
        <div className="h-32 bg-orange-600 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="relative group">
              <img 
                src={user?.photoURL || 'https://via.placeholder.com/150'} 
                alt="Profile" 
                className="w-24 h-24 rounded-3xl border-4 border-white shadow-xl object-cover"
                referrerPolicy="no-referrer"
              />
              <button className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
        <div className="pt-16 pb-8 px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900">{user?.displayName}</h1>
              <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
              <div className="flex gap-2 mt-4">
                <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-black uppercase tracking-wider border border-orange-100">
                  {profile?.role}
                </span>
                {isWorker && (
                  <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-black uppercase tracking-wider border border-green-100">
                    Verified Worker
                  </span>
                )}
              </div>
            </div>
            {!isWorker && (
              <button 
                onClick={() => setIsWorker(true)}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2"
              >
                <Briefcase className="w-5 h-5" />
                Become a Worker
              </button>
            )}
          </div>
        </div>
      </div>

      {isWorker && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Worker Profile</h2>
              <p className="text-gray-500 text-sm font-medium">Manage your professional listing on ReparoH</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={workerData.name}
                    onChange={(e) => setWorkerData({ ...workerData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">Category</label>
                  <select 
                    required
                    value={workerData.category}
                    onChange={(e) => setWorkerData({ ...workerData, category: e.target.value })}
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
                    placeholder="+91 00000 00000"
                    value={workerData.phone}
                    onChange={(e) => setWorkerData({ ...workerData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">District</label>
                  <select 
                    required
                    value={workerData.district}
                    onChange={(e) => setWorkerData({ ...workerData, district: e.target.value, location: '' })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  >
                    <option value="">Select District</option>
                    {AP_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">Location / Area</label>
                  {workerData.district === 'Sri Potti Sriramulu Nellore' ? (
                    <select 
                      required
                      value={workerData.location}
                      onChange={(e) => setWorkerData({ ...workerData, location: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                    >
                      <option value="">Select Area</option>
                      {NELLORE_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      required
                      placeholder="Enter your city/area"
                      value={workerData.location}
                      onChange={(e) => setWorkerData({ ...workerData, location: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">Experience (Years)</label>
                  <input 
                    type="number" 
                    required
                    value={workerData.experience}
                    onChange={(e) => setWorkerData({ ...workerData, experience: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">Bio / Description</label>
                  <textarea 
                    value={workerData.bio}
                    onChange={(e) => setWorkerData({ ...workerData, bio: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium h-32 resize-none"
                    placeholder="Tell customers about your expertise..."
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100 flex justify-end">
              <button 
                type="submit"
                disabled={saving}
                className="bg-orange-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-orange-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    Save Worker Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}
