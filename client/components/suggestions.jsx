import React from 'react';

const Suggestions = ({ onSuggestionClick, selectedParty }) => {
  const suggestions = {
    Todos: [
      'O que é que o Todos acha do estado anual do SNS?',
      'O que é que o Todos fará quanto às imigrações?',
    ],
    PSD: [
      'O que é que o PSD acha do estado anual do SNS?',
      'O que é que o PSD fará quanto às imigrações?',
    ],
    IL: [
      'O que é que o IL acha do estado anual do SNS?',
      'O que é que o IL fará quanto às imigrações?',
    ],
    PS: [
      'O que é que o PS acha do estado anual do SNS?',
      'O que é que o PS fará quanto às imigrações?',
    ],
    Chega: [
      'O que é que o Chega acha do estado anual do SNS?',
      'O que é que o Chega fará quanto às imigrações?',
    ],
    BE: [
      'O que é que o BE acha do estado anual do SNS?',
      'O que é que o BE fará quanto às imigrações?',
    ],
    PAN: [
      'O que é que o PAN acha do estado anual do SNS?',
      'O que é que o PAN fará quanto às imigrações?',
    ],
    Livre: [
      'O que é que o Livre acha do estado anual do SNS?',
      'O que é que o Livre fará quanto às imigrações?',
    ],
  };

  return (
    <div className="flex flex-col md:flex-row md:justify-between  space-x-0 space-y-2 md:space-y-0 md:space-x-2 mb-8">
      {suggestions[selectedParty].map((suggestion) => (
        <div
          key={suggestion}
          onClick={() => onSuggestionClick(suggestion)}
          className="mx-auto w-full py-2 px-4 bg-transparent border-[1px] border-slate-300 rounded-lg shadow-md hover:bg-slate-50 cursor-pointer"
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
