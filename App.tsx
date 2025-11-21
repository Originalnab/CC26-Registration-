import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RegistrationForm } from './pages/public/RegistrationForm';
import { CheckReferrals } from './pages/public/CheckReferrals';
import { Login } from './pages/admin/Login';
import { AdminLayout } from './pages/admin/AdminLayout';
import { Registrations } from './pages/admin/Registrations';
import { Ministries } from './pages/admin/Ministries';
import { Regions } from './pages/admin/Regions';
import { FormFields } from './pages/admin/FormFields';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RegistrationForm />} />
        <Route path="/my-referrals" element={<CheckReferrals />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="registrations" replace />} />
          <Route path="registrations" element={<Registrations />} />
          <Route path="ministries" element={<Ministries />} />
          <Route path="regions" element={<Regions />} />
          <Route path="form-fields" element={<FormFields />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
