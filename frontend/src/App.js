import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Faculty from './pages/Faculty';
import SearchPage from './pages/SearchPage';
import EventsPage from './pages/NotificationsPage';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/events" element={<EventsPage />} />
        {/* Remove the /notifications route if it exists */}
      </Routes>
    </Router>
  );
}

export default App;