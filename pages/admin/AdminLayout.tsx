import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Layout } from '../../components/Layout';
import { 
  LucideLayoutDashboard, 
  LucideDatabase, 
  LucideMap, 
  LucideFiles, 
  LucideLogOut,
  LucideLoader2,
  LucideMoon,
  LucideSun
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const AdminLayout: React.FC = () => {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }
      setChecking(false);
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const navClass = (path: string) => {
    const active = location.pathname === path;
    return `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
      active 
        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium' 
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`;
  };

  if (checking) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LucideLoader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col transition-colors duration-200">
       <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-indigo-800 dark:text-indigo-300">Admin Dashboard</div>
          <div className="flex items-center gap-4">
            <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                {theme === 'light' ? <LucideMoon size={20} /> : <LucideSun size={20} />}
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                <LucideLogOut size={16} /> Logout
            </button>
          </div>
       </header>

       <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden md:block">
            <nav className="space-y-2 sticky top-24">
              <Link to="/admin/registrations" className={navClass('/admin/registrations')}>
                <LucideLayoutDashboard size={20} /> Registrations
              </Link>
              <Link to="/admin/ministries" className={navClass('/admin/ministries')}>
                <LucideDatabase size={20} /> Ministries
              </Link>
              <Link to="/admin/regions" className={navClass('/admin/regions')}>
                <LucideMap size={20} /> Regions
              </Link>
              <Link to="/admin/form-fields" className={navClass('/admin/form-fields')}>
                <LucideFiles size={20} /> Form Fields
              </Link>
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow p-6 min-h-[500px] transition-colors">
            <Outlet />
          </main>
       </div>
    </div>
  );
};