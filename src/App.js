import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AuthWrapper from './components/auth/AuthWrapper';
import LoginForm from './components/auth/LoginForm';
import SignUpForm from './components/auth/SignUpForm';
import Header from './components/Layout/Header';
import TaskList from './components/tasks/TaskList';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <TaskProvider>
          <div className="min-h-screen bg-gray-100">
            <Header/>
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route 
                  path="/login" 
                  element={
                    <AuthWrapper requireAuth={false}>
                      <LoginForm />
                    </AuthWrapper>
                  } 
                />
                <Route 
                  path="/signup" 
                  element={
                    <AuthWrapper requireAuth={false}>
                      <SignUpForm />
                    </AuthWrapper>
                  } 
                />
                <Route 
                  path="/" 
                  element={
                    <AuthWrapper requireAuth={true}>
                      <TaskList />
                    </AuthWrapper>
                  } 
                />
              </Routes>
            </main>
          </div>
        </TaskProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;