import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  GraduationCap,
  Search,
  Calendar,
  School
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/students', icon: Users, label: 'Students' },
    { path: '/faculty', icon: GraduationCap, label: 'Faculty' },
    { path: '/search', icon: Search, label: 'Intelligent Search' },
    { path: '/events', icon: Calendar, label: 'Events' }, // Changed from Notifications
  ];

  return (
    <div className="w-64 h-screen bg-gray-900 text-white fixed left-0 top-0">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <School className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold">Pogi kame</h1>
            <p className="text-xs text-gray-400">Directory System</p>
          </div>
        </div>
      </div>

      <nav className="mt-6">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">AD</span>
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;