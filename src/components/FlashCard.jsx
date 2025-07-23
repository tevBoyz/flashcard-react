import { useState } from 'react';

export default function Flashcard({ flashcard }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full h-full perspective-1000">
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="absolute w-full h-full backface-hidden bg-gray-800 rounded-xl p-6 flex flex-col justify-center items-center border-2 border-gray-700">
          <h3 className="text-2xl font-bold text-center mb-4">{flashcard.question}</h3>
          <p className="text-gray-400">Click to reveal answer</p>
        </div>
        <div className="absolute w-full h-full backface-hidden bg-gray-700 rounded-xl p-6 flex flex-col justify-center items-center border-2 border-gray-600 rotate-y-180">
          <p className="text-2xl text-center">{flashcard.answer}</p>
          <p className="text-gray-400 mt-4">Click to see question</p>
        </div>
      </div>
    </div>
  );
}