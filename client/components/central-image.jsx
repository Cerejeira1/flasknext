'use client';
import React from 'react';
import Image from 'next/image';
import BE from '@/public/be1.png';
import PSD from '@/public/psd.png';
import Chega from '@/public/chega.png';
import Livre from '@/public/livre1.png';
import IL from '@/public/il1.png';
import PAN from '@/public/pan.png';
import PS from '@/public/ps1.png';
import Todos from '@/public/pt.png';

const CentralImage = ({ selectedParty }) => {
  const parties = {
    Todos: Todos,
    PSD: PSD,
    IL: IL,
    PS: PS,
    Chega: Chega,
    BE: BE,
    PAN: PAN,
    Livre: Livre,
  };
  return (
    <div className="flex flex-col mx-auto my-auto space-y-4 w-fit h-fit mb-40">
      <Image
        src={parties[selectedParty]}
        width={210}
        height={200}
        alt="Chosen Party Logo"
        className="opacity-20 mx-auto"
      />
      <div className="flex flex-col mx-auto space-y-0">
        {selectedParty === 'Todos' ? (
          <p className="text-black opacity-20 text-center mx-auto">
            Estás a falar com{' '}
            <span className="font-semibold text-black">{selectedParty}</span> os
            partidos portugueses
          </p>
        ) : (
          <>
            <p className="text-black opacity-20 text-center mx-auto">
              Estás a falar com o/a{' '}
              <span className="font-semibold text-black">{selectedParty}</span>{' '}
            </p>
            <p className="text-black opacity-20 text-center mx-auto text-xs">
              Podes encontrar o programa eleitoral deste partido{' '}
              <span className="font-bold underline cursor-pointer">aqui</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default CentralImage;
