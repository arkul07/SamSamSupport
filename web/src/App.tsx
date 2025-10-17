import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChatInterface } from './components/ChatInterface';
import { ConsentModal } from './components/ConsentModal';
import { Header } from './components/Header';
import { EthicsDrawer } from './components/EthicsDrawer';
import { useConsent } from './hooks/useConsent';
import { useSession } from './hooks/useSession';
// import { ETHICAL_PILLARS } from '@sjsu-mhc/types';

function App() {
  const [showEthicsDrawer, setShowEthicsDrawer] = useState(false);
  const { hasConsent, giveConsent, sessionId } = useConsent();
  const { createSession } = useSession();

  useEffect(() => {
    if (!sessionId) {
      createSession();
    }
  }, [sessionId, createSession]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header 
          onShowEthics={() => setShowEthicsDrawer(true)}
          hasConsent={hasConsent}
        />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={
              <>
                {!hasConsent && (
                  <ConsentModal 
                    onConsent={giveConsent}
                    sessionId={sessionId || ''}
                  />
                )}
                
                {hasConsent && sessionId && (
                  <ChatInterface sessionId={sessionId} />
                )}
              </>
            } />
          </Routes>
        </main>

        <EthicsDrawer 
          isOpen={showEthicsDrawer}
          onClose={() => setShowEthicsDrawer(false)}
          pillars={[]}
        />

        {/* Crisis Support Footer */}
        <footer className="bg-gray-800 text-white py-4 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm">
              <strong>Crisis Support:</strong> CAPS 24/7 Line: (408) 924-5678 | 
              National Suicide Prevention Lifeline: 988 | 
              Crisis Text Line: Text HOME to 741741
            </p>
            <p className="text-xs mt-2 text-gray-300">
              This is a prototype for educational purposes. For real mental health support, contact SJSU CAPS directly.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
