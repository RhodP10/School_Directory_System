import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Search, TrendingUp, Sparkles, User, Mail, Phone, Building, Award } from 'lucide-react';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popularSearches, setPopularSearches] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    fetchPopularSearches();
    fetchPredictions();
  }, []);

  const fetchPopularSearches = async () => {
    try {
      const response = await api.get('/search/popular?limit=5');
      setPopularSearches(response.data.popular_searches);
    } catch (error) {
      console.error('Error fetching popular searches:', error);
    }
  };

  const fetchPredictions = async () => {
    try {
      const response = await api.get('/predictions/frequent?limit=5');
      setPredictions(response.data.predictions);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/search?query=${encodeURIComponent(query)}`);
      setResults(response.data.results);
      if (response.data.results.length > 0) {
        setSelectedResult(response.data.results[0]);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1">
        
        <div className="p-8 mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 mb-8 text-white">
            <h1 className="text-3xl font-bold mb-4">Intelligent Search</h1>
            <p className="text-blue-100 mb-6">
              Powered by Pogi Kame - Find students, faculty, and records with smart matching
            </p>
            
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search by name, department, or role..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
          
          {/* Quick Search Suggestions */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <TrendingUp size={16} />
              Popular Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(search.query)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                  {search.query}
                </button>
              ))}
            </div>
          </div>
          
          {/* AI Predictions */}
          {predictions.length > 0 && (
            <div className="mb-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="text-sm font-semibold text-purple-600 mb-3 flex items-center gap-2">
                <Sparkles size={16} />
                AI Predictions - Frequently Searched
              </h3>
              <div className="flex flex-wrap gap-2">
                {predictions.map((pred, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(pred.query)}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-colors"
                  >
                    {pred.query} ({pred.frequency})
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Search Results */}
          {results.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Results List */}
              <div className="lg:col-span-1">
                <h3 className="font-semibold text-gray-800 mb-4">Results ({results.length})</h3>
                <div className="space-y-3">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => setSelectedResult(result)}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedResult?.id === result.id
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-white border border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{result.name}</h4>
                        <span className={`text-sm font-semibold ${getConfidenceColor(result.confidence)}`}>
                          {result.confidence}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{result.role}</p>
                      <p className="text-sm text-gray-500">{result.department}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Result Details */}
              <div className="lg:col-span-2">
                {selectedResult && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                          {selectedResult.name}
                        </h2>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                            {selectedResult.role}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                            Confidence: {selectedResult.confidence}%
                          </span>
                        </div>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="text-white" size={32} />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Building className="text-blue-600" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Department</p>
                          <p className="font-medium text-gray-800">{selectedResult.department}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="text-blue-600" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-800">{selectedResult.email || 'Not provided'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="text-blue-600" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Contact</p>
                          <p className="font-medium text-gray-800">{selectedResult.contact || 'Not provided'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Award className="text-blue-600" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className={`font-medium ${
                            selectedResult.status === 'active' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {selectedResult.status || 'Active'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {!loading && results.length === 0 && query && (
            <div className="text-center py-12">
              <Search className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No results found</h3>
              <p className="text-gray-500">
                Try adjusting your search terms or check for typos
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;