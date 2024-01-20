'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Logo from '@/public/logo.png';
import MediaCapital from '@/public/mediacapital.png';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { RxDoubleArrowLeft, RxDoubleArrowRight } from 'react-icons/rx';
import { HiAcademicCap } from 'react-icons/hi2';
import { FaHeartbeat } from 'react-icons/fa';
import { RiMoneyEuroCircleFill } from 'react-icons/ri';
import { GiInjustice } from 'react-icons/gi';
import { BiWorld } from 'react-icons/bi';
import { FaHouseChimney } from 'react-icons/fa6';
import { FaCreditCard } from 'react-icons/fa6';
import { IoMdTrain } from 'react-icons/io';

const Sidebar = ({
  isSidebarOpen,
  toggleSidebar,
  selectedParty,
  setSelectedParty,
  setConversation,
  setMessages,
  abortController,
  setLoading,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const parties = ['Todos', 'PSD', 'IL', 'PS', 'Chega', 'BE', 'PAN', 'Livre'];
  const themeIcons = {
    Educação: <HiAcademicCap className="text-white mx-auto" size={18} />,
    Saúde: <FaHeartbeat className="text-white mx-auto" size={18} />,
    Economia: (
      <RiMoneyEuroCircleFill className="text-white mx-auto" size={18} />
    ),
    Justiça: <GiInjustice className="text-white mx-auto" size={18} />,
    Ambiente: <BiWorld className="text-white mx-auto" size={18} />,
    Habitação: <FaHouseChimney className="text-white mx-auto" size={18} />,
    'Política Fiscal': (
      <FaCreditCard className="text-white mx-auto" size={18} />
    ),
    Transportes: <IoMdTrain className="text-white mx-auto" size={18} />,
  };
  const themes = [
    'Educação',
    'Saúde',
    'Economia',
    'Justiça',
    'Ambiente',
    'Habitação',
    'Política Fiscal',
    'Transportes',
  ];

  const handleDropdown = (party) => {
    if (selectedParty !== party) {
      abortController.abort(); // Cancel ongoing fetch request
      setLoading(false); // Set loading to false
      setConversation([]);
      setMessages([]);
      setSelectedParty(party);
      setDropdownOpen(false);
    } else {
      setSelectedParty(party);
      setDropdownOpen(false);
    }
  };
  const handleToggleClick = () => {
    toggleSidebar();
    setDropdownOpen(false); // Set dropdownOpen to false
  };

  return (
    <div className="absolute left-0 md:static z-20 flex flex-row space-x-2">
      <div
        className={`flex transition-all duration-200 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden h-screen bg-black shadow-xl py-6 flex-col`}
      >
        <div className="flex justify-center mb-8 px-6 cursor-pointer">
          <Image
            src={MediaCapital}
            alt="Company Logo"
            width={180}
            height={90}
          />
        </div>
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
                  <p className="text-xs">{party}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-auto px-4">
          <p className="text-[10px] text-slate-100 mb-2 px-2">
            Temas sugeridos:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {!dropdownOpen &&
              themes.map((theme) => (
                <div
                  key={theme}
                  className="flex flex-col space-y-2 p-2 text-slate-100 bg-white/10 rounded-lg"
                >
                  {themeIcons[theme]}
                  <p className="text-xs font-semibold mx-auto">{theme}</p>
                </div>
              ))}
          </div>
        </div>
        <div className="flex flex-col justify-center space-y-1 px-6 cursor-pointer">
          <p className="text-[10px] text-slate-100">Powered by:</p>
          <Image src={Logo} alt="Company Logo" width={180} height={90} />
        </div>
      </div>
      <div className="flex justify-end px-0">
        {isSidebarOpen ? (
          <RxDoubleArrowLeft
            className="text-black my-auto cursor-pointer hover:scale-105 hover:opacity-20 transition-all duration-200"
            size={25}
            onClick={handleToggleClick}
          />
        ) : (
          <RxDoubleArrowRight
            className="text-black my-auto cursor-pointer hover:scale-105 hover:opacity-20 transition-all duration-200"
            size={25}
            onClick={handleToggleClick}
          />
        )}
      </div>
    </div>
  );
};

export default Sidebar;
