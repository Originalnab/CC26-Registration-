export interface Region {
  id: string;
  name: string;
  is_active: boolean;
}

export interface Ministry {
  id: string;
  name: string;
  is_active: boolean;
}

export interface FormField {
  id: string;
  label: string;
  name: string;
  type: 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'textarea' | 'date';
  required: boolean;
  options: string[] | null; // For select inputs
  field_order: number;
  is_active: boolean;
}

export interface Registration {
  id: string;
  created_at: string;
  referrer_email: string;
  attendee_name: string;
  attendee_email: string;
  attendee_phone: string;
  gender: string;
  age_group_ministry: string;
  region_id: string;
  ministry_id: string;
  extra_data: Record<string, any>;
  
  // Joins
  regions?: Region;
  ministries?: Ministry;
}

export interface ReferralStats {
  count: number;
}
