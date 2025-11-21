import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Ministry } from '../../types';
import { LucidePlus, LucideTrash, LucideUpload, LucideArrowUpDown, LucideArrowUp, LucideArrowDown } from 'lucide-react';

type SortKey = 'name' | 'is_active';

export const Ministries: React.FC = () => {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [newMinistry, setNewMinistry] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });

  useEffect(() => {
    fetchMinistries();
  }, []);

  const fetchMinistries = async () => {
    const { data } = await supabase.from('ministries').select('*').order('name');
    if (data) setMinistries(data);
  };

  const handleAddSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMinistry.trim()) return;
    
    await supabase.from('ministries').insert([{ name: newMinistry.trim() }]);
    setNewMinistry('');
    fetchMinistries();
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    await supabase.from('ministries').update({ is_active: !current }).eq('id', id);
    fetchMinistries();
  };

  const handleBulkUpload = async () => {
    if (!bulkText) return;
    setLoading(true);

    // Split by newline, trim, remove empty, remove duplicates
    const names = Array.from(new Set(
      bulkText.split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0)
    ));

    if (names.length === 0) {
      setLoading(false);
      return;
    }

    const rows = names.map(name => ({ name }));
    
    const { error } = await supabase.from('ministries').upsert(rows, { onConflict: 'name', ignoreDuplicates: true });

    if (error) {
      alert("Error uploading: " + error.message);
    } else {
      setBulkText('');
      fetchMinistries();
    }
    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setBulkText(text); // Load into textarea for review before submit
    };
    reader.readAsText(file);
  };

  // Sorting Logic
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

  const sortedMinistries = [...ministries].sort((a, b) => {
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];

    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const inputClass = "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: List */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Ministry List</h2>
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow overflow-hidden max-h-[600px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
              <tr>
                <th onClick={() => handleSort('name')} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 select-none">
                   <div className="flex items-center gap-2">Name {getSortIcon('name')}</div>
                </th>
                <th onClick={() => handleSort('is_active')} className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 select-none">
                   <div className="flex items-center justify-end gap-2">Status {getSortIcon('is_active')}</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedMinistries.map(m => (
                <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{m.name}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => handleToggleActive(m.id, m.is_active)}
                      className={`text-xs px-2 py-1 rounded-full ${m.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                      {m.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="space-y-8">
        
        {/* Add Single */}
        <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg border dark:border-gray-700">
          <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Add Single Ministry</h3>
          <form onSubmit={handleAddSingle} className="flex gap-2">
            <input 
              type="text" 
              value={newMinistry}
              onChange={(e) => setNewMinistry(e.target.value)}
              placeholder="Ministry Name"
              className={`flex-1 ${inputClass}`}
            />
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
              <LucidePlus size={20} />
            </button>
          </form>
        </div>

        {/* Bulk Upload */}
        <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg border dark:border-gray-700">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
            <LucideUpload size={20} /> Bulk Upload
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Upload a CSV/Text file with one name per line, or paste the list below.
          </p>

          <input 
            type="file" 
            accept=".csv,.txt" 
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900 dark:file:text-indigo-200 file:text-indigo-700 hover:file:bg-indigo-100 mb-4"
          />

          <textarea 
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={`Choir\nUshering\nProtocol`}
            rows={6}
            className={`w-full mb-4 font-mono text-sm ${inputClass}`}
          />

          <button 
            onClick={handleBulkUpload} 
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Upload List'}
          </button>
        </div>
      </div>
    </div>
  );
};