import React from 'react';
import { X, Shield, Eye, Lock, Scale, Heart, CheckCircle } from 'lucide-react';
import { EthicalPillar } from '@sjsu-mhc/types';

interface EthicsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pillars: EthicalPillar[];
}

export const EthicsDrawer: React.FC<EthicsDrawerProps> = ({ isOpen, onClose, pillars }) => {
  if (!isOpen) return null;

  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'transparency':
        return <Eye className="h-5 w-5" />;
      case 'consent':
        return <CheckCircle className="h-5 w-5" />;
      case 'privacy':
        return <Lock className="h-5 w-5" />;
      case 'fairness':
        return <Scale className="h-5 w-5" />;
      case 'safety':
        return <Shield className="h-5 w-5" />;
      case 'accountability':
        return <Heart className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const getColor = (name: string) => {
    switch (name.toLowerCase()) {
      case 'transparency':
        return 'text-blue-600 bg-blue-100';
      case 'consent':
        return 'text-green-600 bg-green-100';
      case 'privacy':
        return 'text-purple-600 bg-purple-100';
      case 'fairness':
        return 'text-orange-600 bg-orange-100';
      case 'safety':
        return 'text-red-600 bg-red-100';
      case 'accountability':
        return 'text-pink-600 bg-pink-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-sjsu-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Ethical AI Principles
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <p className="text-gray-700 text-sm">
                This system follows strict ethical guidelines to ensure your safety, privacy, and well-being.
              </p>
            </div>

            <div className="space-y-4">
              {pillars.map((pillar, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getColor(pillar.name)}`}>
                      {getIcon(pillar.name)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {pillar.name}
                      </h3>
                      <p className="text-sm text-gray-700 mb-3">
                        {pillar.description}
                      </p>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">
                          <strong>Implementation:</strong> {pillar.implementation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Information */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Your Rights</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You can withdraw consent at any time</li>
                <li>• Your data is not stored beyond this session</li>
                <li>• All resources link to official SJSU sources</li>
                <li>• Crisis situations trigger immediate safety resources</li>
              </ul>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Important Notice</h4>
              <p className="text-sm text-yellow-800">
                This is a prototype for educational purposes. For real mental health support, 
                contact SJSU CAPS directly at <strong>(408) 924-5678</strong>.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
