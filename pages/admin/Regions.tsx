import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Region } from '../../types';
import { LucideArrowUpDown, LucideArrowUp, LucideArrowDown } from 'lucide-react';

type SortKey = 'name' | 'is_active';

export const Regions: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    const { data } = await supabase.from('regions').select('*').order('name');
    if (data) setRegions(data);
  };

  const toggleRegion = async (id: string, currentState: boolean) => {
    await supabase.from('regions').update({ is_active: !currentState }).eq('id', id);
    fetchRegions();
  };

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) return <LucideArrowUpDown size={14} className="text-gray-400" />;
    return sortConfig.direction === 'asc' ? <LucideArrowUp size={14} className="text-indigo-600" /> : <LucideArrowDown size={14} className="text-indigo-600" />;
  };

  const sortedRegions = [...regions].sort((a, b) => {
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];
    
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Manage Regions</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-4">The 16 regions of Ghana are pre-seeded. You can hide them from the public form here.</p>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden max-w-3xl border dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th onClick={() => handleSort('name')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 select-none">
                <div className="flex items-center gap-2">Region Name {getSortIcon('name')}</div>
              </th>
              <th onClick={() => handleSort('is_active')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 select-none">
                <div className="flex items-center gap-2">Status {getSortIcon('is_active')}</div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedRegions.map(region => (
              <tr key={region.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {region.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${region.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {region.is_active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                   <button 
                      onClick={() => toggleRegion(region.id, region.is_active)}
                      className={`text-xs font-bold px-3 py-1 rounded transition ${
                        region.is_active 
                        ? 'text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-200 dark:hover:bg-red-900/30' 
                        : 'text-green-600 hover:text-green-900 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-200 dark:hover:bg-green-900/30'
                      }`}
                    >
                      {region.is_active ? 'Hide' : 'Show'}
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};