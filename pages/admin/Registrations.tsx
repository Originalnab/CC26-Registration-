import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Registration, Region, Ministry } from '../../types';
import { LucideDownload, LucideFilter, LucideSearch, LucideArrowUpDown, LucideArrowUp, LucideArrowDown } from 'lucide-react';

type SortKey = 'created_at' | 'attendee_name' | 'referrer_email' | 'ministry' | 'region';

export const Registrations: React.FC = () => {
  const [data, setData] = useState<Registration[]>([]);
  const [filteredData, setFilteredData] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [ministryFilter, setMinistryFilter] = useState('');
  
  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>({ key: 'created_at', direction: 'desc' });

  // Lookups for filters
  const [regions, setRegions] = useState<Region[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [search, regionFilter, ministryFilter, data, sortConfig]);

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

  const applyFiltersAndSort = () => {
    let res = [...data];
    
    // Filter
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

    // Sort
    if (sortConfig) {
      res.sort((a, b) => {
        let valA: string | number = '';
        let valB: string | number = '';

        switch (sortConfig.key) {
          case 'created_at':
            valA = new Date(a.created_at).getTime();
            valB = new Date(b.created_at).getTime();
            break;
          case 'attendee_name':
            valA = a.attendee_name.toLowerCase();
            valB = b.attendee_name.toLowerCase();
            break;
          case 'referrer_email':
            valA = a.referrer_email.toLowerCase();
            valB = b.referrer_email.toLowerCase();
            break;
          case 'ministry':
            valA = a.ministries?.name?.toLowerCase() || '';
            valB = b.ministries?.name?.toLowerCase() || '';
            break;
          case 'region':
            valA = a.regions?.name?.toLowerCase() || '';
            valB = b.regions?.name?.toLowerCase() || '';
            break;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredData(res);
  };

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
    if (sortConfig?.key !== key) return <LucideArrowUpDown size={14} className="text-gray-400" />;
    return sortConfig.direction === 'asc' ? <LucideArrowUp size={14} className="text-indigo-600" /> : <LucideArrowDown size={14} className="text-indigo-600" />;
  };

  const downloadCSV = () => {
    if (filteredData.length === 0) return;

    const fixedHeaders = ['Created At', 'Referrer Email', 'Attendee Name', 'Email', 'Phone', 'Gender', 'Age Group', 'Region', 'Ministry'];
    const dynamicKeys = Array.from(new Set(
      filteredData.flatMap(r => Object.keys(r.extra_data || {}))
    ));

    const csvRows = [];
    csvRows.push([...fixedHeaders, ...dynamicKeys].join(','));

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

  const inputClass = "w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500";
  const labelClass = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1";

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Registrations ({filteredData.length})</h1>
        <button 
          onClick={downloadCSV}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
        >
          <LucideDownload size={18} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className={labelClass}>Search (Name/Referrer)</label>
          <div className="relative">
            <LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`pl-9 ${inputClass}`}
              placeholder="Search..."
            />
          </div>
        </div>
        <div className="w-48">
          <label className={labelClass}>Region</label>
          <select 
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className={inputClass}
          >
            <option value="">All Regions</option>
            {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="w-48">
          <label className={labelClass}>Ministry</label>
          <select 
            value={ministryFilter}
            onChange={(e) => setMinistryFilter(e.target.value)}
            className={inputClass}
          >
            <option value="">All Ministries</option>
            {ministries.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th onClick={() => handleSort('created_at')} className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 select-none">
                <div className="flex items-center gap-2">Date {getSortIcon('created_at')}</div>
              </th>
              <th onClick={() => handleSort('attendee_name')} className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 select-none">
                <div className="flex items-center gap-2">Attendee {getSortIcon('attendee_name')}</div>
              </th>
              <th onClick={() => handleSort('referrer_email')} className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 select-none">
                <div className="flex items-center gap-2">Referrer {getSortIcon('referrer_email')}</div>
              </th>
              <th onClick={() => handleSort('ministry')} className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 select-none">
                <div className="flex items-center gap-2">Ministry {getSortIcon('ministry')}</div>
              </th>
              <th onClick={() => handleSort('region')} className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 select-none">
                <div className="flex items-center gap-2">Region {getSortIcon('region')}</div>
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">No registrations found.</td></tr>
            ) : (
              filteredData.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white">{r.attendee_name}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">{r.attendee_email}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">{r.attendee_phone}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.referrer_email}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.ministries?.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.regions?.name}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => alert(JSON.stringify(r.extra_data, null, 2))} className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs">
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