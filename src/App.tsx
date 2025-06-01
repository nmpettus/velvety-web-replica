import React from 'react';
import { useState, useRef } from 'react';
import { Send, Book, GraduationCap, MessageCircle, ExternalLink } from 'lucide-react';
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
  const [selectedVerse, setSelectedVerse] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [error, setError] = useState<string | null>(null);

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
        <h1 className="text-5xl font-bold text-center mb-12 highlight-gradient bg-clip-text text-transparent animate-fade-in">
          Biblical Wisdom Guide
        </h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your biblical question here..."
              className="w-full p-6 pr-14 rounded-xl glass-card input-highlight min-h-[120px] resize-none text-lg"
            />
            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="absolute right-4 bottom-4 p-3 rounded-full highlight-gradient text-white disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:scale-110 disabled:hover:scale-100"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>

        {isLoading && (
          <div className="flex justify-center items-center space-x-2 animate-pulse">
            <div className="w-4 h-4 bg-indigo-500 rounded-full"></div>
            <div className="w-4 h-4 bg-purple-500 rounded-full animation-delay-200"></div>
            <div className="w-4 h-4 bg-pink-500 rounded-full animation-delay-400"></div>
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
