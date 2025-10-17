import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ConsentData, AppError } from '@sjsu-mhc/types';

const router = Router();

// In-memory consent storage (in production, use Redis or database)
const consentRecords = new Map<string, ConsentData>();

/**
 * POST /api/consent/give
 * Record user consent for the session
 */
router.post('/give', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Session ID is required',
        { sessionId }
      );
    }

    // Create consent record
    const consentData: ConsentData = {
      sessionId,
      consentGiven: true,
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    // Store consent
    consentRecords.set(sessionId, consentData);

    res.json({
      success: true,
      message: 'Consent recorded successfully',
      data: {
        sessionId,
        consentGiven: true,
        timestamp: consentData.timestamp
      }
    });

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      'INTERNAL_SERVER_ERROR',
      'Failed to record consent',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
});

/**
 * GET /api/consent/status/:sessionId
 * Check consent status for a session
 */
router.get('/status/:sessionId', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const consent = consentRecords.get(sessionId);

    res.json({
      success: true,
      data: {
        sessionId,
        consentGiven: !!consent?.consentGiven,
        timestamp: consent?.timestamp,
        hasRecord: !!consent
      }
    });

  } catch (error) {
    throw new AppError(
      'INTERNAL_SERVER_ERROR',
      'Failed to check consent status',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
});

/**
 * POST /api/consent/withdraw
 * Withdraw consent for a session
 */
router.post('/withdraw', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Session ID is required',
        { sessionId }
      );
    }

    const consent = consentRecords.get(sessionId);
    if (!consent) {
      throw new AppError(
        'NOT_FOUND',
        'No consent record found for this session',
        { sessionId }
      );
    }

    // Update consent record
    consent.consentGiven = false;
    consent.timestamp = new Date();
    consentRecords.set(sessionId, consent);

    res.json({
      success: true,
      message: 'Consent withdrawn successfully',
      data: {
        sessionId,
        consentGiven: false,
        timestamp: consent.timestamp
      }
    });

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      'INTERNAL_SERVER_ERROR',
      'Failed to withdraw consent',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
});

/**
 * GET /api/consent/create-session
 * Create a new session ID
 */
router.get('/create-session', (req: Request, res: Response) => {
  try {
    const sessionId = uuidv4();

    res.json({
      success: true,
      data: {
        sessionId,
        message: 'New session created. Consent required before using chat features.'
      }
    });

  } catch (error) {
    throw new AppError(
      'INTERNAL_SERVER_ERROR',
      'Failed to create session',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
});

/**
 * GET /api/consent/privacy-policy
 * Get privacy policy information
 */
router.get('/privacy-policy', (req: Request, res: Response) => {
  try {
    const privacyPolicy = {
      title: 'Privacy Policy - SJSU Mental Health Concierge',
      lastUpdated: new Date().toISOString(),
      sections: [
        {
          title: 'Data Collection',
          content: 'We only collect the messages you send during your current session. No personal information is stored beyond the session duration.'
        },
        {
          title: 'Data Usage',
          content: 'Your messages are used solely to provide you with relevant CAPS resources and support information. We do not use your data for any other purposes.'
        },
        {
          title: 'Data Storage',
          content: 'Session data is stored temporarily in memory and is automatically deleted when your session ends. No persistent storage of personal data occurs.'
        },
        {
          title: 'Third-Party Services',
          content: 'We may use IBM Watsonx Orchestrate to process your messages and provide relevant responses. This service also does not store your personal data.'
        },
        {
          title: 'Your Rights',
          content: 'You can withdraw consent at any time, which will immediately stop data processing for your session.'
        },
        {
          title: 'Contact',
          content: 'For questions about this privacy policy, contact SJSU CAPS at (408) 924-5678.'
        }
      ]
    };

    res.json({
      success: true,
      data: privacyPolicy
    });

  } catch (error) {
    throw new AppError(
      'INTERNAL_SERVER_ERROR',
      'Failed to retrieve privacy policy',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
});

export { router as consentRoutes };
