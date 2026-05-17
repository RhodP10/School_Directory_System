import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { UserPlus, Edit, Trash2, X, Search, Filter } from 'lucide-react';

const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [filteredFaculty, setFilteredFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    full_name: '',
    department: '',
    role: 'faculty',
    email: '',
    contact: '',
    status: 'active'
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  // Department options
  const departmentOptions = [
    'Computer Science',
    'Information Technology',
    'Entertainment and Multimedia Computing',
    'Computer Engineering',
    'Information Systems',
    'Data Science'
  ];

  useEffect(() => {
    fetchFaculty();
  }, []);

  useEffect(() => {
    filterFaculty();
  }, [searchTerm, selectedDepartment, faculty]);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const response = await api.get('/people?role=faculty');
      setFaculty(response.data);
      setFilteredFaculty(response.data);
      
      // Extract unique departments from data
      const uniqueDepts = [...new Set(response.data.map(f => f.department).filter(d => d))];
      setDepartments(uniqueDepts);
      
      setMessage({ type: 'success', text: 'Faculty loaded successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error fetching faculty:', error);
      setMessage({ type: 'error', text: 'Error loading faculty. Make sure backend is running.' });
    } finally {
      setLoading(false);
    }
  };

  const filterFaculty = () => {
    let filtered = [...faculty];
    
    // Filter by department
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(f => f.department === selectedDepartment);
    }
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(f => 
        f.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredFaculty(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post('/people', formData);
      setFaculty([...faculty, response.data]);
      setShowModal(false);
      setFormData({
        full_name: '',
        department: '',
        role: 'faculty',
        email: '',
        contact: '',
        status: 'active'
      });
      setMessage({ type: 'success', text: 'Faculty added successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      fetchFaculty();
    } catch (error) {
      console.error('Error adding faculty:', error);
      setMessage({ type: 'error', text: 'Error adding faculty. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (facultyMember) => {
    setSelectedFaculty(facultyMember);
    setFormData({
      full_name: facultyMember.full_name,
      department: facultyMember.department,
      role: facultyMember.role,
      email: facultyMember.email,
      contact: facultyMember.contact,
      status: facultyMember.status
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.put(`/people/${selectedFaculty.id}`, formData);
      const updatedFaculty = faculty.map(f => f.id === selectedFaculty.id ? response.data : f);
      setFaculty(updatedFaculty);
      setShowEditModal(false);
      setSelectedFaculty(null);
      setFormData({
        full_name: '',
        department: '',
        role: 'faculty',
        email: '',
        contact: '',
        status: 'active'
      });
      setMessage({ type: 'success', text: 'Faculty updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      fetchFaculty();
    } catch (error) {
      console.error('Error updating faculty:', error);
      setMessage({ type: 'error', text: 'Error updating faculty. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        setLoading(true);
        await api.delete(`/people/${id}`);
        setFaculty(faculty.filter(f => f.id !== id));
        setMessage({ type: 'success', text: 'Faculty deleted successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        fetchFaculty();
      } catch (error) {
        console.error('Error deleting faculty:', error);
        setMessage({ type: 'error', text: 'Error deleting faculty. Please try again.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('all');
  };

  if (loading && faculty.length === 0) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1">
          <div className="p-8 flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading faculty...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1">
        
        <div className="p-8 mt-16">
          {/* Message Alert */}
          {message.text && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}
          
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Faculty Management</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <UserPlus size={20} />
              Add Faculty
            </button>
          </div>
          
          {/* Filters Section */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={18} className="text-gray-600" />
              <h3 className="font-semibold text-gray-700">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Department Filter */}
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Departments</option>
                {departmentOptions.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              
              {/* Reset Filters Button */}
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Reset Filters
              </button>
            </div>
            
            {/* Results Count */}
            <div className="mt-3 text-sm text-gray-600">
              Showing {filteredFaculty.length} of {faculty.length} faculty members
            </div>
          </div>
          
          {/* Faculty Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600">Name</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Department</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Email</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Contact</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaculty.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-8 text-gray-500">
                      {faculty.length === 0 ? 'No faculty found. Click "Add Faculty" to create one.' : 'No faculty match your filters.'}
                    </td>
                  </tr>
                ) : (
                  filteredFaculty.map((member) => (
                    <tr key={member.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{member.full_name}</td>
                      <td className="p-4 text-gray-600">{member.department}</td>
                      <td className="p-4 text-gray-600">{member.email}</td>
                      <td className="p-4 text-gray-600">{member.contact || 'N/A'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(member)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(member.id, member.full_name)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Add Faculty Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Faculty</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Entertainment and Multimedia Computing">Entertainment and Multimedia Computing</option>
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Information Systems">Information Systems</option>
                    <option value="Data Science">Data Science</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input
                    type="text"
                    placeholder="Enter contact number"
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Add Faculty
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Faculty Modal */}
      {showEditModal && selectedFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Faculty</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Entertainment and Multimedia Computing">Entertainment and Multimedia Computing</option>
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Information Systems">Information Systems</option>
                    <option value="Data Science">Data Science</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Update Faculty
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Faculty;