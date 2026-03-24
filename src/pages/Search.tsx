import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { dbService } from '../services/db';
import { WorkerProfile } from '../types';
import { Search as SearchIcon, MapPin, Star, Filter, Hammer, X, Phone, User } from 'lucide-react';
import { where, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { AP_DISTRICTS, NELLORE_AREAS } from '../lib/constants';

const categories = [
  { name: 'All', slug: 'all' },
  { name: 'Construction', slug: 'construction' },
  { name: 'Painting', slug: 'painting' },
  { name: 'Woodwork', slug: 'woodwork' },
  { name: 'Granite & Tiles', slug: 'granite-tiles' },
  { name: 'Interior Works', slug: 'interior' },
  { name: 'Plumbing', slug: 'plumbing' },
  { name: 'Electrical', slug: 'electrical' },
  { name: 'Cleaning', slug: 'cleaning' },
  { name: 'Borewell', slug: 'borewell' },
  { name: 'AC & Fridge', slug: 'ac-fridge' },
  { name: 'Water Purifier', slug: 'water-purifier' },
];

const locations = [
  'All Nellore',
  'Nellore City',
  'Kavali',
  'Gudur',
  'Venkatagiri',
  'Atmakur',
  'Sullurpeta',
  'Naidupeta',
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const categoryFilter = searchParams.get('category') || 'all';
  const districtFilter = searchParams.get('district') || 'Sri Potti Sriramulu Nellore';
  const locationFilter = searchParams.get('location') || 'All';
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      const constraints: any[] = [where('status', '==', 'active')];
      
      if (categoryFilter !== 'all') {
        constraints.push(where('category', '==', categoryFilter));
      }
      
      if (districtFilter !== 'All AP') {
        constraints.push(where('district', '==', districtFilter));
      }

      if (locationFilter !== 'All') {
        constraints.push(where('location', '==', locationFilter));
      }

      const results = await dbService.getDocs<WorkerProfile>('workers', constraints);
      
      // Client-side search for name/bio
      let filtered = results;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = results.filter(w => 
          w.name.toLowerCase().includes(q) || 
          w.bio.toLowerCase().includes(q)
        );
      }

      setWorkers(filtered);
      setLoading(false);
    };

    fetchWorkers();
  }, [categoryFilter, districtFilter, locationFilter, searchQuery]);

  const handleCategoryChange = (slug: string) => {
    setSearchParams(prev => {
      if (slug === 'all') prev.delete('category');
      else prev.set('category', slug);
      return prev;
    });
  };

  const handleDistrictChange = (dist: string) => {
    setSearchParams(prev => {
      if (dist === 'All AP') prev.delete('district');
      else prev.set('district', dist);
      prev.delete('location'); // Reset location when district changes
      return prev;
    });
  };

  const handleLocationChange = (loc: string) => {
    setSearchParams(prev => {
      if (loc === 'All') prev.delete('location');
      else prev.set('location', loc);
      return prev;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden md:block w-64 space-y-8">
          <div>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-orange-600" />
              Categories
            </h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={cn(
                    "w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    categoryFilter === cat.slug 
                      ? "bg-orange-600 text-white shadow-md" 
                      : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-600" />
              District
            </h3>
            <select
              value={districtFilter}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold mb-6"
            >
              <option value="All AP">All Andhra Pradesh</option>
              {AP_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            {districtFilter === 'Sri Potti Sriramulu Nellore' && (
              <>
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  Area in Nellore
                </h3>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  <button
                    onClick={() => handleLocationChange('All')}
                    className={cn(
                      "w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      locationFilter === 'All' 
                        ? "bg-orange-600 text-white shadow-md" 
                        : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                    )}
                  >
                    All Areas
                  </button>
                  {NELLORE_AREAS.map(loc => (
                    <button
                      key={loc}
                      onClick={() => handleLocationChange(loc)}
                      className={cn(
                        "w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        locationFilter === loc 
                          ? "bg-orange-600 text-white shadow-md" 
                          : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                      )}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow">
          {/* Search Bar */}
          <div className="relative mb-8">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, skill, or service..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchParams(prev => {
                if (e.target.value) prev.set('q', e.target.value);
                else prev.delete('q');
                return prev;
              })}
            />
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden overflow-hidden mb-8 space-y-6 bg-gray-50 p-6 rounded-2xl"
              >
                <div>
                  <h4 className="font-bold mb-3">Category</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat.slug}
                        onClick={() => handleCategoryChange(cat.slug)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                          categoryFilter === cat.slug ? "bg-orange-600 text-white" : "bg-white text-gray-600 border border-gray-200"
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-3">District</h4>
                  <select
                    value={districtFilter}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  >
                    <option value="All AP">All Andhra Pradesh</option>
                    {AP_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                {districtFilter === 'Sri Potti Sriramulu Nellore' && (
                  <div>
                    <h4 className="font-bold mb-3">Area</h4>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      <button
                        onClick={() => handleLocationChange('All')}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                          locationFilter === 'All' ? "bg-orange-600 text-white" : "bg-white text-gray-600 border border-gray-200"
                        )}
                      >
                        All Areas
                      </button>
                      {NELLORE_AREAS.map(loc => (
                        <button
                          key={loc}
                          onClick={() => handleLocationChange(loc)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                            locationFilter === loc ? "bg-orange-600 text-white" : "bg-white text-gray-600 border border-gray-200"
                          )}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-gray-100 animate-pulse h-80 rounded-2xl" />
              ))}
            </div>
          ) : workers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workers.map((worker) => (
                <motion.div
                  key={worker.uid}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col"
                >
                  <div className="h-40 bg-gray-100 relative overflow-hidden">
                    <img 
                      src={`https://picsum.photos/seed/${worker.uid}/800/600`} 
                      alt={worker.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    {worker.isFeatured && (
                      <div className="absolute top-3 right-3 bg-orange-600 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider shadow-lg">
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg leading-tight">{worker.name}</h3>
                        <p className="text-orange-600 font-bold text-xs uppercase tracking-wide">{worker.category.replace('-', ' ')}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-xs font-black">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        {worker.rating.toFixed(1)}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {worker.location}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        {worker.experience} Years Experience
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-end">
                      <Link 
                        to={`/worker/${worker.uid}`}
                        className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <SearchIcon className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No workers found</h3>
              <p className="text-gray-500">Try adjusting your filters or search query.</p>
              <button 
                onClick={() => setSearchParams({})}
                className="mt-6 text-orange-600 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

import { cn } from '../lib/utils';
