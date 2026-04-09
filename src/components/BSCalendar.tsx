import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { BS_CALENDAR_DATA, bsToAd, adToBs } from "@/src/lib/calendar-data";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BSCalendarProps {
  year: number;
  month: number;
  selectedDay?: number;
  onDayClick?: (year: number, month: number, day: number) => void;
  color?: 'blue' | 'red';
}

const NEPALI_NUMBERS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const NEPALI_MONTHS = [
  "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

const toNepaliNumber = (num: number | string) => {
  return String(num).split('').map(char => {
    const n = parseInt(char);
    return isNaN(n) ? char : NEPALI_NUMBERS[n];
  }).join('');
};

export const BSCalendar: React.FC<BSCalendarProps> = ({ year, month, selectedDay, onDayClick, color = 'blue' }) => {
  const [viewYear, setViewYear] = useState(year);
  const [viewMonth, setViewMonth] = useState(month);

  useEffect(() => {
    setViewYear(year);
    setViewMonth(month);
  }, [year, month]);

  if (!BS_CALENDAR_DATA[viewYear]) return null;

  const today = adToBs(new Date());
  const daysInMonth = BS_CALENDAR_DATA[viewYear][viewMonth - 1];
  
  // Get the starting day of the week for the 1st of the month
  let startingDayOfWeek = 0;
  try {
    const firstDayAD = bsToAd({ year: viewYear, month: viewMonth, day: 1 });
    startingDayOfWeek = firstDayAD.getDay();
  } catch (e) {
    console.error("Error calculating starting day", e);
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startingDayOfWeek }, (_, i) => i);

  const colorClasses = {
    blue: {
      selected: "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none",
      today: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50",
      todayDot: "bg-blue-500 dark:bg-blue-400",
      subtext: "text-blue-100",
      hover: "hover:bg-slate-50 dark:hover:bg-slate-800",
      header: "text-blue-900 dark:text-blue-100",
      button: "hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
    },
    red: {
      selected: "bg-red-600 text-white shadow-lg shadow-red-200 dark:shadow-none",
      today: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50",
      todayDot: "bg-red-500 dark:bg-red-400",
      subtext: "text-red-100",
      hover: "hover:bg-slate-50 dark:hover:bg-slate-800",
      header: "text-red-900 dark:text-red-100",
      button: "hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
    }
  };

  const activeColors = colorClasses[color];

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      if (BS_CALENDAR_DATA[viewYear - 1]) {
        setViewYear(y => y - 1);
        setViewMonth(12);
      }
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      if (BS_CALENDAR_DATA[viewYear + 1]) {
        setViewYear(y => y + 1);
        setViewMonth(1);
      }
    } else {
      setViewMonth(m => m + 1);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800">
        <button 
          onClick={handlePrevMonth}
          className={cn("p-1.5 rounded-lg transition-colors", activeColors.button)}
          disabled={!BS_CALENDAR_DATA[viewYear - 1] && viewMonth === 1}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className={cn("font-bold", activeColors.header)}>
          {NEPALI_MONTHS[viewMonth - 1]} {toNepaliNumber(viewYear)}
        </div>
        <button 
          onClick={handleNextMonth}
          className={cn("p-1.5 rounded-lg transition-colors", activeColors.button)}
          disabled={!BS_CALENDAR_DATA[viewYear + 1] && viewMonth === 12}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
        {WEEKDAYS.map(day => (
          <div key={day} className="py-3 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 p-3 gap-2">
        {blanks.map(i => (
          <div key={`blank-${i}`} className="aspect-square" />
        ))}
        {days.map(day => {
          const isSelected = day === selectedDay && viewYear === year && viewMonth === month;
          const isToday = today.year === viewYear && today.month === viewMonth && today.day === day;
          
          return (
            <motion.button
              key={day}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDayClick?.(viewYear, viewMonth, day)}
              className={cn(
                "aspect-square flex flex-col items-center justify-center rounded-xl transition-all text-sm font-medium relative group",
                isSelected 
                  ? `${activeColors.selected} z-10` 
                  : isToday
                    ? activeColors.today
                    : `${activeColors.hover} text-slate-600 dark:text-slate-300`
              )}
            >
              <span className="text-base leading-none">{toNepaliNumber(day)}</span>
              <span className={cn(
                "text-[9px] font-normal mt-0.5",
                isSelected ? activeColors.subtext : "text-slate-400 dark:text-slate-500"
              )}>{day}</span>
              
              {isToday && !isSelected && (
                <div className={`absolute top-1 right-1 w-1.5 h-1.5 ${activeColors.todayDot} rounded-full`} />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
