import React, { useState } from 'react';
import { X, Cloud, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const S3ConfigModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [config, setConfig] = useState({
    bucket: '',
    accessKey: '',
    secretKey: '',
    region: 'us-east-1'
  });
  const [errors, setErrors] = useState({});

  const validateConfig = () => {
    const newErrors = {};
    
    if (!config.bucket.trim()) {
      newErrors.bucket = 'S3 bucket name is required';
    }
    
    if (!config.accessKey.trim()) {
      newErrors.accessKey = 'AWS Access Key ID is required';
    }
    
    if (!config.secretKey.trim()) {
      newErrors.secretKey = 'AWS Secret Access Key is required';
    }
    
    if (!config.region.trim()) {
      newErrors.region = 'AWS region is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateConfig()) {
      onSubmit(config);
    }
  };

  const handleInputChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Cloud className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">AWS S3 Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* S3 Bucket */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              S3 Bucket Name *
            </label>
            <input
              type="text"
              value={config.bucket}
              onChange={(e) => handleInputChange('bucket', e.target.value)}
              placeholder="my-presentation-bucket"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.bucket ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.bucket && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.bucket}
              </p>
            )}
          </div>

          {/* AWS Access Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AWS Access Key ID *
            </label>
            <input
              type="text"
              value={config.accessKey}
              onChange={(e) => handleInputChange('accessKey', e.target.value)}
              placeholder="AKIAIOSFODNN7EXAMPLE"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.accessKey ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.accessKey && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.accessKey}
              </p>
            )}
          </div>

          {/* AWS Secret Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AWS Secret Access Key *
            </label>
            <input
              type="password"
              value={config.secretKey}
              onChange={(e) => handleInputChange('secretKey', e.target.value)}
              placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.secretKey ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.secretKey && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.secretKey}
              </p>
            )}
          </div>

          {/* AWS Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AWS Region *
            </label>
            <select
              value={config.region}
              onChange={(e) => handleInputChange('region', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.region ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            >
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="us-east-2">US East (Ohio)</option>
              <option value="us-west-1">US West (N. California)</option>
              <option value="us-west-2">US West (Oregon)</option>
              <option value="eu-west-1">Europe (Ireland)</option>
              <option value="eu-central-1">Europe (Frankfurt)</option>
              <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
              <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
            </select>
            {errors.region && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.region}
              </p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Security Note:</p>
                <p>Your AWS credentials are only used for this session and are not stored. Make sure your S3 bucket has public read permissions for the uploaded images.</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Generate HTML'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default S3ConfigModal;

