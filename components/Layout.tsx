import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LucideUserCheck, LucideUserPlus, LucideMoon, LucideSun } from 'lucide-react';
import { APP_NAME } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, isAdmin }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => {
    return location.pathname === path 
      ? 'text-indigo-600 dark:text-indigo-400 font-bold' 
      : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400';
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-800 dark:text-indigo-300">
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
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">Admin Mode</span>
                </div>
              )}
              
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {theme === 'light' ? <LucideMoon size={20} /> : <LucideSun size={20} />}
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 py-6 mt-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </footer>
    </div>
  );
};