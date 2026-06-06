import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { FeedbackProvider } from '../src/context/FeedbackContext';
import ProtectedRoute from '../src/components/ProtectedRoute';
import { AdminLayout } from '../src/components/AdminLayout';
import { Login } from '../src/pages/Login';
import { Register } from '../src/pages/Register';
import { AdminDashboard } from '../src/pages/AdminDashboard';
import { FormBuilder } from '../src/pages/FormBuilder';
import { FeedbackForm } from '../src/pages/FeedbackForm';
import { AnalyticsDashboard } from '../src/pages/AnalyticsDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FeedbackProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/form/:formId" element={<FeedbackForm />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/create" element={<FormBuilder />} />
              <Route path="/admin/edit/:formId" element={<FormBuilder />} />
              <Route path="/admin/analytics/:formId" element={<AnalyticsDashboard />} />
            </Route>

            {/* Redirect root to admin dashboard (or login) */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/admin/login" replace />} />
          </Routes>
        </FeedbackProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
