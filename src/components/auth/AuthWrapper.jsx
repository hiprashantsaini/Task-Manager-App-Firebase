import { useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const AuthWrapper = ({ children, requireAuth = true }) => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      // If authentication is required and user is not logged in
      if (requireAuth && !user) {
        // Redirect to login while saving the attempted URL
        navigate('/login', {
          state: { from: location.pathname },
          replace: true
        });
      }
      
      // If user is logged in and tries to access auth pages (login/signup)
      if (user && !requireAuth && (location.pathname === '/login' || location.pathname === '/signup')) {
        navigate('/', { replace: true });
      }
    }
  }, [user, loading, requireAuth, navigate, location]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // For auth pages (login/signup), render if user is not logged in
  if (!requireAuth && !user) {
    return children;
  }

  // For protected pages, render if user is logged in
  if (requireAuth && user) {
    return children;
  }
  return null;
};

export default AuthWrapper;