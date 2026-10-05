import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/AppLayout';
import { LandingPage } from '@/pages/LandingPage';
import { SignupPage, LoginPage, ForgotPasswordPage, ResetPasswordPage } from '@/pages/AuthPages';
import { DashboardPage } from '@/pages/DashboardPage';
import { LockerPage } from '@/pages/LockerPage';
import { DocumentPreviewPage } from '@/pages/DocumentPreviewPage';
import { PersonalInfoPage } from '@/pages/PersonalInfoPage';
import { FavoritesPage, TrashPage, ActivityPage } from '@/pages/ManagementPages';
import { SettingsPage } from '@/pages/SettingsPage';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout><DashboardPage /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/locker"
              element={
                <ProtectedRoute>
                  <AppLayout><LockerPage /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents/:id"
              element={
                <ProtectedRoute>
                  <AppLayout><DocumentPreviewPage /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <AppLayout><DashboardPage /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/personal-info"
              element={
                <ProtectedRoute>
                  <AppLayout><PersonalInfoPage /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <AppLayout><FavoritesPage /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/trash"
              element={
                <ProtectedRoute>
                  <AppLayout><TrashPage /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/activity"
              element={
                <ProtectedRoute>
                  <AppLayout><ActivityPage /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppLayout><SettingsPage /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
