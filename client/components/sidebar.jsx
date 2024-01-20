'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Logo from '@/public/logo.png';
import MediaCapital from '@/public/mediacapital.png';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

const Sidebar = ({
  selectedOption,
  setSelectedOption,
  selectedParty,
  setSelectedParty,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const parties = ['Todos', 'PSD', 'IL', 'PS', 'Chega', 'BE', 'PAN', 'Livre'];
  const themes = [
    'Educação',
    'Saúde',
    'Imigração',
    'SNS',
    'Habitação',
    'Fiscalização',
  ];

  const handleDropdown = (party) => {
    setSelectedParty(party);
    setDropdownOpen(false);
  };

  return (
    <div className="hidden md:flex w-64 h-screen bg-black shadow-xl py-6 flex-col">
      <div className="flex justify-center mb-8 px-6 cursor-pointer">
        <Image src={MediaCapital} alt="Company Logo" width={180} height={90} />
      </div>
      {selectedOption === 'overall' && (
        <div className="mb-8 px-4 relative">
          <p className="text-[10px] text-slate-100 mb-2 px-2">
            Escolhe o partido:
          </p>
          <div
            className="flex justify-between items-center w-full rounded-lg hover:bg-gray-900  cursor-pointer text-sm"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <p className="text-slate-100 text-sm p-2 font-bold">
              {selectedParty || 'Select Party'}
            </p>
            {dropdownOpen ? (
              <IoIosArrowUp className="text-slate-100 mr-2 font-bold" />
            ) : (
              <IoIosArrowDown className="text-slate-100 mr-2 font-bold" />
            )}
          </div>
          {dropdownOpen && (
            <div className="px-4 bg-transparent absolute top-full left-0 right-0  mt-1 rounded-lg shadow-lg z-10">
              {parties.map((party) => (
                <div
                  key={party}
                  className="p-2 bg-black
                   hover:bg-gray-900 cursor-pointer text-slate-100 rounded-lg"
                  onClick={() => handleDropdown(party)}
                >
                  <p className="text-sm">{party}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="flex-1 overflow-auto px-4">
        <p className="text-[10px] text-slate-100 mb-2 px-2">Temas sugeridos:</p>
        {themes.map((theme) => (
          <div
            key={theme}
            className="block p-2 text-slate-100 bg-black hover:bg-gray-900 cursor-pointer rounded-lg transition-colors"
          >
            <p className="text-sm font-semibold">{theme}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col justify-center space-y-1 px-6 cursor-pointer">
        <p className="text-xs text-slate-100">Powered by:</p>
        <Image src={Logo} alt="Company Logo" width={180} height={90} />
      </div>
    </div>
  );
};

export default Sidebar;
