'use client';
import React from 'react';
import Image from 'next/image';
import Logo from '@/public/logo.png';

const Sidebar = ({
  selectedOption,
  setSelectedOption,
  selectedParty,
  setSelectedParty,
}) => {
  const parties = ['PSD', 'IL', 'PS', 'Chega', 'BE', 'PAN', 'Livre'];
  const themes = [
    'Educação',
    'Saúde',
    'Imigração',
    'SNS',
    'Habitação',
    'Fiscalização',
  ];

  return (
    <aside className="hidden md:flex w-64 h-screen bg-gray-300 shadow-xl p-6  flex-col">
      <div className="flex justify-center mb-8">
        <Image src={Logo} alt="Company Logo" width={180} height={90} />
      </div>
      <div className="flex flex-col mb-6">
        {['overall', 'perParty'].map((option) => (
          <label key={option} className="flex items-center mb-2 cursor-pointer">
            <input
              type="radio"
              value={option}
              checked={selectedOption === option}
              onChange={() => setSelectedOption(option)}
              className="mr-2 cursor-pointer "
            />
            <span className="text-sm capitalize">{option}</span>
          </label>
        ))}
      </div>
      {selectedOption === 'perParty' && (
        <div className="mb-8">
          <select
            value={selectedParty}
            onChange={(e) => setSelectedParty(e.target.value)}
            className="w-full p-3 rounded-lg border text-sm border-gray-300 focus:border-blue-500 outline-none pr-2 cursor-pointer"
          >
            <option value="">Select Party</option>
            {parties.map((party) => (
              <option className="" key={party} value={party}>
                {party}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex-1 overflow-auto">
        {themes.map((theme) => (
          <div
            key={theme}
            className="block mb-3 p-2 bg-slate-100 hover:bg-slate-200 cursor-pointer rounded-lg transition-colors"
          >
            <p className="text-sm md:text-md font-semibold">{theme}</p>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
