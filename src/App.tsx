import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Send, Book, GraduationCap, MessageCircle, ExternalLink, ArrowLeft } from 'lucide-react';
import { getAnswer } from './lib/openai';
import { getVerseContent } from './lib/bible';
import { VerseModal } from './components/VerseModal';

interface Reference {
  type: 'verse' | 'book' | 'commentary' | 'article';
  title: string;
  link: string;
  description?: string;
}

interface Answer {
  text: string;
  references: Reference[];
}

function App() {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [returnUrl, setReturnUrl] = useState<string | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Read the returnUrl query parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrlParam = urlParams.get('returnUrl');
    if (returnUrlParam) {
      setReturnUrl(decodeURIComponent(returnUrlParam));
    }
  }, []);

  const handleReturn = () => {
    if (returnUrl) {
      window.location.href = returnUrl;
    } else {
      window.history.back();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setAnswer(null);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getAnswer(question);
      setAnswer(response);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const ReferenceIcon = ({ type }: { type: Reference['type'] }) => {
    switch (type) {
      case 'verse': return <Book className="w-4 h-4" />;
      case 'book': return <GraduationCap className="w-4 h-4" />;
      case 'commentary': return <MessageCircle className="w-4 h-4" />;
      case 'article': return <ExternalLink className="w-4 h-4" />;
      default: return null;
    }
  };

  const handleVerseClick = async (ref: Reference) => {
    if (ref.type === 'verse') {
      const verseContent = await getVerseContent(ref.title);
      setSelectedVerse({
        title: ref.title,
        content: verseContent
      });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {returnUrl && (
          <div className="mb-6 animate-fade-in">
            <button
              onClick={handleReturn}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg glass-card hover:bg-white/50 transition-all duration-300 text-gray-700 hover:text-indigo-600"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to previous page</span>
            </button>
          </div>
        )}
        
        <div className="flex items-center justify-center mb-12 animate-fade-in">
          <img 
            src="/MaggieRead.jpeg" 
            alt="Maggie the friendly dog reading a book" 
            className="w-20 h-20 rounded-full shadow-lg mr-6 border-4 border-white/50"
          />
          <h1 className="text-5xl font-bold highlight-gradient bg-clip-text text-transparent leading-tight py-2">
            Ask Maggie Bible Questions
          </h1>
        </div>
        
        <p className="text-center text-lg text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in">
          Answers are based on the New Testament covenant of Grace and God's Love as taught by Tim Keller, Andrew Farley, and others.
        </p>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative group">
            <textarea
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your biblical question here..."
              className="w-full p-6 pr-14 rounded-xl glass-card input-highlight min-h-[120px] resize-none text-lg shadow-2xl border-2 border-purple-200/50 hover:border-purple-300/70 focus:border-purple-400 transition-all duration-300 group-hover:shadow-purple-200/30"
            />
            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="absolute right-4 bottom-4 p-3 rounded-full highlight-gradient text-white disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:scale-110 disabled:hover:scale-100 shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        </form>

        {isLoading && (
          <div className="flex flex-col items-center space-y-6 py-8">
            <div className="text-center">
              <p className="text-lg font-medium text-purple-600 mb-2">Maggie is thinking...</p>
              <div className="relative w-80 h-16 overflow-hidden">
                <div className="absolute top-4 paw-print paw-walking paw-walking-1">🐾</div>
                <div className="absolute top-8 paw-print paw-walking paw-walking-2">🐾</div>
                <div className="absolute top-4 paw-print paw-walking paw-walking-3">🐾</div>
                <div className="absolute top-8 paw-print paw-walking paw-walking-4">🐾</div>
              </div>
            </div>
            <div className="flex justify-center items-center space-x-3">
              <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full paw-bouncing"></div>
              <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full paw-bouncing animation-delay-200"></div>
              <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full paw-bouncing animation-delay-400"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="glass-card bg-red-50/50 text-red-600 rounded-xl p-6 mb-8 animate-fade-in">
            {error}
          </div>
        )}

        {answer && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card rounded-xl p-8">
              <p className="text-gray-800 leading-relaxed text-lg">{answer.text}</p>
            </div>

            <div className="glass-card rounded-xl p-8">
              <h2 className="text-2xl font-semibold mb-6 highlight-gradient bg-clip-text text-transparent">
                References & Resources
              </h2>
              <div className="space-y-4">
                {answer.references.map((ref, index) => (
                  <a
                    onClick={(e) => {
                      if (ref.type === 'verse') {
                        e.preventDefault();
                        handleVerseClick(ref);
                      }
                    }}
                    key={index}
                    href={ref.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start p-4 rounded-xl reference-card"
                  >
                    <div className="flex-shrink-0 reference-icon">
                      <ReferenceIcon type={ref.type} />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900 hover:text-indigo-600 transition-colors duration-200">
                        {ref.title}
                      </h3>
                      {ref.description && (
                        <p className="text-sm text-gray-500">{ref.description}</p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        <VerseModal
          isOpen={selectedVerse !== null}
          onClose={() => setSelectedVerse(null)}
          title={selectedVerse?.title || ''}
          content={selectedVerse?.content || ''}
        />
      </div>
    </div>
  );
}

export default App;
