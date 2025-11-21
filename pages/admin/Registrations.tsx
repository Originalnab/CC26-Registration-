import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Registration, Region, Ministry } from '../../types';
import { LucideDownload, LucideFilter, LucideSearch } from 'lucide-react';

export const Registrations: React.FC = () => {
  const [data, setData] = useState<Registration[]>([]);
  const [filteredData, setFilteredData] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [ministryFilter, setMinistryFilter] = useState('');
  
  // Lookups for filters
  const [regions, setRegions] = useState<Region[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, regionFilter, ministryFilter, data]);

  const fetchData = async () => {
    setLoading(true);
    // Fetch lookups
    const [regRes, minRes] = await Promise.all([
      supabase.from('regions').select('*'),
      supabase.from('ministries').select('*')
    ]);
    if (regRes.data) setRegions(regRes.data);
    if (minRes.data) setMinistries(minRes.data);

    // Fetch Registrations with joins
    const { data: regData, error } = await supabase
      .from('registrations')
      .select('*, regions(name), ministries(name)')
      .order('created_at', { ascending: false });

    if (!error && regData) {
      setData(regData as any);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let res = [...data];
    
    if (search) {
      const s = search.toLowerCase();
      res = res.filter(r => 
        r.referrer_email.toLowerCase().includes(s) || 
        r.attendee_name.toLowerCase().includes(s)
      );
    }
    if (regionFilter) {
      res = res.filter(r => r.region_id === regionFilter);
    }
    if (ministryFilter) {
      res = res.filter(r => r.ministry_id === ministryFilter);
    }
    setFilteredData(res);
  };

  const downloadCSV = () => {
    if (filteredData.length === 0) return;

    // Build headers including dynamic fields found in data
    const fixedHeaders = ['Created At', 'Referrer Email', 'Attendee Name', 'Email', 'Phone', 'Gender', 'Age Group', 'Region', 'Ministry'];
    
    // Collect all unique keys from extra_data across all filtered records
    const dynamicKeys = Array.from(new Set(
      filteredData.flatMap(r => Object.keys(r.extra_data || {}))
    ));

    const csvRows = [];
    
    // Header Row
    csvRows.push([...fixedHeaders, ...dynamicKeys].join(','));

    // Data Rows
    filteredData.forEach(r => {
      const row = [
        `"${new Date(r.created_at).toLocaleString()}"`,
        `"${r.referrer_email}"`,
        `"${r.attendee_name}"`,
        `"${r.attendee_email}"`,
        `"${r.attendee_phone}"`,
        `"${r.gender}"`,
        `"${r.age_group_ministry}"`,
        `"${r.regions?.name || ''}"`,
        `"${r.ministries?.name || ''}"`,
        ...dynamicKeys.map(k => `"${r.extra_data[k] || ''}"`)
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "registrations_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Registrations ({filteredData.length})</h1>
        <button 
          onClick={downloadCSV}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
        >
          <LucideDownload size={18} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Search (Name/Referrer)</label>
          <div className="relative">
            <LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="Search..."
            />
          </div>
        </div>
        <div className="w-48">
          <label className="block text-xs font-medium text-gray-500 mb-1">Region</label>
          <select 
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">All Regions</option>
            {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="w-48">
          <label className="block text-xs font-medium text-gray-500 mb-1">Ministry</label>
          <select 
            value={ministryFilter}
            onChange={(e) => setMinistryFilter(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">All Ministries</option>
            {ministries.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Attendee</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Referrer</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Ministry</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Region</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">No registrations found.</td></tr>
            ) : (
              filteredData.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{r.attendee_name}</div>
                    <div className="text-gray-500 text-xs">{r.attendee_email}</div>
                    <div className="text-gray-500 text-xs">{r.attendee_phone}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.referrer_email}</td>
                  <td className="px-4 py-3 text-gray-600">{r.ministries?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{r.regions?.name}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => alert(JSON.stringify(r.extra_data, null, 2))} className="text-indigo-600 hover:underline text-xs">
                      View Extra Data
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
