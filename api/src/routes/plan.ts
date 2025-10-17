import { Router, Request, Response } from 'express';
import { AppError } from '@sjsu-mhc/types';

const router = Router();

/**
 * POST /api/plan/email
 * Generate email preview for CAPS contact
 */
router.post('/email', (req: Request, res: Response) => {
  try {
    const { sessionId, message, userEmail } = req.body;

    if (!sessionId || !message) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Session ID and message are required',
        { sessionId, message: !!message }
      );
    }

    // Generate email preview based on message content
    const emailPreview = generateEmailPreview(message, userEmail);

    res.json({
      success: true,
      data: emailPreview,
      message: 'Email preview generated successfully'
    });

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      'INTERNAL_SERVER_ERROR',
      'Failed to generate email preview',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
});

/**
 * POST /api/plan/draft
 * Generate draft email to CAPS
 */
router.post('/draft', (req: Request, res: Response) => {
  try {
    const { sessionId, message, userEmail, urgency } = req.body;

    if (!sessionId || !message) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Session ID and message are required',
        { sessionId, message: !!message }
      );
    }

    // Generate draft email
    const draftEmail = generateDraftEmail(message, userEmail, urgency);

    res.json({
      success: true,
      data: draftEmail,
      message: 'Draft email generated successfully'
    });

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      'INTERNAL_SERVER_ERROR',
      'Failed to generate draft email',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
});

/**
 * Generate email preview based on message content
 */
function generateEmailPreview(message: string, userEmail?: string) {
  const lowerMessage = message.toLowerCase();
  
  // Determine email type based on content
  let subject = 'Inquiry about CAPS Services';
  let template = 'general';
  
  if (lowerMessage.includes('appointment') || lowerMessage.includes('book')) {
    subject = 'Request for CAPS Appointment';
    template = 'appointment';
  } else if (lowerMessage.includes('crisis') || lowerMessage.includes('urgent')) {
    subject = 'Urgent: Need CAPS Support';
    template = 'crisis';
  } else if (lowerMessage.includes('workshop') || lowerMessage.includes('group')) {
    subject = 'Interest in CAPS Workshops/Groups';
    template = 'workshop';
  }

  const emailBody = generateEmailBody(message, template);

  return {
    to: 'caps@sjsu.edu',
    from: userEmail || 'student@sjsu.edu',
    subject,
    body: emailBody,
    template,
    preview: `This email would be sent to CAPS with your inquiry about: ${getInquirySummary(message)}`,
    disclaimer: 'This is a preview only. No email will be sent automatically.'
  };
}

/**
 * Generate draft email content
 */
function generateDraftEmail(message: string, userEmail?: string, urgency: string = 'normal') {
  const emailPreview = generateEmailPreview(message, userEmail);
  
  // Add urgency indicators
  if (urgency === 'high' || urgency === 'crisis') {
    emailPreview.subject = `[URGENT] ${emailPreview.subject}`;
    emailPreview.body = `URGENT REQUEST\n\n${emailPreview.body}`;
  }

  return {
    ...emailPreview,
    instructions: [
      'Copy this email content',
      'Open your email client',
      'Paste the content and send to caps@sjsu.edu',
      'Or call CAPS directly at (408) 924-5678 for immediate assistance'
    ],
    alternativeContact: {
      phone: '(408) 924-5678',
      website: 'https://www.sjsu.edu/counseling/',
      location: 'Student Wellness Center, Room 300B'
    }
  };
}

/**
 * Generate email body based on template
 */
function generateEmailBody(message: string, template: string): string {
  const baseBody = `Dear CAPS Team,

I am reaching out regarding the following: ${message}

I would appreciate any guidance or support you can provide.

Thank you,
SJSU Student`;

  switch (template) {
    case 'appointment':
      return `Dear CAPS Team,

I would like to schedule an appointment to discuss: ${message}

Please let me know about available appointment times.

Thank you,
SJSU Student`;

    case 'crisis':
      return `Dear CAPS Team,

I am experiencing some challenges and would like to discuss: ${message}

I would appreciate immediate support or guidance.

Thank you,
SJSU Student`;

    case 'workshop':
      return `Dear CAPS Team,

I am interested in learning more about: ${message}

Could you provide information about relevant workshops or group sessions?

Thank you,
SJSU Student`;

    default:
      return baseBody;
  }
}

/**
 * Get a summary of the inquiry
 */
function getInquirySummary(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('appointment')) return 'scheduling an appointment';
  if (lowerMessage.includes('crisis')) return 'crisis support';
  if (lowerMessage.includes('workshop')) return 'workshops or groups';
  if (lowerMessage.includes('anxious') || lowerMessage.includes('stress')) return 'stress and anxiety support';
  if (lowerMessage.includes('depressed') || lowerMessage.includes('sad')) return 'depression support';
  
  return 'general mental health support';
}

export { router as planRoutes };
