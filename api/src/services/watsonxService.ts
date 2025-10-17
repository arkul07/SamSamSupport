import axios, { AxiosResponse } from 'axios';
import { WXORequest, WXOResponse, SupportCard, ChatResponse } from '@sjsu-mhc/types';

export class WatsonxService {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = process.env.WXO_AGENT_URL || '';
    this.apiKey = process.env.WXO_API_KEY;
    
    if (!this.baseUrl) {
      console.warn('⚠️ WXO_AGENT_URL not configured - using mock responses');
    }
  }

  /**
   * Sends a message to the Watsonx Orchestrate agent
   */
  async sendMessage(request: WXORequest): Promise<WXOResponse> {
    if (!this.baseUrl) {
      return this.getMockResponse(request);
    }

    try {
      const response: AxiosResponse<WXOResponse> = await axios.post(
        this.baseUrl,
        {
          message: request.message,
          sessionId: request.sessionId,
          context: request.context || {}
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
          },
          timeout: 30000 // 30 second timeout
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error calling Watsonx Orchestrate:', error);
      
      // Return a fallback response
      return {
        response: "I'm having trouble connecting to our support system right now. Please try again in a moment, or contact CAPS directly at (408) 924-5678.",
        confidence: 0.1,
        metadata: { error: 'External API unavailable' }
      };
    }
  }

  /**
   * Mock response for development/testing when WXO is not available
   */
  private getMockResponse(request: WXORequest): WXOResponse {
    const message = request.message.toLowerCase();
    
    // Mock responses based on keywords
    if (message.includes('appointment') || message.includes('book')) {
      return {
        response: "I can help you with CAPS appointments. Here are your options:",
        cards: [
          {
            id: 'appointment-1',
            category: 'booking',
            title: 'Schedule an Appointment',
            summary: 'Book a counseling session with CAPS',
            action: 'Call (408) 924-5678 to schedule',
            when_where: 'Monday-Friday, 8:00 AM - 5:00 PM',
            official_link: 'https://www.sjsu.edu/counseling/appointments/',
            why_for_user: 'You mentioned wanting to book an appointment'
          }
        ],
        confidence: 0.8
      };
    }

    if (message.includes('drop') || message.includes('walk')) {
      return {
        response: "CAPS offers drop-in services for immediate support:",
        cards: [
          {
            id: 'dropin-1',
            category: 'dropin',
            title: 'Drop-in Counseling',
            summary: 'Walk-in counseling sessions available',
            action: 'Visit CAPS office during drop-in hours',
            when_where: 'Monday-Friday, 10:00 AM - 3:00 PM',
            official_link: 'https://www.sjsu.edu/counseling/drop-in/',
            why_for_user: 'You asked about drop-in services'
          }
        ],
        confidence: 0.8
      };
    }

    if (message.includes('anxious') || message.includes('stress')) {
      return {
        response: "I understand you're feeling anxious or stressed. Here are some resources that might help:",
        cards: [
          {
            id: 'stress-1',
            category: 'resources',
            title: 'Stress Management Resources',
            summary: 'Tools and techniques for managing stress and anxiety',
            action: 'Explore stress management workshops',
            when_where: 'Various times throughout the semester',
            official_link: 'https://www.sjsu.edu/counseling/workshops/',
            why_for_user: 'You mentioned feeling anxious or stressed'
          },
          {
            id: 'mindfulness-1',
            category: 'resources',
            title: 'Mindfulness and Relaxation',
            summary: 'Guided meditation and relaxation techniques',
            action: 'Access online mindfulness resources',
            when_where: 'Available 24/7 online',
            official_link: 'https://www.sjsu.edu/counseling/mindfulness/',
            why_for_user: 'Mindfulness can help with anxiety and stress'
          }
        ],
        confidence: 0.7
      };
    }

    // Default response
    return {
      response: "I'm here to help you find the right CAPS resources. You can ask me about appointments, drop-in services, workshops, or any other mental health support options available at SJSU.",
      cards: [
        {
          id: 'general-1',
          category: 'general',
          title: 'CAPS General Information',
          summary: 'Learn about all CAPS services and resources',
          action: 'Visit the CAPS website',
          when_where: 'Available 24/7 online',
          official_link: 'https://www.sjsu.edu/counseling/',
          why_for_user: 'General information about CAPS services'
        }
      ],
      confidence: 0.6
    };
  }

  /**
   * Validates the WXO service configuration
   */
  isConfigured(): boolean {
    return !!this.baseUrl;
  }

  /**
   * Gets service status
   */
  async getStatus(): Promise<{ available: boolean; configured: boolean }> {
    const configured = this.isConfigured();
    
    if (!configured) {
      return { available: false, configured: false };
    }

    try {
      // Try a simple health check if the API supports it
      await axios.get(this.baseUrl.replace('/chat', '/health'), { timeout: 5000 });
      return { available: true, configured: true };
    } catch (error) {
      // If health check fails, assume service is available but might be busy
      return { available: true, configured: true };
    }
  }
}
