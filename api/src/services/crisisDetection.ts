import { CrisisDetectionResult, SafetyCard, CRISIS_KEYWORDS, MOOD_KEYWORDS } from '@sjsu-mhc/types';

export class CrisisDetectionService {
  private crisisKeywords: string[];
  private moodKeywords: string[];

  constructor() {
    this.crisisKeywords = CRISIS_KEYWORDS;
    this.moodKeywords = MOOD_KEYWORDS;
  }

  /**
   * Analyzes a message for crisis indicators
   */
  detectCrisis(message: string): CrisisDetectionResult {
    const lowerMessage = message.toLowerCase();
    const foundKeywords: string[] = [];
    let confidence = 0;

    // Check for crisis keywords
    for (const keyword of this.crisisKeywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword);
        confidence += 0.8; // High weight for crisis keywords
      }
    }

    // Check for mood keywords (lower weight)
    for (const keyword of this.moodKeywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword);
        confidence += 0.3; // Lower weight for mood keywords
      }
    }

    // Check for additional crisis patterns
    const crisisPatterns = [
      /\b(kill|hurt|harm)\s+(myself|me)\b/i,
      /\b(end\s+it\s+all|not\s+worth\s+living)\b/i,
      /\b(can't\s+cope|can't\s+handle)\b/i,
      /\b(emergency|urgent|immediate)\s+(help|support)\b/i
    ];

    for (const pattern of crisisPatterns) {
      if (pattern.test(message)) {
        foundKeywords.push('crisis_pattern');
        confidence += 0.9;
      }
    }

    const isCrisis = confidence >= 0.5 || foundKeywords.some(keyword => 
      this.crisisKeywords.includes(keyword)
    );

    const result: CrisisDetectionResult = {
      isCrisis,
      keywords: foundKeywords,
      confidence: Math.min(confidence, 1.0)
    };

    if (isCrisis) {
      result.safetyCard = this.createSafetyCard(foundKeywords);
    }

    return result;
  }

  /**
   * Creates a safety card for crisis situations
   */
  private createSafetyCard(keywords: string[]): SafetyCard {
    return {
      id: `safety-${Date.now()}`,
      category: 'safety',
      title: 'Immediate Support Available',
      summary: 'If you\'re in immediate danger or having thoughts of self-harm, please reach out for help right away.',
      action: 'Contact emergency services or CAPS immediately',
      when_where: 'Available 24/7',
      official_link: 'https://www.sjsu.edu/counseling/',
      why_for_user: `You used words that may indicate crisis (${keywords.join(', ')}); I'm showing safety info first.`,
      priority: 'high',
      emergency_contacts: [
        {
          name: 'CAPS 24/7 Crisis Line',
          number: '(408) 924-5678',
          description: 'SJSU Counseling & Psychological Services',
          available: '24/7'
        },
        {
          name: 'National Suicide Prevention Lifeline',
          number: '988',
          description: 'National crisis support',
          available: '24/7'
        },
        {
          name: 'Crisis Text Line',
          number: 'Text HOME to 741741',
          description: 'Text-based crisis support',
          available: '24/7'
        },
        {
          name: 'Emergency Services',
          number: '911',
          description: 'For immediate life-threatening emergencies',
          available: '24/7'
        }
      ]
    };
  }

  /**
   * Checks if a message contains mood-related keywords
   */
  hasMoodKeywords(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return this.moodKeywords.some(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    );
  }

  /**
   * Gets all detected keywords from a message
   */
  getAllKeywords(message: string): string[] {
    const lowerMessage = message.toLowerCase();
    const allKeywords = [...this.crisisKeywords, ...this.moodKeywords];
    
    return allKeywords.filter(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    );
  }
}
