import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hammer, Paintbrush, Trees, Grid, Home as HomeIcon, Droplets, Zap, Trash2, Drill, Search, Star, MapPin, ShieldCheck, Clock, Phone, Wind, GlassWater } from 'lucide-react';
import { motion } from 'motion/react';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';

const categories = [
  { name: 'Construction', icon: HomeIcon, slug: 'construction', color: 'bg-blue-50 text-blue-600' },
  { name: 'Painting', icon: Paintbrush, slug: 'painting', color: 'bg-pink-50 text-pink-600' },
  { name: 'Woodwork', icon: Drill, slug: 'woodwork', color: 'bg-amber-50 text-amber-600' },
  { name: 'Granite & Tiles', icon: Grid, slug: 'granite-tiles', color: 'bg-slate-50 text-slate-600' },
  { name: 'Interior Works', icon: Trees, slug: 'interior', color: 'bg-emerald-50 text-emerald-600' },
  { name: 'Plumbing', icon: Droplets, slug: 'plumbing', color: 'bg-cyan-50 text-cyan-600' },
  { name: 'Electrical', icon: Zap, slug: 'electrical', color: 'bg-yellow-50 text-yellow-600' },
  { name: 'Cleaning', icon: Trash2, slug: 'cleaning', color: 'bg-purple-50 text-purple-600' },
  { name: 'Borewell', icon: Drill, slug: 'borewell', color: 'bg-orange-50 text-orange-600' },
  { name: 'AC & Fridge', icon: Wind, slug: 'ac-fridge', color: 'bg-teal-50 text-teal-600' },
  { name: 'Water Purifier', icon: GlassWater, slug: 'water-purifier', color: 'bg-sky-50 text-sky-600' },
];

export default function Home() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleRegisterClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      await login();
      navigate('/profile?register=true');
    } else {
      navigate('/profile?register=true');
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
              Right Workers. <br />
              <span className="text-orange-500 italic">Right Time.</span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              Find and book skilled workers for home construction, maintenance, and interior works in Nellore and across Andhra Pradesh.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/search" 
                className="bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition-all shadow-xl flex items-center justify-center gap-2 group"
              >
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Find Workers Now
              </Link>
              <button 
                onClick={handleRegisterClick}
                className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center"
              >
                Register as Worker
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose from a wide range of skilled professionals for your home needs.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.slug}
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link 
                to={`/search?category=${cat.slug}`}
                className="flex flex-col items-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all group"
              >
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110", cat.color)}>
                  <cat.icon className="w-8 h-8" />
                </div>
                <span className="font-bold text-slate-800 text-center">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-orange-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-8 leading-tight">
                Connecting Nellore with <br />
                <span className="text-orange-600">Trusted Professionals</span>
              </h2>
              <div className="space-y-8">
                {[
                  { title: 'Verified Profiles', desc: 'We check worker skills and experience to ensure quality.', icon: ShieldCheck },
                  { title: 'Local Focus', desc: 'Primary focus on Nellore city and surrounding districts.', icon: MapPin },
                  { title: 'Easy Booking', desc: 'Book workers instantly with date and time selection.', icon: Clock },
                  { title: 'Direct Contact', desc: 'Call or chat directly with workers after booking.', icon: Phone },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-orange-600">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=1000" 
                  alt="Worker at work" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-2xl shadow-xl max-w-xs hidden lg:block">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-slate-900">4.9/5 Average Rating</span>
                </div>
                <p className="text-gray-600 text-sm">Trusted by over 5,000+ households in Nellore.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Workers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Featured Workers</h2>
            <p className="text-gray-600">Highly rated professionals in your area.</p>
          </div>
          <Link to="/search" className="text-orange-600 font-bold hover:underline">View All Workers</Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Placeholder for featured workers */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="h-48 bg-gray-100 relative">
                <img 
                  src={`https://picsum.photos/seed/worker${i}/800/600`} 
                  alt="Worker" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Featured
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Worker Name {i}</h3>
                    <p className="text-orange-600 font-medium text-sm">Construction Expert</p>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-sm font-bold">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    4.8
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                  <MapPin className="w-4 h-4" />
                  Nellore City
                </div>
                <Link 
                  to="/search" 
                  className="block w-full text-center bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <Logo className="h-12" />
            </Link>
            <p className="text-gray-400 max-w-sm mb-8">
              Connecting skilled workers with home owners in Nellore and across Andhra Pradesh. Quality service, trusted professionals.
            </p>
            <div className="flex space-x-4">
              {/* Social icons placeholder */}
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors cursor-pointer">
                <span className="font-bold">f</span>
              </div>
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors cursor-pointer">
                <span className="font-bold">t</span>
              </div>
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors cursor-pointer">
                <span className="font-bold">i</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link to="/search" className="hover:text-orange-500 transition-colors">Find Workers</Link></li>
              <li><Link to="/profile?register=true" className="hover:text-orange-500 transition-colors">Register as Worker</Link></li>
              <li><Link to="/about" className="hover:text-orange-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-orange-500 transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Services</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link to="/search?category=construction" className="hover:text-orange-500 transition-colors">Construction</Link></li>
              <li><Link to="/search?category=plumbing" className="hover:text-orange-500 transition-colors">Plumbing</Link></li>
              <li><Link to="/search?category=electrical" className="hover:text-orange-500 transition-colors">Electrical</Link></li>
              <li><Link to="/search?category=interior" className="hover:text-orange-500 transition-colors">Interior Works</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} ReparoH. All rights reserved. Made for Nellore.</p>
        </div>
      </div>
    </footer>
  );
}

import { cn } from '../lib/utils';
