import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Users, GraduationCap, Activity, Search, TrendingUp, Calendar, MapPin } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard = () => {
  const [statistics, setStatistics] = useState({ students: 0, faculty: 0, active: 0, total: 0 });
  const [popularSearches, setPopularSearches] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [searchTrends, setSearchTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  const departmentOptions = [
    'Computer Science',
    'Information Technology',
    'Entertainment and Multimedia Computing',
    'Computer Engineering',
    'Information Systems',
    'Data Science'
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const statsRes = await api.get('/statistics');
      setStatistics(statsRes.data);
      
      const popularRes = await api.get('/search/popular?limit=5');
      setPopularSearches(popularRes.data.popular_searches || []);
      
      const eventsRes = await api.get('/events?limit=10');
      const allEvents = eventsRes.data || [];
      
      const now = new Date();
      const upcoming = allEvents
        .filter(event => new Date(event.date) > now)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);
      
      setUpcomingEvents(upcoming);
      
      const studentsRes = await api.get('/people?role=student');
      const students = studentsRes.data || [];
      
      const departmentCount = {};
      departmentOptions.forEach(dept => {
        departmentCount[dept] = 0;
      });
      
      students.forEach(student => {
        const dept = student.department;
        if (dept && departmentCount[dept] !== undefined) {
          departmentCount[dept] = (departmentCount[dept] || 0) + 1;
        }
      });
      
      const deptData = Object.entries(departmentCount)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({ name, value }));
      
      setDepartmentData(deptData);
      
      const trends = [
        { month: 'Jan', searches: 400 },
        { month: 'Feb', searches: 600 },
        { month: 'Mar', searches: 800 },
        { month: 'Apr', searches: 750 },
        { month: 'May', searches: 900 },
        { month: 'Jun', searches: 1100 }
      ];
      setSearchTrends(trends);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getDaysUntil = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
    return `In ${Math.ceil(diffDays / 30)} months`;
  };

  const statsCards = [
    { title: 'Total Students', value: statistics.students, icon: Users, color: 'bg-blue-500', trend: '+12%' },
    { title: 'Total Faculty', value: statistics.faculty, icon: GraduationCap, color: 'bg-green-500', trend: '+5%' },
    { title: 'Active Records', value: statistics.active, icon: Activity, color: 'bg-purple-500', trend: '+8%' },
    { title: 'Upcoming Events', value: upcomingEvents.length, icon: Calendar, color: 'bg-orange-500', trend: 'This month' }
  ];

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1">
          <div className="p-8 flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 bg-gray-50 min-h-screen">
        <div className="p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">Welcome to the Intelligent School Directory System</p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <span className="text-green-600 text-sm font-semibold">{stat.trend}</span>
                  </div>
                  <h3 className="text-gray-500 text-sm mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold text-gray-800">{stat.value.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Search Trends</h3>
                <TrendingUp size={20} className="text-gray-400" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={searchTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="searches" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Department Distribution</h3>
                <span className="text-sm text-gray-500">Based on {statistics.students} students</span>
              </div>
              {departmentData.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <div className="text-center">
                    <p>No student data available</p>
                    <p className="text-sm mt-2">Add students to see department distribution</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name.split(' ')[0]} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${value} students`, props.payload.name]} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          
          {/* Popular Searches and Upcoming Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Popular Searches</h3>
                <TrendingUp size={20} className="text-gray-400" />
              </div>
              <div className="space-y-3">
                {popularSearches.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No search data available yet</p>
                    <p className="text-sm mt-2">Start using the search feature to see trends</p>
                  </div>
                ) : (
                  popularSearches.map((search, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`font-bold ${
                          index === 0 ? 'text-yellow-500' : 
                          index === 1 ? 'text-gray-400' : 
                          index === 2 ? 'text-orange-400' : 'text-gray-500'
                        }`}>#{index + 1}</span>
                        <span className="text-gray-700 font-medium">{search.query}</span>
                      </div>
                      <span className="text-sm text-gray-500">{search.count} searches</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Upcoming Events</h3>
                <Calendar size={20} className="text-gray-400" />
              </div>
              <div className="space-y-3">
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No upcoming events</p>
                    <p className="text-sm mt-2">Go to Events page to create an event</p>
                  </div>
                ) : (
                  upcomingEvents.map((event, index) => (
                    <div key={event.id || index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            getDaysUntil(event.date) === 'Today' ? 'bg-red-100' :
                            getDaysUntil(event.date) === 'Tomorrow' ? 'bg-orange-100' : 'bg-blue-100'
                          }`}>
                            <Calendar size={18} className={
                              getDaysUntil(event.date) === 'Today' ? 'text-red-600' :
                              getDaysUntil(event.date) === 'Tomorrow' ? 'text-orange-600' : 'text-blue-600'
                            } />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-gray-800">{event.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              getDaysUntil(event.date) === 'Today' ? 'bg-red-100 text-red-700' :
                              getDaysUntil(event.date) === 'Tomorrow' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {getDaysUntil(event.date)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar size={12} />
                              <span>{formatEventDate(event.date)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin size={12} />
                              <span>{event.location}</span>
                            </div>
                          </div>
                          {event.event_link && (
                            <a href={event.event_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block">
                              View Event Details →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">System Intelligence Features</h3>
            <p className="text-gray-600">
              This system uses fuzzy matching for intelligent search, predictive analytics for popular searches,
              and real-time event tracking. The department distribution chart automatically syncs with your student data,
              and upcoming events are displayed based on your posted events.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;