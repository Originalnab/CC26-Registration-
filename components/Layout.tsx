import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LucideLayoutDashboard, LucideLogOut, LucideUserCheck, LucideUserPlus } from 'lucide-react';
import { APP_NAME } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, isAdmin }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-indigo-600 font-bold' : 'text-gray-600 hover:text-indigo-600';
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-800">
                {APP_NAME}
              </Link>
            </div>
            
            <nav className="flex items-center space-x-4">
              {!isAdmin ? (
                <>
                  <Link to="/" className={`flex items-center gap-2 ${isActive('/')}`}>
                    <LucideUserPlus size={18} />
                    <span className="hidden sm:inline">Register</span>
                  </Link>
                  <Link to="/my-referrals" className={`flex items-center gap-2 ${isActive('/my-referrals')}`}>
                    <LucideUserCheck size={18} />
                    <span className="hidden sm:inline">Check Referrals</span>
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Admin Mode</span>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      <footer className="bg-white border-t py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
