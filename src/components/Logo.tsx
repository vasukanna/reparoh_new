import React from 'react';

export function Logo({ className = "h-12" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 200 150" className="h-full w-auto drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* House Outline */}
        <path d="M100 25 L30 75 L30 130 L170 130 L170 75 Z" stroke="#0f2c59" strokeWidth="12" strokeLinejoin="round"/>
        <path d="M20 80 L100 20 L180 80" stroke="#0f2c59" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="50" y="20" width="16" height="30" fill="#0f2c59" />

        {/* Wrench */}
        <path d="M70 105 L115 60" stroke="#f97316" strokeWidth="14" strokeLinecap="round"/>
        <circle cx="120" cy="55" r="12" stroke="#f97316" strokeWidth="10"/>
        <path d="M60 110 A 14 14 0 1 1 80 95" stroke="#f97316" strokeWidth="10" strokeLinecap="round"/>

        {/* Hammer */}
        <path d="M130 105 L85 60" stroke="#0f2c59" strokeWidth="14" strokeLinecap="round"/>
        <rect x="70" y="45" width="28" height="16" fill="#0f2c59" transform="rotate(-45 84 53)" rx="4"/>

        {/* Hand */}
        <path d="M10 120 C 40 145, 90 155, 135 135 C 170 120, 190 95, 190 95 C 190 95, 145 130, 110 130 C 75 130, 45 110, 10 120 Z" fill="#f97316"/>
        <path d="M0 110 C 35 135, 80 155, 125 140 C 155 130, 170 115, 170 115 C 170 115, 125 140, 95 130 C 60 120, 30 105, 0 110 Z" fill="#0f2c59"/>
      </svg>
      <div className="flex flex-col justify-center">
        <span className="text-2xl md:text-3xl font-black tracking-tight flex items-baseline">
          <span className="text-[#0f2c59]">Reparo</span>
          <span className="text-orange-600">H</span>
        </span>
      </div>
    </div>
  );
}
