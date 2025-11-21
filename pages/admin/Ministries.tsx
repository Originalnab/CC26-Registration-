import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Ministry } from '../../types';
import { LucidePlus, LucideTrash, LucideUpload } from 'lucide-react';

export const Ministries: React.FC = () => {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [newMinistry, setNewMinistry] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [loading, setLoading] = useState(false);

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
    
    // Supabase will ignore duplicates due to UNIQUE constraint and ON CONFLICT DO NOTHING implicit behavior 
    // if we don't specify options, it errors. So we use upsert with ignoreDuplicates or simple insert with error catch.
    // However, best is to rely on schema unique constraint. Supabase JS client `insert` returns error on conflict by default.
    // We use ignoreDuplicates: true
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: List */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Ministry List</h2>
        <div className="bg-white border rounded-lg shadow overflow-hidden max-h-[600px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ministries.map(m => (
                <tr key={m.id}>
                  <td className="px-4 py-3 text-sm">{m.name}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => handleToggleActive(m.id, m.is_active)}
                      className={`text-xs px-2 py-1 rounded-full ${m.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
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
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-bold mb-3">Add Single Ministry</h3>
          <form onSubmit={handleAddSingle} className="flex gap-2">
            <input 
              type="text" 
              value={newMinistry}
              onChange={(e) => setNewMinistry(e.target.value)}
              placeholder="Ministry Name"
              className="flex-1 border rounded px-3 py-2"
            />
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
              <LucidePlus size={20} />
            </button>
          </form>
        </div>

        {/* Bulk Upload */}
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <LucideUpload size={20} /> Bulk Upload
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload a CSV/Text file with one name per line, or paste the list below.
          </p>

          <input 
            type="file" 
            accept=".csv,.txt" 
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mb-4"
          />

          <textarea 
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={`Choir\nUshering\nProtocol`}
            rows={6}
            className="w-full border rounded px-3 py-2 mb-4 font-mono text-sm"
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
