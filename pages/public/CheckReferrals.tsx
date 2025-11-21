import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Layout } from '../../components/Layout';
import { LucideSearch, LucideUsers } from 'lucide-react';

export const CheckReferrals: React.FC = () => {
  const [email, setEmail] = useState('');
  const [stats, setStats] = useState<{ count: number } | null>(null);
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setSearched(false);
    
    // Call RPC for count
    const { data: countData, error: countError } = await supabase.rpc('get_referral_stats', { ref_email: email });
    
    // Call RPC for list
    const { data: listData, error: listError } = await supabase.rpc('get_referrals_list', { ref_email: email });

    if (countError || listError) {
      console.error(countError, listError);
      alert('Error fetching data.');
    } else {
      setStats(countData);
      setList(listData || []);
      setSearched(true);
    }
    setLoading(false);
  };

  const inputClass = "flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500";

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8 transition-colors">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <LucideUsers /> Check My Referrals
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Enter the email address you used as the "Referrer" to see who you have registered.</p>
          
          <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your referrer email"
              className={inputClass}
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              {loading ? 'Checking...' : <><LucideSearch size={18} /> Check</>}
            </button>
          </form>
        </div>

        {searched && stats && (
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
              <h2 className="text-xl font-semibold mb-2">Total Registrations</h2>
              <div className="text-5xl font-bold">{stats.count}</div>
              <p className="opacity-90 mt-2">People registered by {email}</p>
            </div>

            {/* List Table */}
            {list.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors">
                 <div className="px-6 py-4 border-b dark:border-gray-700">
                   <h3 className="text-lg font-medium text-gray-900 dark:text-white">Details</h3>
                 </div>
                 <div className="overflow-x-auto">
                   <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                     <thead className="bg-gray-50 dark:bg-gray-700">
                       <tr>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gender</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Age Group</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Region</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ministry</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                       </tr>
                     </thead>
                     <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                       {list.map((item, idx) => (
                         <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.attendee_name}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.gender}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.age_group_ministry}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.region_name}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.ministry_name}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                             {new Date(item.created_at).toLocaleDateString()}
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-8 text-center text-gray-500 dark:text-gray-400 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 transition-colors">
                No detailed records found.
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};