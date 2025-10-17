import { Router, Request, Response } from 'express';
import { AppError } from '@sjsu-mhc/types';

const router = Router();

/**
 * GET /api/checkin/preview
 * Generate check-in message preview
 */
router.get('/preview', (req: Request, res: Response) => {
  try {
    const checkinPreview = generateCheckinPreview();

    res.json({
      success: true,
      data: checkinPreview,
      message: 'Check-in preview generated successfully'
    });

  } catch (error) {
    throw new AppError(
      'INTERNAL_SERVER_ERROR',
      'Failed to generate check-in preview',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
});

/**
 * POST /api/checkin/customize
 * Generate customized check-in message
 */
router.post('/customize', (req: Request, res: Response) => {
  try {
    const { sessionId, preferences, lastInteraction } = req.body;

    if (!sessionId) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Session ID is required',
        { sessionId }
      );
    }

    const customizedCheckin = generateCustomizedCheckin(preferences, lastInteraction);

    res.json({
      success: true,
      data: customizedCheckin,
      message: 'Customized check-in generated successfully'
    });

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      'INTERNAL_SERVER_ERROR',
      'Failed to generate customized check-in',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
});

/**
 * Generate standard check-in preview
 */
function generateCheckinPreview() {
  const currentHour = new Date().getHours();
  let timeGreeting = 'Hello';
  
  if (currentHour < 12) {
    timeGreeting = 'Good morning';
  } else if (currentHour < 17) {
    timeGreeting = 'Good afternoon';
  } else {
    timeGreeting = 'Good evening';
  }

  return {
    message: `${timeGreeting}! How's your workload this week? Need any calming options or in-person support?`,
    suggestedActions: [
      'Book a CAPS appointment',
      'Find stress management resources',
      'Explore mindfulness workshops',
      'Connect with peer support groups'
    ],
    followUpQuestions: [
      'How are you feeling about your current stress levels?',
      'Are there specific challenges you\'re facing this week?',
      'Would you like to explore some relaxation techniques?',
      'Do you need help finding time management strategies?'
    ],
    resources: [
      {
        title: 'CAPS Drop-in Hours',
        description: 'Walk-in counseling available Monday-Friday, 10 AM - 3 PM',
        link: 'https://www.sjsu.edu/counseling/drop-in/'
      },
      {
        title: 'Stress Management Workshop',
        description: 'Weekly workshop on managing academic stress',
        link: 'https://www.sjsu.edu/counseling/workshops/'
      },
      {
        title: 'Mindfulness Resources',
        description: 'Guided meditation and relaxation techniques',
        link: 'https://www.sjsu.edu/counseling/mindfulness/'
      }
    ],
    disclaimer: 'This is a preview of a check-in message. No actual message will be sent automatically.'
  };
}

/**
 * Generate customized check-in based on preferences
 */
function generateCustomizedCheckin(preferences: any, lastInteraction?: any) {
  const baseCheckin = generateCheckinPreview();
  
  // Customize based on preferences
  if (preferences?.focus === 'academic') {
    baseCheckin.message = `Hey! How's your academic workload this week? Need any study strategies or stress management support?`;
    baseCheckin.suggestedActions = [
      'Get academic counseling support',
      'Find study skills workshops',
      'Explore time management resources',
      'Connect with academic peer mentors'
    ];
  } else if (preferences?.focus === 'social') {
    baseCheckin.message = `Hi there! How are your social connections this week? Need any support with relationships or social anxiety?`;
    baseCheckin.suggestedActions = [
      'Join social skills groups',
      'Find peer support networks',
      'Explore social anxiety resources',
      'Connect with campus community groups'
    ];
  } else if (preferences?.focus === 'emotional') {
    baseCheckin.message = `Hello! How are you feeling emotionally this week? Need any support with mood or emotional wellness?`;
    baseCheckin.suggestedActions = [
      'Schedule individual counseling',
      'Find mood management resources',
      'Explore emotional wellness workshops',
      'Connect with mental health peer support'
    ];
  }

  // Add context from last interaction
  if (lastInteraction?.topics) {
    baseCheckin.followUpQuestions = [
      ...baseCheckin.followUpQuestions,
      `I remember you mentioned ${lastInteraction.topics.join(' and ')}. How are those going?`
    ];
  }

  // Add urgency if last interaction was crisis-related
  if (lastInteraction?.wasCrisis) {
    baseCheckin.message = `Hi! I wanted to check in after our last conversation. How are you doing today? Need any immediate support?`;
    baseCheckin.suggestedActions = [
      'Contact CAPS crisis line: (408) 924-5678',
      'Schedule urgent appointment',
      'Access immediate support resources',
      'Connect with 24/7 crisis support'
    ];
  }

  return {
    ...baseCheckin,
    customization: {
      focus: preferences?.focus || 'general',
      urgency: lastInteraction?.wasCrisis ? 'high' : 'normal',
      personalization: lastInteraction?.topics ? 'high' : 'low'
    }
  };
}

export { router as checkinRoutes };
