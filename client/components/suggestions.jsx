import React from 'react';

const Suggestions = ({ onSuggestionClick, selectedParty }) => {
  const suggestions = [
    'O que é que o PS acha do estado anual do SNS?',
    'O que é que o Chega fará quanto às imigrações?',
  ];

  return (
    <div className="flex justify-between space-x-2">
      {suggestions.map((suggestion) => (
        <div
          onClick={() => onSuggestionClick(suggestion)}
          className="mx-auto w-full mb-4 py-2 px-4 bg-transparent border-[1px] border-slate-300 rounded-lg shadow-md hover:bg-slate-50 cursor-pointer"
        >
          <p className="my-auto mx-auto w-fit text-xs text-black">
            {suggestion}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Suggestions;
