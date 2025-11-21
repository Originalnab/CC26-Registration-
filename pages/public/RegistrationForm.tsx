import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FormField, Ministry, Region } from '../../types';
import { Layout } from '../../components/Layout';
import { LucideCheckCircle, LucideLoader2, LucidePartyPopper } from 'lucide-react';
import { GHANA_REGIONS, APP_NAME } from '../../constants';

export const RegistrationForm: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [dynamicFields, setDynamicFields] = useState<FormField[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    referrer_email: '',
    attendee_name: '',
    attendee_email: '',
    attendee_phone: '',
    alternative_phone: '',
    gender: 'Male',
    age_group_ministry: 'Adult Ministry',
    town: '',
    city: '',
    region_id: '',
    ministry_id: '',
    extra_data: {} as Record<string, any>
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch active form fields and ministries
      const [regionsRes, ministriesRes, fieldsRes] = await Promise.all([
        supabase.from('regions').select('*').order('name'),
        supabase.from('ministries').select('*').eq('is_active', true).order('name'),
        supabase.from('form_fields').select('*').eq('is_active', true).order('field_order')
      ]);

      // Handle Regions Fallback
      if (regionsRes.data && regionsRes.data.length > 0) {
        setRegions(regionsRes.data);
      } else {
        const fallbackRegions = GHANA_REGIONS.map(r => ({ 
          id: r, 
          name: r, 
          is_active: true 
        })) as unknown as Region[];
        setRegions(fallbackRegions);
      }

      if (ministriesRes.data) setMinistries(ministriesRes.data);
      if (fieldsRes.data) setDynamicFields(fieldsRes.data);
      
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDynamicChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      extra_data: {
        ...prev.extra_data,
        [name]: value
      }
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
     handleDynamicChange(name, checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const finalExtraData = {
      ...formData.extra_data,
      town: formData.town,
      city: formData.city,
      alternative_phone: formData.alternative_phone
    };

    const payload = {
      referrer_email: formData.referrer_email.trim(),
      attendee_name: formData.attendee_name.trim(),
      attendee_email: formData.attendee_email.trim(),
      attendee_phone: formData.attendee_phone.trim(),
      gender: formData.gender,
      age_group_ministry: formData.age_group_ministry,
      region_id: formData.region_id,
      ministry_id: formData.ministry_id,
      extra_data: finalExtraData
    };

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.region_id);
    
    let dbPayload: any = { ...payload };
    
    if (!isUUID) {
       delete dbPayload.region_id;
       dbPayload.extra_data.region_fallback_name = formData.region_id;
    }

    const { error } = await supabase.from('registrations').insert([dbPayload]);

    if (error) {
      alert(`Registration failed: ${error.message}`);
    } else {
      setSuccess(true);
    }
    setSubmitting(false);
  };

  // Reusable input style class for high visibility
  const inputClass = "w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const sectionTitleClass = "text-lg font-medium text-gray-900 dark:text-white mb-3";

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <LucideLoader2 className="animate-spin text-indigo-600" size={48} />
        </div>
      </Layout>
    );
  }

  if (success) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center transition-colors">
          <div className="flex justify-center mb-4">
            <LucideCheckCircle className="text-green-500" size={64} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Registration Successful!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Thank you for registering for {APP_NAME}. You can register another person below.</p>
          <button 
            onClick={() => {
              setSuccess(false);
              setFormData(prev => ({
                ...prev,
                attendee_name: '',
                attendee_email: '',
                attendee_phone: '',
                alternative_phone: '',
                town: '',
                city: '',
                extra_data: {} // Clear dynamic data
              }));
              window.scrollTo(0,0);
            }}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            Register Another Person
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden border-t-4 border-indigo-700 transition-colors">
          
          {/* Logos Section */}
          <div className="bg-white dark:bg-gray-200 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6 transition-colors">
            <img 
              src="https://i.ibb.co/m5x225v/Epistles-Of-Christ-Logo.jpg" 
              alt="Epistles Of Christ" 
              className="h-20 object-contain" 
            />
            <img 
              src="https://i.ibb.co/2Wz3w3k/10-Years.jpg" 
              alt="10th Anniversary" 
              className="h-20 object-contain" 
            />
          </div>

          <div className="bg-indigo-700 px-6 py-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-white">{APP_NAME}</h1>
                    <div className="inline-flex items-center gap-1 bg-yellow-400 text-indigo-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide w-fit">
                        <LucidePartyPopper size={14} />
                        10th Anniversary
                    </div>
                </div>
                <p className="text-indigo-100 text-sm">Please fill in the details below to register for this milestone event.</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Section 1: Referrer */}
            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-md border border-gray-200 dark:border-gray-700">
              <h3 className={sectionTitleClass}>Referrer Information</h3>
              <div>
                <label className={labelClass}>Referrer Email (Your Email) *</label>
                <input 
                  type="email" 
                  name="referrer_email"
                  required
                  value={formData.referrer_email}
                  onChange={handleChange}
                  placeholder="e.g. yourname@example.com"
                  className={inputClass}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This is used to track your referrals.</p>
              </div>
            </div>

            {/* Section 2: Attendee Basic Info */}
            <div>
              <h3 className={`${sectionTitleClass} border-b dark:border-gray-700 pb-2`}>Attendee Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelClass}>Full Name *</label>
                  <input 
                    type="text" 
                    name="attendee_name"
                    required
                    value={formData.attendee_name}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                
                <div>
                  <label className={labelClass}>Email *</label>
                  <input 
                    type="email" 
                    name="attendee_email"
                    required
                    value={formData.attendee_email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Phone *</label>
                  <input 
                    type="tel" 
                    name="attendee_phone"
                    required
                    value={formData.attendee_phone}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Alternative Number</label>
                  <input 
                    type="tel" 
                    name="alternative_phone"
                    value={formData.alternative_phone}
                    onChange={handleChange}
                    placeholder="Optional"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Gender *</label>
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Age Group Ministry *</label>
                  <select 
                    name="age_group_ministry"
                    value={formData.age_group_ministry}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Adult Ministry">Adult Ministry</option>
                    <option value="Children Ministry">Children Ministry</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Location & Ministry */}
            <div>
               <h3 className={`${sectionTitleClass} border-b dark:border-gray-700 pb-2`}>Location & Ministry</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 
                 <div>
                  <label className={labelClass}>City</label>
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={inputClass}
                  />
                 </div>

                 <div>
                  <label className={labelClass}>Town</label>
                  <input 
                    type="text" 
                    name="town"
                    value={formData.town}
                    onChange={handleChange}
                    className={inputClass}
                  />
                 </div>

                 <div className="md:col-span-2">
                    <label className={labelClass}>Region *</label>
                    <select 
                      name="region_id"
                      required
                      value={formData.region_id}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">-- Select Region --</option>
                      {regions.map((r, idx) => (
                        <option key={r.id || idx} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                 </div>

                 <div className="md:col-span-2">
                    <label className={labelClass}>Ministry *</label>
                    <select 
                      name="ministry_id"
                      required
                      value={formData.ministry_id}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">-- Select Ministry --</option>
                      {ministries.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                 </div>
               </div>
            </div>

            {/* Section 4: Dynamic Fields */}
            {dynamicFields.length > 0 && (
              <div>
                <h3 className={`${sectionTitleClass} border-b dark:border-gray-700 pb-2`}>Additional Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  {dynamicFields.map(field => (
                    <div key={field.id}>
                      <label className={labelClass}>
                        {field.label} {field.required && '*'}
                      </label>
                      
                      {/* Text / Email / Number */}
                      {(field.type === 'text' || field.type === 'email' || field.type === 'number') && (
                         <input 
                           type={field.type}
                           required={field.required}
                           onChange={(e) => handleDynamicChange(field.name, e.target.value)}
                           className={inputClass}
                         />
                      )}

                      {/* Date */}
                       {field.type === 'date' && (
                         <input 
                           type="date"
                           required={field.required}
                           onChange={(e) => handleDynamicChange(field.name, e.target.value)}
                           className={inputClass}
                         />
                      )}

                      {/* Textarea */}
                      {field.type === 'textarea' && (
                        <textarea 
                          required={field.required}
                          rows={3}
                          onChange={(e) => handleDynamicChange(field.name, e.target.value)}
                          className={inputClass}
                        />
                      )}

                      {/* Select */}
                      {field.type === 'select' && field.options && (
                        <select
                          required={field.required}
                          onChange={(e) => handleDynamicChange(field.name, e.target.value)}
                          className={inputClass}
                        >
                          <option value="">Select...</option>
                          {(field.options as unknown as string[]).map((opt, idx) => (
                            <option key={idx} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}

                      {/* Checkbox */}
                      {field.type === 'checkbox' && (
                        <div className="flex items-center mt-1">
                          <input 
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            onChange={(e) => handleCheckboxChange(field.name, e.target.checked)}
                          />
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Yes</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
              >
                {submitting ? 'Submitting...' : 'Complete Registration'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
};