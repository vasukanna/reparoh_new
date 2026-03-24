import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Footer } from '../pages/Home';
import { Toaster } from 'sonner';

export default function Layout() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <Toaster position="top-center" richColors />
    </div>
  );
}
