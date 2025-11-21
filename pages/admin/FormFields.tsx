import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FormField } from '../../types';
import { LucidePlus, LucideEdit2 } from 'lucide-react';

const FIELD_TYPES = ['text', 'email', 'number', 'select', 'checkbox', 'textarea', 'date'];

export const FormFields: React.FC = () => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [editing, setEditing] = useState<Partial<FormField>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [optionsStr, setOptionsStr] = useState(''); // Helper for select options

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    const { data } = await supabase.from('form_fields').select('*').order('field_order');
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dynamic Form Fields</h2>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2"
        >
          <LucidePlus size={18} /> Add Field
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
             <tr>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key Name</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
             {fields.map(field => (
               <tr key={field.id}>
                 <td className="px-6 py-4">{field.label}</td>
                 <td className="px-6 py-4 badge"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{field.type}</span></td>
                 <td className="px-6 py-4 font-mono text-xs">{field.name}</td>
                 <td className="px-6 py-4">{field.required ? 'Yes' : 'No'}</td>
                 <td className="px-6 py-4">{field.field_order}</td>
                 <td className="px-6 py-4 flex items-center gap-3">
                    <button onClick={() => openModal(field)} className="text-indigo-600 hover:text-indigo-800">
                      <LucideEdit2 size={16} />
                    </button>
                    <button 
                      onClick={() => toggleActive(field.id, field.is_active)}
                      className={`text-xs px-2 py-1 rounded ${field.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}
                    >
                      {field.is_active ? 'Active' : 'Disabled'}
                    </button>
                 </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">{editing.id ? 'Edit Field' : 'New Field'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Label</label>
                <input 
                  required 
                  className="w-full border rounded px-3 py-2"
                  value={editing.label || ''}
                  onChange={e => setEditing({...editing, label: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">JSON Key Name (Unique, no spaces)</label>
                <input 
                  required 
                  className="w-full border rounded px-3 py-2 font-mono"
                  value={editing.name || ''}
                  onChange={e => setEditing({...editing, name: e.target.value.toLowerCase().replace(/\s/g, '_')})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select 
                    className="w-full border rounded px-3 py-2"
                    value={editing.type}
                    onChange={e => setEditing({...editing, type: e.target.value as any})}
                  >
                    {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Order</label>
                  <input 
                    type="number"
                    className="w-full border rounded px-3 py-2"
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
                />
                <label>Required Field</label>
              </div>

              {editing.type === 'select' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Options (comma separated)</label>
                  <textarea 
                    className="w-full border rounded px-3 py-2"
                    value={optionsStr}
                    onChange={e => setOptionsStr(e.target.value)}
                    placeholder="Option 1, Option 2, Option 3"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
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
