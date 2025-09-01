import React, { useState } from 'react';
import { Presentation, ArrowRight, CheckCircle, AlertCircle, Upload, FileText, X, Check, Building2, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import './App.css';

function App() {
  const [currentStep, setCurrentStep] = useState(0); // Start with step 0 for fund info
  const [fundInfo, setFundInfo] = useState({ fundId: '', fundName: '' });
  const [uploadData, setUploadData] = useState(null);
  const [selectedSlides, setSelectedSlides] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [categories, setCategories] = useState(['Summary', 'Market', 'Strategy', 'Team', 'Track Record']);
  const [editingCategories, setEditingCategories] = useState(false);
  const [tempCategories, setTempCategories] = useState([]);

  const API_BASE = import.meta.env.VITE_API_BASE || 
    (import.meta.env.MODE === 'production' 
      ? 'https://fund-slide-parse-717f0957fd9f.herokuapp.com/api'
      : 'http://localhost:5000/api');

  const handleEditCategories = () => {
    setTempCategories([...categories]);
    setEditingCategories(true);
  };

  const handleSaveCategories = () => {
    setCategories([...tempCategories]);
    setEditingCategories(false);
    // Reset any selected slides that have invalid categories
    setSelectedSlides(prev => prev.map(slide => ({
      ...slide,
      category: tempCategories.includes(slide.category) ? slide.category : ''
    })));
  };

  const handleCancelEditCategories = () => {
    setTempCategories([]);
    setEditingCategories(false);
  };

  const handleFundInfoSubmit = (e) => {
    e.preventDefault();
    if (fundInfo.fundId.trim() && fundInfo.fundName.trim()) {
      setCurrentStep(1);
      setError('');
    } else {
      setError('Please enter both Fund ID and Fund Name');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setError('');

    // Validate file
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      setIsUploading(false);
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fund_id', fundInfo.fundId);
    formData.append('fund_name', fundInfo.fundName);

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setUploadData(data);
      setCurrentStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSlideToggle = (slideIndex) => {
    const newSelected = [...selectedSlides];
    const existingIndex = newSelected.findIndex(s => s.id === uploadData.slides[slideIndex].id);
    
    if (existingIndex >= 0) {
      newSelected.splice(existingIndex, 1);
    } else {
      newSelected.push({
        ...uploadData.slides[slideIndex],
        selected: true,
        category: null
      });
    }
    
    setSelectedSlides(newSelected);
  };

  const handleCategoryAssign = (slideIndex, category) => {
    const newSelected = [...selectedSlides];
    const slide = newSelected.find(s => s.id === uploadData.slides[slideIndex].id);
    if (slide) {
      slide.category = category;
      setSelectedSlides(newSelected);
    }
  };

  const handleUnselectSlide = (slideIndex) => {
    const newSelected = selectedSlides.filter(s => s.id !== uploadData.slides[slideIndex].id);
    setSelectedSlides(newSelected);
  };

  const selectAllSlides = () => {
    const allSelected = uploadData.slides.map(slide => ({
      ...slide,
      selected: true,
      category: null
    }));
    setSelectedSlides(allSelected);
  };

  const unselectAllSlides = () => {
    setSelectedSlides([]);
  };

  const resetApp = () => {
    setCurrentStep(0);
    setFundInfo({ fundId: '', fundName: '' });
    setUploadData(null);
    setSelectedSlides([]);
    setError('');
  };

  const steps = [
    { number: 0, title: 'Fund Info', description: 'Enter fund details' },
    { number: 1, title: 'Upload PDF', description: 'Upload your presentation file' },
    { number: 2, title: 'Select Slides', description: 'Choose and categorize slides' },
    { number: 3, title: 'Generate HTML', description: 'Get your HTML code' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Presentation className="h-8 w-8 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900">Slide Parser</h1>
              {fundInfo.fundName && currentStep > 0 && (
                <div className="ml-6 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {fundInfo.fundName} ({fundInfo.fundId})
                </div>
              )}
            </div>
            <Button variant="outline" onClick={resetApp}>
              Start Over
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step.number
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-gray-400 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Step 0: Fund Information */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Fund Information
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Enter your fund details to organize and name your presentation slides properly.
              </p>
            </div>
            
            <div className="w-full max-w-md mx-auto">
              <form onSubmit={handleFundInfoSubmit} className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="fundId" className="block text-sm font-medium text-gray-700 mb-2">
                        <Hash className="h-4 w-4 inline mr-2" />
                        Fund ID
                      </label>
                      <input
                        type="text"
                        id="fundId"
                        value={fundInfo.fundId}
                        onChange={(e) => setFundInfo({...fundInfo, fundId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., FUND001, ABC123"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="fundName" className="block text-sm font-medium text-gray-700 mb-2">
                        <Building2 className="h-4 w-4 inline mr-2" />
                        Fund Name
                      </label>
                      <input
                        type="text"
                        id="fundName"
                        value={fundInfo.fundName}
                        onChange={(e) => setFundInfo({...fundInfo, fundName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., TechCorp Ventures, Growth Fund Alpha"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button type="submit" className="w-full">
                      Continue to Upload
                    </Button>
                  </div>
                </div>
                
                <div className="text-center text-sm text-gray-500">
                  <p>Images will be named: <code className="bg-gray-100 px-2 py-1 rounded">{fundInfo.fundId || 'FundID'}_{fundInfo.fundName || 'FundName'}_slide1.png</code></p>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Step 1: File Upload */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Upload Presentation
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload your PDF presentation for <strong>{fundInfo.fundName}</strong>. 
                Slides will be processed and ready for categorization.
              </p>
            </div>
            
            {/* File Upload Area */}
            <div className="w-full max-w-2xl mx-auto">
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                
                <div className="flex flex-col items-center space-y-4">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  ) : (
                    <Upload className="h-12 w-12 text-gray-400" />
                  )}
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {isUploading ? 'Processing PDF...' : 'Upload PDF Presentation'}
                    </h3>
                    <p className="text-gray-600">
                      Drag and drop your PDF file here, or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Maximum file size: 50MB
                    </p>
                  </div>
                  
                  {!isUploading && (
                    <Button variant="outline" className="mt-4">
                      <FileText className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Slide Selection */}
        {currentStep === 2 && uploadData && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Select and Categorize Slides
              </h2>
              <p className="text-lg text-gray-600">
                Found {uploadData.total_slides} slides in "{uploadData.filename}" for <strong>{fundInfo.fundName}</strong>
              </p>
            </div>

            {/* Selection Controls */}
            <div className="flex justify-center space-x-4 mb-6">
              <Button 
                variant="outline" 
                onClick={selectAllSlides}
                className="flex items-center space-x-2"
              >
                <Check className="h-4 w-4" />
                <span>Select All</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={unselectAllSlides}
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Unselect All</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleEditCategories}
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>Edit Categories</span>
              </Button>
            </div>

            {/* Category Editing Modal */}
            {editingCategories && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">Edit Categories</h3>
                  <div className="space-y-3">
                    {tempCategories.map((category, index) => (
                      <input
                        key={index}
                        type="text"
                        value={category}
                        onChange={(e) => {
                          const newCategories = [...tempCategories];
                          newCategories[index] = e.target.value;
                          setTempCategories(newCategories);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Category ${index + 1}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={handleCancelEditCategories}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveCategories}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Save Categories
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Slides Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {uploadData.slides.map((slide, index) => {
                const isSelected = selectedSlides.some(s => s.id === slide.id);
                const selectedSlide = selectedSlides.find(s => s.id === slide.id);
                
                return (
                  <div
                    key={index}
                    className={`relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 ${
                      isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-lg'
                    }`}
                  >
                    {/* Selection Controls */}
                    <div className="absolute top-3 left-3 z-10 flex space-x-2">
                      <button
                        onClick={() => handleSlideToggle(index)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'bg-white border-gray-300 hover:border-gray-400'
                        }`}
                        title={isSelected ? 'Unselect slide' : 'Select slide'}
                      >
                        {isSelected && <Check className="h-4 w-4" />}
                      </button>
                      
                      {isSelected && (
                        <button
                          onClick={() => handleUnselectSlide(index)}
                          className="w-6 h-6 rounded bg-red-500 border-2 border-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                          title="Remove slide"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    {/* Slide Image */}
                    <div 
                      className="aspect-[4/3] bg-gray-100 cursor-pointer"
                      onClick={() => handleSlideToggle(index)}
                    >
                      <img
                        src={slide.thumbnail}
                        alt={`Slide ${slide.id}`}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Slide Info */}
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-900">
                          Slide {slide.id}
                        </span>
                        {selectedSlide?.category && (
                          <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 border border-blue-200">
                            {selectedSlide.category}
                          </span>
                        )}
                      </div>

                      {/* Category Assignment */}
                      {isSelected && (
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-700">
                            Assign Category:
                          </label>
                          <div className="grid grid-cols-2 gap-1">
                            {categories.map((category) => (
                              <button
                                key={category}
                                onClick={() => handleCategoryAssign(index, category)}
                                className={`px-2 py-1 text-xs rounded border transition-colors ${
                                  selectedSlide?.category === category
                                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                }`}
                              >
                                {category}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Unselect Button for Selected Slides */}
                      {isSelected && (
                        <button
                          onClick={() => handleUnselectSlide(index)}
                          className="mt-3 w-full px-3 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors flex items-center justify-center space-x-1"
                        >
                          <X className="h-3 w-3" />
                          <span>Remove from Selection</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Generate Button */}
            <div className="flex justify-center">
              <Button
                onClick={() => setCurrentStep(3)}
                size="lg"
                className="px-8 py-3"
                disabled={selectedSlides.length === 0 || !selectedSlides.some(s => s.category)}
              >
                Generate HTML Code ({selectedSlides.filter(s => s.category).length} slides ready)
              </Button>
            </div>

            {/* Selection Summary */}
            {selectedSlides.length > 0 && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Selection Summary for {fundInfo.fundName}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {categories.map((category) => {
                    const count = selectedSlides.filter(s => s.category === category).length;
                    return (
                      <div key={category} className="text-center">
                        <div className="px-3 py-2 rounded-lg bg-blue-100 text-blue-800 border border-blue-200">
                          <div className="font-semibold">{count}</div>
                          <div className="text-xs">{category}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  Files will be named: <code className="bg-white px-2 py-1 rounded">{fundInfo.fundId}_{fundInfo.fundName}_slide1.png</code>, etc.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: HTML Generation */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Generated HTML Code
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Copy and paste these HTML snippets into your website. Each category is organized separately.
              </p>
            </div>

            {/* Category-based HTML Generation */}
            {categories.map((category) => {
              const categorySlides = selectedSlides.filter(s => s.category === category);
              if (categorySlides.length === 0) return null;

              const generateCategoryHTML = () => {
                const slidesHTML = categorySlides.map((slide, index) => {
                  const fileName = `${fundInfo.fundId}_${fundInfo.fundName.replace(/\s+/g, '_')}_slide${slide.page}.png`;
                  const altText = `${category}_slide${index + 1}`;
                  return `    <div class="slide-item">
      <img src="https://your-bucket.s3.amazonaws.com/${fileName}" alt="${altText}" />
      <p>${slide.title || `Slide ${slide.page}`}</p>
    </div>`;
                }).join('\n');

                return `<!-- ${category} Section -->
<div class="${category.toLowerCase().replace(/\s+/g, '-')}-section">
  <h2>${category}</h2>
  <div class="slides-container">
${slidesHTML}
  </div>
</div>`;
              };

              return (
                <div key={category} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-blue-500 text-white px-6 py-4">
                    <h3 className="text-lg font-semibold">
                      📂 {category} Section ({categorySlides.length} slide{categorySlides.length !== 1 ? 's' : ''})
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="bg-gray-900 rounded-lg overflow-hidden">
                      <div className="bg-gray-800 px-4 py-2 text-gray-300 text-sm font-medium">
                        HTML Code - Copy and Paste Ready
                      </div>
                      <pre className="p-4 text-green-400 text-sm overflow-x-auto">
                        <code>{generateCategoryHTML()}</code>
                      </pre>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generateCategoryHTML());
                        alert(`${category} HTML code copied to clipboard!`);
                      }}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Copy {category} Code
                    </button>
                  </div>
                </div>
              );
            })}

            {/* CSS Styles */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-500 text-white px-6 py-4">
                <h3 className="text-lg font-semibold">🎨 CSS Styles (Include Once)</h3>
              </div>
              <div className="p-6">
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="bg-gray-800 px-4 py-2 text-gray-300 text-sm font-medium">
                    CSS Styles - Add to your website's stylesheet
                  </div>
                  <pre className="p-4 text-blue-400 text-sm overflow-x-auto">
                    <code>{`.summary-section, .market-section, .strategy-section, .team-section, .track-record-section {
  margin: 20px 0;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.slides-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.slide-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.slide-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.slide-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.slide-item p {
  padding: 15px;
  font-weight: 500;
  color: #374151;
  margin: 0;
}`}</code>
                  </pre>
                </div>
                <button
                  onClick={() => {
                    const cssCode = `.summary-section, .market-section, .strategy-section, .team-section, .track-record-section {
  margin: 20px 0;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.slides-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.slide-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.slide-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.slide-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.slide-item p {
  padding: 15px;
  font-weight: 500;
  color: #374151;
  margin: 0;
}`;
                    navigator.clipboard.writeText(cssCode);
                    alert('CSS styles copied to clipboard!');
                  }}
                  className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Copy CSS Styles
                </button>
              </div>
            </div>

            {/* Back Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                ← Back to Slide Selection
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

