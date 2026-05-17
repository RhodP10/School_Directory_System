import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';

const ImageUpload = ({ currentImage, onImageUpload, onImageRemove, label = "Profile Picture" }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || '');
  const [error, setError] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, GIF)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setPreview(URL.createObjectURL(file));
      onImageUpload(response.data.image_url);
      
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview('');
    onImageRemove();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      <div className="flex items-start gap-4">
        {/* Image Preview */}
        <div className="flex-shrink-0">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Profile preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
              <ImageIcon size={32} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="file"
              id="profile-image"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
            <label
              htmlFor="profile-image"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Upload size={18} />
              {uploading ? 'Uploading...' : 'Upload Image'}
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Recommended: Square image, max 2MB (JPG, PNG, GIF)
          </p>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;