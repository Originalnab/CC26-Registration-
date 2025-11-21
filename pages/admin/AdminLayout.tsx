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
  LucideLoader2
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }
      // Optional: Check custom admin table if stricter security needed
      // const { data: admin } = await supabase.from('app_admins').select('*').eq('user_id', session.user.id).single();
      // if(!admin) navigate('/');
      
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
      active ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
    }`;
  };

  if (checking) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LucideLoader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
       <header className="bg-white shadow-sm sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-indigo-800">Admin Dashboard</div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800">
            <LucideLogOut size={16} /> Logout
          </button>
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
          <main className="flex-1 bg-white rounded-lg shadow p-6 min-h-[500px]">
            <Outlet />
          </main>
       </div>
    </div>
  );
};
