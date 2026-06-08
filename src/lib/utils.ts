import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const glassClass = 'backdrop-blur-[20px] bg-slate-900/40 border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-[24px]';
export const inputClass = 'w-full bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500/50 focus:bg-white/[0.07] text-white rounded-xl px-4 py-3.5 outline-none transition-all duration-300 placeholder:text-slate-500 text-sm';
