import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ChatRequest, ChatResponse, ChatMessage, AppError } from '@sjsu-mhc/types';
import { CrisisDetectionService } from '../services/crisisDetection';
import { WatsonxService } from '../services/watsonxService';

const router = Router();
const crisisDetection = new CrisisDetectionService();
const watsonxService = new WatsonxService();

// In-memory session storage (in production, use Redis or database)
const sessions = new Map<string, { consentGiven: boolean; messages: ChatMessage[] }>();

/**
 * POST /api/chat/send
 * Send a message to the chat system
 */
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { sessionId, message }: ChatRequest = req.body;

    // Validate input
    if (!sessionId || !message) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Session ID and message are required',
        { sessionId, message: !!message }
      );
    }

    // Check if session exists and has consent
    const session = sessions.get(sessionId);
    if (!session || !session.consentGiven) {
      throw new AppError(
        'UNAUTHORIZED',
        'Consent required before sending messages',
        { sessionId, hasConsent: session?.consentGiven }
      );
    }

    // Create user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      sessionId,
      content: message,
      role: 'user',
      timestamp: new Date()
    };

    // Detect crisis keywords
    const crisisResult = crisisDetection.detectCrisis(message);
    userMessage.isCrisis = crisisResult.isCrisis;

    // Add user message to session
    session.messages.push(userMessage);

    // Prepare response
    const response: ChatResponse = {
      success: true,
      message: 'Message processed successfully'
    };

    // If crisis detected, add safety card first
    if (crisisResult.isCrisis && crisisResult.safetyCard) {
      response.cards = [crisisResult.safetyCard];
      response.message = 'Crisis detected - showing safety resources first';
    } else {
      // Send to Watsonx Orchestrate
      const wxoResponse = await watsonxService.sendMessage({
        message,
        sessionId,
        context: {
          hasMoodKeywords: crisisDetection.hasMoodKeywords(message),
          detectedKeywords: crisisResult.keywords,
          messageCount: session.messages.length
        }
      });

      // Add assistant message to session
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        sessionId,
        content: wxoResponse.response,
        role: 'assistant',
        timestamp: new Date()
      };
      session.messages.push(assistantMessage);

      // Set response cards
      response.cards = wxoResponse.cards || [];
      response.message = wxoResponse.response;
    }

    // Update session
    sessions.set(sessionId, session);

    res.json(response);

  } catch (error) {
    console.error('Chat send error:', error);
    
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      'INTERNAL_SERVER_ERROR',
      'Failed to process chat message',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
});

/**
 * GET /api/chat/history/:sessionId
 * Get chat history for a session
 */
router.get('/history/:sessionId', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = sessions.get(sessionId);

    if (!session) {
      throw new AppError(
        'NOT_FOUND',
        'Session not found',
        { sessionId }
      );
    }

    res.json({
      success: true,
      data: {
        sessionId,
        messages: session.messages,
        messageCount: session.messages.length
      }
    });

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      'INTERNAL_SERVER_ERROR',
      'Failed to retrieve chat history',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
});

/**
 * DELETE /api/chat/session/:sessionId
 * Clear a chat session
 */
router.delete('/session/:sessionId', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const deleted = sessions.delete(sessionId);

    if (!deleted) {
      throw new AppError(
        'NOT_FOUND',
        'Session not found',
        { sessionId }
      );
    }

    res.json({
      success: true,
      message: 'Session cleared successfully'
    });

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      'INTERNAL_SERVER_ERROR',
      'Failed to clear session',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
});

/**
 * GET /api/chat/status
 * Get chat service status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const wxoStatus = await watsonxService.getStatus();
    
    res.json({
      success: true,
      data: {
        service: 'SJSU Mental Health Concierge Chat',
        status: 'operational',
        watsonx: wxoStatus,
        activeSessions: sessions.size,
        crisisDetection: {
          enabled: true,
          keywords: crisisDetection['crisisKeywords'].length
        }
      }
    });

  } catch (error) {
    throw new AppError(
      'INTERNAL_SERVER_ERROR',
      'Failed to get service status',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
});

export { router as chatRoutes };
