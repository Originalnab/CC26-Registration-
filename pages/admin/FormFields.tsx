import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FormField } from '../../types';
import { LucidePlus, LucideEdit2, LucideSearch, LucideArrowUpDown, LucideArrowUp, LucideArrowDown } from 'lucide-react';

const FIELD_TYPES = ['text', 'email', 'number', 'select', 'checkbox', 'textarea', 'date'];

type SortKey = keyof FormField;

export const FormFields: React.FC = () => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [editing, setEditing] = useState<Partial<FormField>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [optionsStr, setOptionsStr] = useState(''); // Helper for select options
  
  // Search & Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>({ key: 'field_order', direction: 'asc' });

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    const { data } = await supabase.from('form_fields').select('*');
    if (data) setFields(data);
  };

  const openModal = (field?: FormField) => {
    if (field) {
      setEditing(field);
      setOptionsStr(field.options ? field.options.join(', ') : '');
    } else {
      setEditing({ type: 'text', required: false, is_active: true, field_order: 0 });
      setOptionsStr('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing.label || !editing.name || !editing.type) return;

    // Validation for select type
    if (editing.type === 'select' && !optionsStr.trim()) {
      alert("Please provide at least one option for the dropdown list (comma separated).");
      return;
    }

    const payload = {
      ...editing,
      options: editing.type === 'select' ? optionsStr.split(',').map(s => s.trim()).filter(Boolean) : null
    };

    if (editing.id) {
       await supabase.from('form_fields').update(payload).eq('id', editing.id);
    } else {
       await supabase.from('form_fields').insert([payload]);
    }
    
    setIsModalOpen(false);
    fetchFields();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('form_fields').update({ is_active: !current }).eq('id', id);
    fetchFields();
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

  // Filter and Sort
  const processedFields = [...fields]
    .filter(f => 
      f.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortConfig) return 0;
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      const compareResult = valA < valB ? -1 : 1;
      return sortConfig.direction === 'asc' ? compareResult : -compareResult;
    });
  
  const inputClass = "w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500";

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dynamic Form Fields</h2>
        <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                    type="text"
                    placeholder="Search fields..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 ${inputClass}`}
                />
            </div>
            <button 
            onClick={() => openModal()}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2 whitespace-nowrap"
            >
            <LucidePlus size={18} /> Add Field
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border dark:border-gray-700">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                <th onClick={() => handleSort('label')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 select-none">
                    <div className="flex items-center gap-2">Label {getSortIcon('label')}</div>
                </th>
                <th onClick={() => handleSort('type')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 select-none">
                    <div className="flex items-center gap-2">Type {getSortIcon('type')}</div>
                </th>
                <th onClick={() => handleSort('name')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 select-none">
                    <div className="flex items-center gap-2">Key Name {getSortIcon('name')}</div>
                </th>
                <th onClick={() => handleSort('required')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 select-none">
                    <div className="flex items-center gap-2">Required {getSortIcon('required')}</div>
                </th>
                <th onClick={() => handleSort('field_order')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 select-none">
                    <div className="flex items-center gap-2">Order {getSortIcon('field_order')}</div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {processedFields.length > 0 ? (
                    processedFields.map(field => (
                    <tr key={field.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{field.label}</td>
                        <td className="px-6 py-4 whitespace-nowrap badge"><span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded">{field.type}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-600 dark:text-gray-400">{field.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{field.required ? 'Yes' : 'No'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{field.field_order}</td>
                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                            <button onClick={() => openModal(field)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                            <LucideEdit2 size={16} />
                            </button>
                            <button 
                            onClick={() => toggleActive(field.id, field.is_active)}
                            className={`text-xs px-2 py-1 rounded ${field.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                            >
                            {field.is_active ? 'Active' : 'Disabled'}
                            </button>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                            No fields found matching your search.
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl border dark:border-gray-700">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">{editing.id ? 'Edit Field' : 'New Field'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Label</label>
                <input 
                  required 
                  className={inputClass}
                  value={editing.label || ''}
                  onChange={e => setEditing({...editing, label: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">JSON Key Name (Unique, no spaces)</label>
                <input 
                  required 
                  className={`${inputClass} font-mono`}
                  value={editing.name || ''}
                  onChange={e => setEditing({...editing, name: e.target.value.toLowerCase().replace(/\s/g, '_')})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Type</label>
                  <select 
                    className={inputClass}
                    value={editing.type}
                    onChange={e => {
                        const newType = e.target.value as any;
                        setEditing({...editing, type: newType});
                        // Auto-clear or Auto-populate options
                        if (newType !== 'select') {
                            setOptionsStr('');
                        } else if (newType === 'select' && !optionsStr) {
                            setOptionsStr('Option 1, Option 2, Option 3');
                        }
                    }}
                  >
                    {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Order</label>
                  <input 
                    type="number"
                    className={inputClass}
                    value={editing.field_order}
                    onChange={e => setEditing({...editing, field_order: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  checked={editing.required}
                  onChange={e => setEditing({...editing, required: e.target.checked})}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="text-gray-700 dark:text-gray-300">Required Field</label>
              </div>

              {editing.type === 'select' && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Options (comma separated)</label>
                  <textarea 
                    className={inputClass}
                    value={optionsStr}
                    onChange={e => setOptionsStr(e.target.value)}
                    placeholder="Option 1, Option 2, Option 3"
                    rows={3}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};