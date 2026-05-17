import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';
import { UserPlus, Edit, Trash2, X, Search, Filter, User } from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedYearLevel, setSelectedYearLevel] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    full_name: '',
    department: '',
    year_level: '',
    role: 'student',
    email: '',
    contact: '',
    status: 'active',
    profile_image: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const departmentOptions = [
    'Computer Science',
    'Information Technology',
    'Entertainment and Multimedia Computing',
    'Computer Engineering',
    'Information Systems',
    'Data Science'
  ];

  const yearLevelOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, selectedDepartment, selectedYearLevel, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/people?role=student');
      setStudents(response.data);
      setFilteredStudents(response.data);
      
      const uniqueDepts = [...new Set(response.data.map(s => s.department).filter(d => d))];
      setDepartments(uniqueDepts);
      
    } catch (error) {
      console.error('Error fetching students:', error);
      setMessage({ type: 'error', text: 'Error loading students.' });
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];
    
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(s => s.department === selectedDepartment);
    }
    
    if (selectedYearLevel !== 'all') {
      filtered = filtered.filter(s => s.year_level === selectedYearLevel);
    }
    
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(s => 
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredStudents(filtered);
  };

  const handleImageUpload = (imageUrl) => {
    setFormData({ ...formData, profile_image: imageUrl });
  };

  const handleImageRemove = () => {
    setFormData({ ...formData, profile_image: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post('/people', formData);
      setStudents([...students, response.data]);
      setShowModal(false);
      setFormData({
        full_name: '',
        department: '',
        year_level: '',
        role: 'student',
        email: '',
        contact: '',
        status: 'active',
        profile_image: ''
      });
      setMessage({ type: 'success', text: 'Student added successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      fetchStudents();
    } catch (error) {
      console.error('Error adding student:', error);
      setMessage({ type: 'error', text: 'Error adding student.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      full_name: student.full_name,
      department: student.department,
      year_level: student.year_level || '',
      role: student.role,
      email: student.email,
      contact: student.contact,
      status: student.status,
      profile_image: student.profile_image || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.put(`/people/${selectedStudent.id}`, formData);
      const updatedStudents = students.map(s => 
        s.id === selectedStudent.id ? response.data : s
      );
      setStudents(updatedStudents);
      setShowEditModal(false);
      setSelectedStudent(null);
      setFormData({
        full_name: '',
        department: '',
        year_level: '',
        role: 'student',
        email: '',
        contact: '',
        status: 'active',
        profile_image: ''
      });
      setMessage({ type: 'success', text: 'Student updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      fetchStudents();
    } catch (error) {
      console.error('Error updating student:', error);
      setMessage({ type: 'error', text: 'Error updating student.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        setLoading(true);
        await api.delete(`/people/${id}`);
        setStudents(students.filter(s => s.id !== id));
        setMessage({ type: 'success', text: 'Student deleted successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        setMessage({ type: 'error', text: 'Error deleting student.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('all');
    setSelectedYearLevel('all');
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1 bg-gray-50 min-h-screen">
          <div className="p-8 flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
          {message.text && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}
          
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Students Management</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <UserPlus size={20} />
              Add Student
            </button>
          </div>
          
          {/* Filters */}
          <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={18} className="text-gray-600" />
              <h3 className="font-semibold text-gray-700">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="all">All Departments</option>
                {departmentOptions.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <select
                value={selectedYearLevel}
                onChange={(e) => setSelectedYearLevel(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="all">All Year Levels</option>
                {yearLevelOptions.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Reset Filters
              </button>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              Showing {filteredStudents.length} of {students.length} students
            </div>
          </div>
          
          {/* Students Table with Images */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-600">Photo</th>
                    <th className="text-left p-4 font-semibold text-gray-600">Name</th>
                    <th className="text-left p-4 font-semibold text-gray-600">Year Level</th>
                    <th className="text-left p-4 font-semibold text-gray-600">Department</th>
                    <th className="text-left p-4 font-semibold text-gray-600">Email</th>
                    <th className="text-left p-4 font-semibold text-gray-600">Contact</th>
                    <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                    <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center p-8 text-gray-500">
                        No students found.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          {student.profile_image ? (
                            <img
                              src={student.profile_image}
                              alt={student.full_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User size={16} className="text-gray-500" />
                            </div>
                          )}
                        </td>
                        <td className="p-4 font-medium">{student.full_name}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {student.year_level || 'N/A'}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">{student.department}</td>
                        <td className="p-4 text-gray-600">{student.email}</td>
                        <td className="p-4 text-gray-600">{student.contact || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(student)} className="text-blue-600 hover:text-blue-800">
                              <Edit size={18} />
                            </button>
                            <button onClick={() => handleDelete(student.id, student.full_name)} className="text-red-600 hover:text-red-800">
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
      </div>
      
      {/* Add Student Modal with Image Upload */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Student</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <ImageUpload
                  currentImage={formData.profile_image}
                  onImageUpload={handleImageUpload}
                  onImageRemove={handleImageRemove}
                  label="Profile Picture"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year Level *</label>
                  <select
                    value={formData.year_level}
                    onChange={(e) => setFormData({...formData, year_level: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Year Level</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full p-2 border rounded-lg"
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
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Add Student
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Student Modal with Image Upload */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Student</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <ImageUpload
                  currentImage={formData.profile_image}
                  onImageUpload={handleImageUpload}
                  onImageRemove={handleImageRemove}
                  label="Profile Picture"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year Level *</label>
                  <select
                    value={formData.year_level}
                    onChange={(e) => setFormData({...formData, year_level: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    required
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full p-2 border rounded-lg"
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
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Update Student
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300">
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

export default Students;