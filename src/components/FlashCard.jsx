import { useState, useEffect } from 'react';

export default function Flashcard({ flashcard, direction }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Reset flip state when card changes
    setIsFlipped(false);
    // Trigger slide animation
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [flashcard]);

  return (
    <div className={`w-full h-64 perspective-1000 overflow-hidden ${isAnimating ? direction : ''}`}>
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front Side */}
        <div className="absolute w-full h-full backface-hidden bg-gray-800 rounded-xl p-6 flex flex-col justify-between items-center border border-gray-700">
          <h3 className="text-xl font-bold text-center mt-12">{flashcard.question}</h3>
          <p className="text-gray-400 mt-2">Tap to reveal answer</p>
        </div>
        
        {/* Back Side */}
        <div className="absolute w-full h-full backface-hidden bg-gray-700 rounded-xl p-6 flex flex-col justify-center items-center border border-gray-600 rotate-y-180">
          <p className="text-lg text-center">{flashcard.answer}</p>
        </div>
      </div>
    </div>
  );
}