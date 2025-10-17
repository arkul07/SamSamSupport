import React from 'react';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

interface ConsentModalProps {
  onConsent: () => void;
  sessionId: string;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({ onConsent, sessionId }) => {
  const handleAgree = () => {
    onConsent();
  };

  const handleExit = () => {
    window.location.href = 'https://www.sjsu.edu/counseling/';
  };

  return (
    <div className="consent-modal">
      <div className="consent-content">
        <div className="flex items-center mb-4">
          <Shield className="h-8 w-8 text-sjsu-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">
            Privacy & Consent
          </h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            <strong>I understand that this chatbot only uses what I share in this session and does not store personal data.</strong>
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-blue-900 mb-2">What this means:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                Your messages are processed only during this session
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                No personal information is stored permanently
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                All responses link to official SJSU CAPS resources
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                You can withdraw consent at any time
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-900 mb-2">Important:</h3>
            <p className="text-sm text-yellow-800">
              This is a prototype for educational purposes. For real mental health support, 
              please contact SJSU CAPS directly at <strong>(408) 924-5678</strong>.
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleAgree}
            className="btn-primary flex-1 flex items-center justify-center"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Agree & Continue
          </button>
          <button
            onClick={handleExit}
            className="btn-secondary flex-1 flex items-center justify-center"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Exit to CAPS
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Session ID: {sessionId}
          </p>
        </div>
      </div>
    </div>
  );
};
