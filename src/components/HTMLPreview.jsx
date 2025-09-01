import React, { useState } from 'react';
import { Copy, Download, Eye, Code, Grid, Modal } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HTMLPreview = ({ htmlData, isLoading }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [activeCategory, setActiveCategory] = useState('all');
  const [copied, setCopied] = useState('');

  if (!htmlData || isLoading) {
    return (
      <div className="w-full p-8 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  const { html_snippets, complete_templates, css_styles, javascript_code, template_types } = htmlData;

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTabIcon = (type) => {
    switch (type) {
      case 'basic': return <Code className="h-4 w-4" />;
      case 'modal': return <Modal className="h-4 w-4" />;
      case 'grid': return <Grid className="h-4 w-4" />;
      default: return <Code className="h-4 w-4" />;
    }
  };

  const getTabLabel = (type) => {
    switch (type) {
      case 'basic': return 'Basic Layout';
      case 'modal': return 'Modal View';
      case 'grid': return 'Grid Layout';
      default: return type;
    }
  };

  const getCurrentContent = () => {
    if (activeCategory === 'all') {
      return complete_templates[activeTab];
    } else if (activeCategory === 'css') {
      return css_styles;
    } else if (activeCategory === 'js') {
      return javascript_code;
    } else {
      return html_snippets[activeTab][activeCategory] || '';
    }
  };

  const getFileName = () => {
    if (activeCategory === 'all') {
      return `presentation-${activeTab}.html`;
    } else if (activeCategory === 'css') {
      return 'styles.css';
    } else if (activeCategory === 'js') {
      return 'script.js';
    } else {
      return `${activeCategory.toLowerCase().replace(' ', '-')}-${activeTab}.html`;
    }
  };

  const categories = ['all', ...Object.keys(html_snippets[activeTab] || {}), 'css', 'js'];

  return (
    <div className="w-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">HTML Code Preview</h2>
        
        {/* Template Type Tabs */}
        <div className="flex space-x-1 mb-4">
          {template_types.map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getTabIcon(type)}
              <span>{getTabLabel(type)}</span>
            </button>
          ))}
        </div>

        {/* Category Selector */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'Complete Template' : 
               category === 'css' ? 'CSS Styles' :
               category === 'js' ? 'JavaScript' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {activeCategory === 'all' ? `Complete ${getTabLabel(activeTab)} Template` :
             activeCategory === 'css' ? 'CSS Styles' :
             activeCategory === 'js' ? 'JavaScript Code' :
             `${activeCategory} - ${getTabLabel(activeTab)}`}
          </h3>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(getCurrentContent(), `${activeCategory}-${activeTab}`)}
              className="flex items-center space-x-2"
            >
              <Copy className="h-4 w-4" />
              <span>{copied === `${activeCategory}-${activeTab}` ? 'Copied!' : 'Copy'}</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadFile(getCurrentContent(), getFileName())}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </Button>
          </div>
        </div>

        {/* Code Preview */}
        <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
          <pre className="text-sm text-gray-100 whitespace-pre-wrap">
            <code>{getCurrentContent()}</code>
          </pre>
        </div>

        {/* Live Preview for Complete Templates */}
        {activeCategory === 'all' && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Live Preview</h4>
            <div className="border border-gray-200 rounded-lg p-4 bg-white max-h-96 overflow-auto">
              <iframe
                srcDoc={getCurrentContent()}
                className="w-full h-64 border-0"
                title="HTML Preview"
              />
            </div>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Usage Instructions:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Complete Template:</strong> Ready-to-use HTML file with embedded CSS and JavaScript</li>
            <li>• <strong>Individual Snippets:</strong> HTML code for specific categories to embed in existing pages</li>
            <li>• <strong>CSS Styles:</strong> Stylesheet for custom styling and responsive design</li>
            <li>• <strong>JavaScript:</strong> Interactive functionality for modals and carousels</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HTMLPreview;

