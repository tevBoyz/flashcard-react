import { useState, useEffect } from 'react';

export default function FlashCard({ flashcard, onFlip }) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(flashcard.showAnswer || false);
  }, [flashcard.showAnswer]);

  const handleFlip = () => {
    const newState = !isFlipped;
    setIsFlipped(newState);
    if (onFlip) onFlip(newState);
  };

  return (
    <div className="w-full h-full perspective-1000">
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={handleFlip}
      >
        {/* Question side */}
        <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 flex flex-col justify-between items-center border-2 border-gray-700">
          <div className="flex flex-col items-center justify-center flex-1">
            <h3 className="text-2xl font-bold text-center mb-4">{flashcard.question}</h3>
            <p className="text-gray-400">Click to reveal answer</p>
          </div>
          {/* {flashcard.contextLinks?.length > 0 && (
            <div className="mt-4 w-full">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Learn More:</h4>
              <div className="flex gap-2">
                {flashcard.contextLinks.map((link, idx) => (
                  <div
                    key={idx}
                    className="w-1xl p-3 bg-gray-900 rounded-lg border border-gray-600 shadow cursor-pointer hover:bg-gray-700 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(link, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <p className="text-blue-400 font-medium">Explore more about this topic →</p>
                    <p className="text-xs text-gray-400 truncate">{link.replace(/(^\w+:|^)\/\//, '').slice(0, 20)}</p>
                  </div>
                ))}
              </div>
            </div>
          )} */}
        </div>

        {/* Answer side */}
        <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-teal-600 to-green-700 rounded-xl p-6 flex flex-col justify-between items-center border-2 border-gray-600 rotate-y-180">
          <div className="flex flex-col items-center justify-center flex-1">
            <p className="text-2xl text-center">{flashcard.answer}</p>
            <p className="text-gray-400 mt-4">Click to see question</p>
          </div>
          {flashcard.contextLinks?.length > 0 && (
            <div className="mt-4 w-full">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Learn More:</h4>
              <div className="flex gap-2">
                {flashcard.contextLinks.map((link, idx) => (
                  <div
                    key={idx}
                    className="w-1xl p-3 bg-gray-800 rounded-lg border border-gray-500 shadow cursor-pointer hover:bg-gray-600 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(link, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <p className="text-blue-300 font-medium">Dive deeper into this answer →</p>
                    <p className="text-xs text-gray-400 truncate">{link.replace(/(^\w+:|^)\/\//, '').slice(0, 20)}</p>
                  </div>
                ))}
                <div
                  className="p-3 bg-blue-600 rounded-lg shadow cursor-pointer hover:bg-blue-700 transition text-white"
                  onClick={(e) => {
                  e.stopPropagation();
                  window.open(`https://chat.openai.com/?prompt=${flashcard.question}`, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <p className="font-medium">Explore more on this →</p>
                  <p className="text-sm text-gray-200">Click to continue learning interactively</p>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
