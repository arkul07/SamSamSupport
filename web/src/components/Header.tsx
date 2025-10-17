import React from 'react';
import { Shield, Info } from 'lucide-react';

interface HeaderProps {
  onShowEthics: () => void;
  hasConsent: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onShowEthics, hasConsent }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-sjsu-600 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                SJSU Mental Health Concierge
              </h1>
              <p className="text-sm text-gray-600">
                Connecting you with CAPS resources
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {hasConsent && (
              <button
                onClick={onShowEthics}
                className="flex items-center space-x-2 text-sjsu-600 hover:text-sjsu-700 transition-colors"
              >
                <Info className="h-4 w-4" />
                <span className="text-sm font-medium">Ethical AI</span>
              </button>
            )}
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${hasConsent ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-xs text-gray-600">
                {hasConsent ? 'Consent Given' : 'Consent Required'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
