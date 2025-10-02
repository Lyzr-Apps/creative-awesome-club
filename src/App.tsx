import React, { useState, useEffect } from 'react';
import parseLLMJson from './utils/jsonParser';

interface FortuneData {
  result: {
    fortune: string;
    tone: string;
    length: number;
    timestamp: string;
  };
  confidence: number;
  metadata: {
    processing_time: string;
    fortune_type: string;
  };
}

interface SummaryData {
  result: {
    summary: string;
    original_length: number;
    summary_length: number;
    share_format: string;
  };
  confidence: number;
  metadata: {
    processing_time: string;
    compression_ratio: number;
  };
}

function App() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFortune, setShowFortune] = useState(false);
  const [fortune, setFortune] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const generateRandomId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const callAgent = async (agentId: string, message: string): Promise<any> => {
    const userId = `user${generateRandomId()}@test.com`;
    const sessionId = `${agentId}-${generateRandomId()}`;

    try {
      const response = await fetch('https://agent-prod.studio.lyzr.ai/v3/inference/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'sk-default-obhGvAo6gG9YT9tu6ChjyXLqnw7TxSGY'
        },
        body: JSON.stringify({
          user_id: userId,
          agent_id: agentId,
          session_id: sessionId,
          message: message
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();
      console.log('Raw response:', data);

      // Parse the JSON response
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Failed to parse agent response as JSON');
      }

      // Extract JSON from the response text if needed
      if (typeof parsedData.response === 'string') {
        try {
          const extractedJson = parseLLMJson(parsedData.response);
          return extractedJson;
        } catch (extractError) {
          console.error('Failed to extract JSON from response:', extractError);
          // Try to return a fallback fortune
          return {
            result: {
              fortune: "The stars align in your favor today. Trust your instincts and embrace the opportunities that come your way.",
              tone: "positive",
              length: 120,
              timestamp: new Date().toISOString()
            },
            confidence: 0.8,
            metadata: {
              processing_time: "1s",
              fortune_type: "general"
            }
          };
        }
      }

      return parsedData;
    } catch (error) {
      console.error('Agent API error:', error);
      throw error;
    }
  };

  const handleBottleTap = async () => {
    if (isAnimating || isLoading) return;

    setIsLoading(true);
    setIsAnimating(true);
    setShowFortune(false);
    setError('');

    try {
      // Simulate bottle cracking animation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Call FortuneAgent
      const fortuneData: FortuneData = await callAgent('68dd873e4ca128e23a2a1d64', 'Generate a fortune message');
      console.log('Fortune data received:', fortuneData);

      if (fortuneData?.result?.fortune) {
        setFortune(fortuneData.result.fortune);
        setShowFortune(true);
      } else {
        throw new Error('Invalid fortune data received');
      }
    } catch (err) {
      console.error('Error getting fortune:', err);
      setError('Could not fetch your fortune. Please try again.');
      setShowFortune(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestVersion = async () => {
    if (!fortune || summary) return;

    try {
      const summaryData: SummaryData = await callAgent('68dd874a2660a8875bd6f1cc', `Summarize this fortune: ${fortune}`);
      console.log('Summary data received:', summaryData);

      if (summaryData?.result?.summary) {
        setSummary(summaryData.result.summary);
      }
    } catch (err) {
      console.error('Error getting summary:', err);
      // Fallback summary
      setSummary(fortune.substring(0, 60) + (fortune.length > 60 ? '...' : ''));
    }
  };

  const handleReset = () => {
    setIsAnimating(false);
    setShowFortune(false);
    setFortune('');
    setSummary('');
    setError('');
  };

  // Reset animation state after animation completes
  useEffect(() => {
    if (isAnimating && !isLoading) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating, isLoading]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-2">
          ✨ Fortune Bottle ✨
        </h1>
        <p className="text-gray-600 text-lg">
          Tap the bottle to reveal your fortune
        </p>
      </div>

      {/* Bottle Container */}
      <div className="relative mb-8">
        {!showFortune && (
          <div
            className="cursor-pointer transform transition-transform duration-200 hover:scale-105"
            onClick={handleBottleTap}
          >
            <div
              className={`w-64 h-80 bg-gradient-to-b from-red-500 to-red-600 rounded-t-full rounded-b-3xl shadow-2xl relative overflow-hidden transform transition-transform duration-300 ${
                isAnimating ? 'animate-bounce' : ''
              } ${
                isAnimating ? 'animate-pulse' : ''
              }`}
            >
              {/* Bottle cap */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-12 h-8 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-t-lg rounded-b-sm"></div>

              {/* Cork */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-gradient-to-b from-amber-600 to-amber-700 rounded-full"></div>

              {/* Bottle neck */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-12 h-16 bg-gradient-to-b from-red-400 to-red-500 rounded-t-sm rounded-b-sm"></div>

              {/* Magic sparkles when animating */}
              {isAnimating && (
                <>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
                  <div className="absolute top-1/4 left-1/3 transform translate-x-4 translate-y-2 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                  <div className="absolute top-3/4 right-1/3 transform -translate-x-4 -translate-y-2 w-1 h-1 bg-yellow-200 rounded-full animate-pulse"></div>
                  <div className="absolute top-1/2 left-1/4 transform -translate-x-2 translate-y-1 w-1 h-1 bg-white rounded-full animate-ping"></div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fortune Card */}
      {showFortune && (
        <div className="animate-fade-in mb-12 max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-500 hover:shadow-3xl">
            <div className="mb-4">
              <div className="text-6xl mb-4">🔮</div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#283046' }}>
                Your Fortune
              </h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Revealing your destiny...</span>
              </div>
            ) : error ? (
              <div className="text-red-500 mb-4">
                {error}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-lg leading-relaxed" style={{ color: '#283046' }}>
                  {fortune}
                </p>

                <div className="flex flex-col gap-3 mt-6">
                  <button
                    onClick={handleRequestVersion}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm"
                    style={{ backgroundColor: '#34a8eb' }}
                  >
                    Get Shareable Version
                  </button>

                  {summary && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 font-medium">Share Version:</p>
                      <p className="text-sm text-gray-600 mt-2">{summary}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reset Button */}
      {showFortune && (
        <div className="animate-fade-in">
          <button
            onClick={handleReset}
            className="px-8 py-3 bg-yellow-400 text-gray-800 font-semibold rounded-lg hover:bg-yellow-500 transition-colors duration-200 shadow-lg transform hover:scale-105"
            style={{ backgroundColor: '#fbd338' }}
          >
            Crack Another Bottle
          </button>
        </div>
      )}

      {/* Instructions */}
      {!showFortune && (
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>Click the bottle to crack it open and reveal your fortune!</p>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;