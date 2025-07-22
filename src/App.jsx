import { useState, useRef, useEffect } from 'react';
import Flashcard from './components/FlashCard';

export default function App() {
  // State declarations
  const [file, setFile] = useState(null);
  const [flashcards, setFlashcards] = useState([]); // Make sure this is defined
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(true);
  const [direction, setDirection] = useState('');

  useEffect(() => {
    if(success){
      const timer = setTimeout(()=> {
        setSuccess (null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  })
  
  // Refs
  const touchStartX = useRef(null);
  const flashcardRef = useRef(null);

  // Navigation handlers
  const handleNext = () => {
    setDirection('slide-out-left');
    setTimeout(() => {
      setCurrentIndex(prev => (prev === flashcards.length - 1 ? 0 : prev + 1));
      setDirection('slide-in-right');
    }, 250);
  };

  const handlePrev = () => {
    setDirection('slide-out-right');
    setTimeout(() => {
      setCurrentIndex(prev => (prev === 0 ? flashcards.length - 1 : prev - 1));
      setDirection('slide-in-left');
    }, 250);
  };

  // Touch event handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!touchStartX.current || !flashcards.length) return;
    const touchEndX = e.touches[0].clientX;
    const difference = touchStartX.current - touchEndX;
    
    if (difference > 50) handleNext();
    else if (difference < -50) handlePrev();
    
    touchStartX.current = null;
  };

  // File handlers
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload file');

      const data = await response.json();
      setFlashcards(data.flashcards || []);
      setSuccess(data.message);
      setCurrentIndex(0);
      setShowUploadModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const showUploadForm = () => {
    setShowUploadModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="max-w-3xl mx-auto">
        

        {showUploadModal && (
          <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl mb-8 shadow-lg">
            <div className="mb-4">
              <label htmlFor="file" className="block text-gray-300 mb-2">Select a text file:</label>
              <input
                type="file"
                id="file"
                accept=".txt"
                onChange={handleFileChange}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-gray-300"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded font-medium ${
                isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Processing...' : 'Generate Flashcards'}
            </button>
          </form>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-xl mb-8">
            {error}
          </div>
        )}

        {success && !showUploadModal && (
          <div className="bg-green-900/50 border border-green-700 text-green-300 p-4 rounded-xl mb-8">
            {success}
          </div>
        )}

        {flashcards.length > 0 && !showUploadModal && (
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Your Flashcards</h2>
              <div className="text-gray-400">
                {currentIndex + 1} / {flashcards.length}
              </div>
            </div>

            <div 
              className="h-64 mb-6 relative"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              ref={flashcardRef}
            >
              <Flashcard 
                flashcard={flashcards[currentIndex]} 
                direction={direction}
              />
            </div>

            <div className="flex justify-between">
              <button
                onClick={handlePrev}
                className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded"
              >
                Next
              </button>
            </div>
          </div>
        )}

        <header className="text-center mb-8">
          {!showUploadModal && (
            <button 
              onClick={showUploadForm}
              className="mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Upload New Flashcards
            </button>
          )}
          <h1 className="text-3xl font-bold mt-12">Flashcard Generator</h1>
          <p className='text-gray-500 mt-2'>Flashcard Genius helps you instantly generate study flashcards from PDFs or images using AI. Just upload your material, and get clear, concise question-answer cards ready to review and learn.</p>
        </header>
      </div>
    </div>
  );
}