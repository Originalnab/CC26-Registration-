import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Region } from '../../types';

export const Regions: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);

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

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Regions</h2>
      <p className="text-gray-500 mb-4">The 16 regions of Ghana are pre-seeded. You can hide them from the public form here.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regions.map(region => (
          <div key={region.id} className={`p-4 rounded-lg border flex justify-between items-center ${region.is_active ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-200 opacity-75'}`}>
            <span className="font-medium text-gray-800">{region.name}</span>
            <button 
              onClick={() => toggleRegion(region.id, region.is_active)}
              className={`text-xs font-bold px-3 py-1 rounded-full transition ${
                region.is_active 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              {region.is_active ? 'Active' : 'Hidden'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
