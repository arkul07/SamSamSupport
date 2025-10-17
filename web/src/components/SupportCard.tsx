import React from 'react';
import { ExternalLink, Clock, Phone, AlertTriangle } from 'lucide-react';
import { SupportCard as SupportCardType, SafetyCard } from '@sjsu-mhc/types';

interface SupportCardProps {
  card: SupportCardType;
}

export const SupportCardComponent: React.FC<SupportCardProps> = ({ card }) => {
  const isSafetyCard = card.category === 'safety';
  const safetyCard = card as SafetyCard;

  return (
    <div className={`support-card ${card.category}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {isSafetyCard && <AlertTriangle className="h-5 w-5 text-red-600" />}
          <h3 className="font-semibold text-gray-900">{card.title}</h3>
          {card.priority === 'high' && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              High Priority
            </span>
          )}
        </div>
      </div>

      <p className="text-gray-700 mb-4">{card.summary}</p>

      {card.action && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-800">
            <span>Action:</span>
            <span className="text-sjsu-600">{card.action}</span>
          </div>
        </div>
      )}

      {card.when_where && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{card.when_where}</span>
          </div>
        </div>
      )}

      {card.why_for_user && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Why this resource:</strong> {card.why_for_user}
          </p>
        </div>
      )}

      {/* Emergency Contacts for Safety Cards */}
      {isSafetyCard && safetyCard.emergency_contacts && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Emergency Contacts:</h4>
          <div className="space-y-2">
            {safetyCard.emergency_contacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <div className="font-medium text-red-900">{contact.name}</div>
                  <div className="text-sm text-red-700">{contact.description}</div>
                  <div className="text-xs text-red-600">Available: {contact.available}</div>
                </div>
                <div className="flex items-center space-x-2">
                  {contact.number.includes('Text') ? (
                    <span className="text-sm font-mono text-red-800">{contact.number}</span>
                  ) : (
                    <a
                      href={`tel:${contact.number.replace(/[^\d]/g, '')}`}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                    >
                      <Phone className="h-4 w-4" />
                      <span className="text-sm font-mono">{contact.number}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <a
          href={card.official_link}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-sm flex items-center space-x-2"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Visit Official Resource</span>
        </a>
        
        <button
          onClick={() => {
            // This would open an explanation modal in a real implementation
            alert('This feature would explain how this resource was selected based on your message and our ethical AI principles.');
          }}
          className="text-sm text-sjsu-600 hover:text-sjsu-700 underline"
        >
          Explain selection
        </button>
      </div>
    </div>
  );
};
