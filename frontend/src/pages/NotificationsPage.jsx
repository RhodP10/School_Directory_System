import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import axios from 'axios';
import { Calendar, MapPin, Link as LinkIcon, Image, X, Edit, Trash2, Plus, ExternalLink, Clock, Upload } from 'lucide-react';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [imagePreview, setImagePreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    image_url: '',
    event_link: '',
    organizer: '',
    created_by: 'Admin'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setMessage({ type: 'error', text: 'Error loading events. Make sure backend is running.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle image file upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
      return;
    }
    
    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    
    try {
      const response = await axios.post('http://localhost:8000/api/upload-image', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({...formData, image_url: response.data.image_url});
      setImagePreview(URL.createObjectURL(file));
      setMessage({ type: 'success', text: 'Image uploaded successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ type: 'error', text: 'Error uploading image. Using URL mode instead.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/events', formData);
      setShowModal(false);
      resetForm();
      fetchEvents();
      setMessage({ type: 'success', text: 'Event posted successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error creating event:', error);
      setMessage({ type: 'error', text: 'Error creating event. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date.slice(0, 16),
      location: event.location,
      image_url: event.image_url || '',
      event_link: event.event_link || '',
      organizer: event.organizer,
      created_by: 'Admin'
    });
    setImagePreview(event.image_url || '');
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put(`/events/${selectedEvent.id}`, formData);
      setShowEditModal(false);
      resetForm();
      fetchEvents();
      setMessage({ type: 'success', text: 'Event updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating event:', error);
      setMessage({ type: 'error', text: 'Error updating event.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        setLoading(true);
        await api.delete(`/events/${id}`);
        fetchEvents();
        setMessage({ type: 'success', text: 'Event deleted successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        console.error('Error deleting event:', error);
        setMessage({ type: 'error', text: 'Error deleting event.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      location: '',
      image_url: '',
      event_link: '',
      organizer: '',
      created_by: 'Admin'
    });
    setImagePreview('');
    setSelectedFile(null);
    setSelectedEvent(null);
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1">
          <div className="p-8 flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading events...</p>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Campus Events</h1>
              <p className="text-gray-600 mt-1">Stay updated with upcoming events and activities</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Post Event
            </button>
          </div>
          
          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.length === 0 ? (
              <div className="col-span-3 text-center py-12 bg-gray-50 rounded-lg">
                <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No events posted yet.</p>
                <p className="text-gray-400 text-sm mt-2">Click "Post Event" to create your first event!</p>
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Event Image */}
                  {event.image_url ? (
                    <img 
                      src={event.image_url} 
                      alt={event.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x200?text=Event+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                      <Calendar size={48} className="text-white" />
                    </div>
                  )}
                  
                  <div className="p-5">
                    {/* Title and Actions */}
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-gray-800">{event.title}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(event)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit event"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id, event.title)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete event"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.description}</p>
                    
                    {/* Event Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Calendar size={16} />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <MapPin size={16} />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Clock size={16} />
                        <span>Organized by: {event.organizer}</span>
                      </div>
                    </div>
                    
                    {/* Links */}
                    <div className="flex gap-3">
                      {event.event_link && (
                        <a
                          href={event.event_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 text-sm hover:text-blue-800 transition-colors"
                        >
                          <LinkIcon size={14} />
                          Event Link
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    
                    {/* Posted Date */}
                    <p className="text-xs text-gray-400 mt-4">
                      Posted on: {new Date(event.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Create Event Modal with Image Upload */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Post New Event</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Annual Tech Conference 2024"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Describe the event details, agenda, etc."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Auditorium, Room 101, Online"
                      required
                    />
                  </div>
                </div>
                
                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Image</label>
                  
                  {/* Upload Button */}
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Upload an image</span>
                          <input 
                            type="file" 
                            className="sr-only" 
                            accept="image/*" 
                            onChange={handleImageUpload}
                            disabled={uploading}
                          />
                        </label>
                        <p className="pl-1">or enter URL below</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </div>
                  
                  {uploading && (
                    <p className="text-sm text-blue-600 mt-2 text-center">Uploading image...</p>
                  )}
                  
                  {/* OR Divider */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                  </div>
                  
                  {/* Image URL Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) => {
                        setFormData({...formData, image_url: e.target.value});
                        setImagePreview(e.target.value);
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/event-image.jpg"
                    />
                  </div>
                </div>
                
                {/* Image Preview */}
                {imagePreview && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image Preview</label>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg border"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Link (Optional)</label>
                  <input
                    type="url"
                    value={formData.event_link}
                    onChange={(e) => setFormData({...formData, event_link: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://eventbrite.com/..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organizer *</label>
                  <input
                    type="text"
                    value={formData.organizer}
                    onChange={(e) => setFormData({...formData, organizer: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Student Council, CS Department"
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Post Event'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); resetForm(); }} 
                  className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Event Modal */}
      {showEditModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Event</h2>
              <button onClick={() => { setShowEditModal(false); resetForm(); }} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    rows="4"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => {
                      setFormData({...formData, image_url: e.target.value});
                      setImagePreview(e.target.value);
                    }}
                    className="w-full p-2 border rounded-lg"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Link</label>
                  <input
                    type="url"
                    value={formData.event_link}
                    onChange={(e) => setFormData({...formData, event_link: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    placeholder="https://..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organizer *</label>
                  <input
                    type="text"
                    value={formData.organizer}
                    onChange={(e) => setFormData({...formData, organizer: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Update Event
                </button>
                <button type="button" onClick={() => { setShowEditModal(false); resetForm(); }} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300">
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

export default EventsPage;