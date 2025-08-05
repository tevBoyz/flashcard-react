import { useState, useEffect,useRef } from 'react';
import { ClipLoader } from 'react-spinners';
import FlashCard from './components/FlashCard';
import { FiChevronDown, FiChevronUp, FiClock, FiX, FiRotateCw } from 'react-icons/fi';

export default function App() {
  const [file, setFile] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [flashcardHistory, setFlashcardHistory] = useState([]);
  const historyRef = useRef(null);

  const handleFileChange = (e) => {
  const selectedFile = e.target.files[0];
  
  if (!selectedFile) return;
  
  // 3MB size limit
  const maxSize = 3 * 1024 * 1024; // 3MB in bytes
  if (selectedFile.size > maxSize) {
    setError('File size exceeds 3MB limit. Please choose a smaller file.');
    e.target.value = ''; // Clear the file input
    setFile(null);
    return;
  }
  
  // Allowed file types
  const allowedTypes = [
    'text/plain', // .txt
    'application/pdf', // .pdf
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.openxmlformats-officedocument.presentationml.presentation' // .pptx
  ];
  
  // Check file type
  if (!allowedTypes.includes(selectedFile.type) && 
      !selectedFile.name.match(/\.(txt|pdf|docx|pptx)$/i)) {
    setError('Only .txt, .pdf, .docx, and .pptx files are allowed.');
    e.target.value = '';
    setFile(null);
    return;
  }
  
  // If all checks pass
  setFile(selectedFile);
  setError(null); // Clear any previous errors
};
  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('flashcardHistory');
    if (savedHistory) {
      setFlashcardHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
  if (showHistory && historyRef.current) {
    historyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}, [showHistory]);


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
          'x-api-key': import.meta.env.VITE_API_KEY,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload file/Backend overloaded, please try again later');
      }

      const data = await response.json();
      
      setFlashcards(data.flashcards.map(f => ({ ...f, showAnswer: false }))); // Initialize with showAnswer: false
      setSuccess(data.message);
      setShowUploadModal(false);

      // Add to history only after successful response
      const newHistoryItem = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        filename: file.name,
        flashcards: [...data.flashcards]
      };
      
      const updatedHistory = [newHistoryItem, ...flashcardHistory].slice(0, 10);
      setFlashcardHistory(updatedHistory);
      localStorage.setItem('flashcardHistory', JSON.stringify(updatedHistory));

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (historyItem) => {
    setFlashcards(historyItem.flashcards.map(f => ({ ...f, showAnswer: false }))); // Initialize with showAnswer: false
    setCurrentIndex(0);
    setShowUploadModal(false);
    setSuccess(`Loaded session from ${historyItem.date}`);
    setFile(new File([], historyItem.filename, { type: 'text/plain' }));
  };

  const deleteFromHistory = (id, e) => {
    e.stopPropagation();
    const updatedHistory = flashcardHistory.filter(item => item.id !== id);
    setFlashcardHistory(updatedHistory);
    localStorage.setItem('flashcardHistory', JSON.stringify(updatedHistory));
  };

  const handleNext = () => {
    setCurrentIndex(prev => {
      const nextIndex = prev === flashcards.length - 1 ? 0 : prev + 1;
      // Ensure the next card shows question side
      const updatedFlashcards = [...flashcards];
      updatedFlashcards[nextIndex].showAnswer = false;
      setFlashcards(updatedFlashcards);
      return nextIndex;
    });
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => {
      const prevIndex = prev === 0 ? flashcards.length - 1 : prev - 1;
      // Ensure the previous card shows question side
      const updatedFlashcards = [...flashcards];
      updatedFlashcards[prevIndex].showAnswer = false;
      setFlashcards(updatedFlashcards);
      return prevIndex;
    });
  };

  return (
    <div className="min-h-screen text-gray-100 flex flex-col relative ">
      {/* Loading Overlay */}
      <img
    src="/images/abrehot-back-image.webp"
    alt="background"
    className="absolute inset-0 w-full h-full object-cover -z-10"
    loading="lazy"
  />
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl flex flex-col items-center">
            <ClipLoader color="#3B82F6" size={50} />
            <p className="mt-4 text-xl text-gray-300">Processing your file...</p>
            <p className="text-gray-400 mt-2">This may take a moment, please wait...</p>
          </div>
        </div>
      )}

      <div className="flex-1 p-4 max-w-6xl mx-auto w-full mt-10">
        <header className="text-center mb-8 bg-black/50 p-6 rounded-xl backdrop-blur-sm shadow-lg max-w-xl mx-auto">
  <h1 className="text-3xl font-bold mb-2 text-white">Flashcard Generator</h1>
  <p className='text-amber-100 text-[12px] font-extralight'>Create flashcards from your notes.</p>
  {!showUploadModal && (
    <button 
      onClick={() => setShowUploadModal(true)}
      className="mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2 mx-auto"
    >
      <FiRotateCw /> Upload New Files
    </button>
  )}
</header>


        {showUploadModal && (
          <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl mb-8 shadow-lg">
            <div className="mb-4">
              <label htmlFor="file" className="block text-gray-300 mb-2">Select a file: (txt, pdf, docx, pptx)</label>
              <input
                type="file"
                id="file"
                accept=".txt,.pdf,.docx,.pptx"
                onChange={handleFileChange}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-gray-300"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded font-medium"
            >
              Generate Flashcards
            </button>
          </form>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-xl mb-8">
            {error}
            {error.includes('allowed') && (
              <p className="text-sm mt-2">Supported formats: .txt, .pdf, .docx, .pptx</p>
            )}
            {error.includes('3MB') && (
              <p className="text-sm mt-2">Maximum allowed file size is 3MB.</p>
            )}
          </div>
        )}

        {success && !showUploadModal && (
          <div className="bg-green-900/50 border border-green-700 text-green-300 p-4 rounded-xl animate-fade">
            {success}
          </div>
        )}

        {flashcards.length > 0 && !showUploadModal && (
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-gray-300 font-medium truncate max-w-[50%]">
                {file?.name || flashcardHistory.find(h => 
                  JSON.stringify(h.flashcards) === JSON.stringify(flashcards))?.filename}
              </div>
              <div className="text-gray-400">
                {currentIndex + 1} / {flashcards.length}
              </div>
            </div>

            <div className="h-96 mb-6">
              <FlashCard 
                flashcard={flashcards[currentIndex]} 
                onFlip={(isFlipped) => {
                  const updatedFlashcards = [...flashcards];
                  updatedFlashcards[currentIndex].showAnswer = isFlipped;
                  setFlashcards(updatedFlashcards);
                }}
              />
            </div>

            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
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
      </div>

      {/* History Panel - Always at bottom */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div 
          className="flex items-center justify-between cursor-pointer p-4"
          onClick={() => setShowHistory(!showHistory)}
        >
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FiClock className="text-blue-400" /> History
          </h2>
          <span className="text-gray-400">
            {showHistory ? <FiChevronDown /> : <FiChevronUp />}
          </span>
        </div>
        
        {showHistory && (
          <div ref={historyRef} className="p-4 max-h-64 overflow-y-auto">
            {flashcardHistory.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {flashcardHistory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors relative group"
                    onClick={() => loadFromHistory(item)}
                  >
                    <div className="font-medium truncate">{item.filename}</div>
                    <div className="text-sm text-gray-400">
                      {item.date} • {item.flashcards.length} cards
                    </div>
                    <button
                      onClick={(e) => deleteFromHistory(item.id, e)}
                      className="absolute top-2 right-2 p-1 text-gray-400 cursor-pointer hover:text-red-400 opacity-100 transition-opacity"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-4">
                No history yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}