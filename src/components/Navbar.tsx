import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hammer, User, LogOut, Menu, X, Search, LayoutDashboard } from 'lucide-react';
import { cn } from '../lib/utils';
import { Logo } from './Logo';

export default function Navbar() {
  const { user, profile, login, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Find Workers', href: '/search', icon: Search },
    { name: 'Categories', href: '/#categories', icon: Hammer },
  ];

  if (profile?.role === 'admin') {
    navLinks.push({ name: 'Admin Panel', href: '/admin', icon: LayoutDashboard });
  } else if (profile?.role === 'worker') {
    navLinks.push({ name: 'Dashboard', href: '/worker/dashboard', icon: LayoutDashboard });
  } else if (user) {
    navLinks.push({ name: 'My Bookings', href: '/bookings', icon: LayoutDashboard });
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Logo className="h-10" />
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-gray-600 hover:text-orange-600 font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-orange-600">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-gray-200" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-8 h-8 p-1 bg-gray-100 rounded-full" />
                  )}
                  <span className="font-medium">{user.displayName?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="bg-orange-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-orange-700 transition-all shadow-md hover:shadow-lg"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-orange-600 p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-4 shadow-xl">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 text-gray-700 hover:text-orange-600 font-medium p-2 rounded-lg hover:bg-orange-50"
            >
              <link.icon className="w-5 h-5" />
              <span>{link.name}</span>
            </Link>
          ))}
          {user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 text-gray-700 hover:text-orange-600 font-medium p-2 rounded-lg hover:bg-orange-50"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="flex w-full items-center space-x-3 text-red-600 font-medium p-2 rounded-lg hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                login();
                setIsOpen(false);
              }}
              className="w-full bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md"
            >
              Login with Google
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
