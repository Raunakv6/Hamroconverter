import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar as CalendarIcon, ArrowRightLeft, Info, CheckCircle2, AlertCircle, CalendarDays, Copy, RefreshCw, Share2, Moon, Sun } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { BSCalendar } from "@/src/components/BSCalendar";
import { bsToAd, adToBs, BS_CALENDAR_DATA } from "@/src/lib/calendar-data";

const NEPALI_MONTHS = [
  "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

const NEPALI_NUMBERS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

const toNepaliNumber = (num: number | string) => {
  return String(num).split('').map(char => {
    const n = parseInt(char);
    return isNaN(n) ? char : NEPALI_NUMBERS[n];
  }).join('');
};

export default function App() {
  const [activeTab, setActiveTab] = useState("bs-to-ad");
  const [today, setToday] = useState<any>(null);
  
  // BS to AD state
  const [bsYear, setBsYear] = useState("2080");
  const [bsMonth, setBsMonth] = useState("1");
  const [bsDay, setBsDay] = useState("1");
  const [convertedAD, setConvertedAD] = useState<any>(null);
  const [bsError, setBsError] = useState("");

  // AD to BS state
  const [adDate, setAdDate] = useState<Date | undefined>(new Date());
  const [adYear, setAdYear] = useState(String(new Date().getFullYear()));
  const [adMonth, setAdMonth] = useState(String(new Date().getMonth() + 1));
  const [adDay, setAdDay] = useState(String(new Date().getDate()));
  const [convertedBS, setConvertedBS] = useState<any>(null);
  const [adError, setAdError] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isBsPopoverOpen, setIsBsPopoverOpen] = useState(false);
  const [isAdPopoverOpen, setIsAdPopoverOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    initToday();
  }, []);

  const initToday = () => {
    try {
      const now = new Date();
      const bsNow = adToBs(now);
      const todayData = {
        ad: { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() },
        bs: bsNow
      };
      setToday(todayData);
      
      // Initialize with today's date
      setBsYear(String(bsNow.year));
      setBsMonth(String(bsNow.month));
      setBsDay(String(bsNow.day));
      
      setAdYear(String(now.getFullYear()));
      setAdMonth(String(now.getMonth() + 1));
      setAdDay(String(now.getDate()));
      setAdDate(now);
    } catch (err) {
      console.error("Failed to initialize today's date", err);
    }
  };

  const handleBSToAD = (y = bsYear, m = bsMonth, d = bsDay) => {
    setBsError("");
    setConvertedAD(null);

    const yearNum = Number(y);
    const monthNum = Number(m);
    const dayNum = Number(d);

    if (isNaN(yearNum) || yearNum < 1970 || yearNum > 2100) {
      setBsError("Please enter a valid BS year between 1970 and 2100.");
      return;
    }
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      setBsError("Please select a valid month between 1 and 12.");
      return;
    }
    
    const maxDays = BS_CALENDAR_DATA[yearNum as keyof typeof BS_CALENDAR_DATA]?.[monthNum - 1];
    if (!maxDays) {
      setBsError("Invalid calendar data for the selected year and month.");
      return;
    }

    if (isNaN(dayNum) || dayNum < 1 || dayNum > maxDays) {
      setBsError(`Please enter a valid day for ${NEPALI_MONTHS[monthNum - 1]} ${yearNum}. It should be between 1 and ${maxDays}.`);
      return;
    }

    try {
      const adDateResult = bsToAd({ year: yearNum, month: monthNum, day: dayNum });
      setConvertedAD({
        year: adDateResult.getFullYear(),
        month: adDateResult.getMonth() + 1,
        day: adDateResult.getDate(),
        dayOfWeek: adDateResult.getDay()
      });
    } catch (err: any) {
      setBsError(err.message || "Conversion failed");
    }
  };

  const handleADToBS = (y = adYear, m = adMonth, d = adDay) => {
    setAdError("");
    setConvertedBS(null);

    const yearNum = Number(y);
    const monthNum = Number(m);
    const dayNum = Number(d);

    if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum)) {
      setAdError("Please enter a valid date.");
      return;
    }

    try {
      const date = new Date(yearNum, monthNum - 1, dayNum);
      const bsDateResult = adToBs(date);
      setConvertedBS(bsDateResult);
    } catch (err: any) {
      setAdError(err.message || "Conversion failed");
    }
  };

  useEffect(() => {
    if (activeTab === "bs-to-ad") {
      handleBSToAD();
    } else {
      handleADToBS();
    }
  }, [activeTab, bsYear, bsMonth, bsDay, adYear, adMonth, adDay]);

  const onAdDateSelect = (date: Date | undefined) => {
    if (date) {
      setAdDate(date);
      setAdYear(String(date.getFullYear()));
      setAdMonth(String(date.getMonth() + 1));
      setAdDay(String(date.getDate()));
      setIsAdPopoverOpen(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (today) {
      setBsYear(String(today.bs.year));
      setBsMonth(String(today.bs.month));
      setBsDay(String(today.bs.day));
      setAdYear(String(today.ad.year));
      setAdMonth(String(today.ad.month));
      setAdDay(String(today.ad.day));
      setAdDate(new Date(today.ad.year, today.ad.month - 1, today.ad.day));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-xl shadow-blue-100 dark:shadow-none mb-4 border border-blue-50 dark:border-slate-800">
              <CalendarDays className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Hamro <span className="text-blue-600 dark:text-blue-400">Converter</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto mt-2">
              The most accurate and reliable Bikram Sambat to Gregorian date converter for Nepal.
            </p>
          </motion.div>
        </header>

        {/* Today's Date Banner */}
        {today && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-2xl">
                <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Today's Date</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {NEPALI_MONTHS[today.bs.month - 1]} {toNepaliNumber(today.bs.day)}, {toNepaliNumber(today.bs.year)} BS
                </p>
              </div>
            </div>
            <div className="hidden md:block h-12 w-px bg-slate-100 dark:bg-slate-800" />
            <div className="text-center md:text-left">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Gregorian</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {format(new Date(), "MMMM d, yyyy")} AD
              </p>
            </div>
          </motion.div>
        )}

        {/* Main Converter */}
        <Card className="border-none shadow-xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader className={cn(
              "transition-all duration-500 text-white pb-8",
              activeTab === "bs-to-ad" ? "bg-red-900" : "bg-indigo-900"
            )}>
              <div className="flex items-center justify-between mb-6">
                <TabsList className="bg-white/10 p-1 rounded-xl backdrop-blur-sm h-auto">
                  <TabsTrigger 
                    value="bs-to-ad" 
                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-red-900 transition-all font-bold px-4 py-2"
                  >
                    BS to AD
                  </TabsTrigger>
                  <TabsTrigger 
                    value="ad-to-bs"
                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-700 transition-all font-bold px-4 py-2"
                  >
                    AD to BS
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleReset}
                    className="rounded-xl hover:bg-white/10 text-white/70 hover:text-white"
                    title="Reset to Today"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="rounded-xl hover:bg-white/10 text-white/70 hover:text-white"
                    title="Toggle Dark Mode"
                  >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1 font-bold">From</p>
                  <Badge variant="outline" className="text-white border-white/20 px-4 py-1 rounded-full bg-white/5">
                    {activeTab === "bs-to-ad" ? "Bikram Sambat" : "Gregorian"}
                  </Badge>
                </div>
                <button 
                  onClick={() => setActiveTab(activeTab === "bs-to-ad" ? "ad-to-bs" : "bs-to-ad")}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center cursor-pointer group"
                  title="Swap Conversion"
                >
                  <ArrowRightLeft className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                </button>
                <div className="text-center">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1 font-bold">To</p>
                  <Badge variant="outline" className="text-white border-white/20 px-4 py-1 rounded-full bg-white/5">
                    {activeTab === "bs-to-ad" ? "Gregorian" : "Bikram Sambat"}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {activeTab === "bs-to-ad" ? (
                  <motion.div
                    key="bs-to-ad"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bs-year" className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-2">
                          Year (BS)
                          <Info className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                        </Label>
                        <Select value={bsYear} onValueChange={setBsYear}>
                          <SelectTrigger className="text-lg font-bold border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-red-500/20 rounded-2xl h-14 shadow-sm">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                            {Object.keys(BS_CALENDAR_DATA).map(year => (
                              <SelectItem key={year} value={year}>{toNepaliNumber(year)} ({year})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bs-month" className="text-slate-700 dark:text-slate-300 font-bold">Month</Label>
                        <Select value={bsMonth} onValueChange={setBsMonth}>
                          <SelectTrigger className="text-lg font-bold border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-red-500/20 rounded-2xl h-14 shadow-sm">
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                            {NEPALI_MONTHS.map((m, i) => (
                              <SelectItem key={i+1} value={String(i+1)}>{toNepaliNumber(i+1)}. {m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bs-day" className="text-slate-700 dark:text-slate-300 font-bold">Day</Label>
                        <div className="flex gap-2">
                          <Input 
                            id="bs-day" 
                            type="number" 
                            value={bsDay} 
                            onChange={(e) => setBsDay(e.target.value)}
                            placeholder="1"
                            className="text-lg font-bold border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-red-500/20 rounded-2xl h-14 shadow-sm w-full"
                          />
                          <Popover open={isBsPopoverOpen} onOpenChange={setIsBsPopoverOpen}>
                            <PopoverTrigger
                              className={cn(
                                buttonVariants({ variant: "outline", size: "icon" }),
                                "shrink-0 border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-2xl h-14 w-14 shadow-sm"
                              )}
                            >
                              <CalendarIcon className="h-6 w-6" />
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden border-slate-200 shadow-2xl" align="end">
                              <BSCalendar 
                                year={Number(bsYear)} 
                                month={Number(bsMonth)} 
                                selectedDay={Number(bsDay)}
                                onDayClick={(y, m, d) => {
                                  setBsYear(String(y));
                                  setBsMonth(String(m));
                                  setBsDay(String(d));
                                  setIsBsPopoverOpen(false);
                                }}
                                color="red"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>

                    {bsError && (
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm font-medium">
                        <AlertCircle className="w-4 h-4" />
                        {bsError}
                      </div>
                    )}

                    <div className="pt-6">
                      <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-8 text-center border border-dashed border-red-200 dark:border-red-900/30">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm font-medium text-red-800 dark:text-red-300 uppercase tracking-widest">Converted AD Date</p>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                              onClick={() => convertedAD && copyToClipboard(format(new Date(convertedAD.year, convertedAD.month - 1, convertedAD.day), "MMMM d, yyyy"))}
                              title="Copy Result"
                            >
                              {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 gap-2 rounded-lg"
                              onClick={() => setShowCalendar(!showCalendar)}
                            >
                              <CalendarDays className="w-4 h-4" />
                              <span className="hidden sm:inline">{showCalendar ? "Hide Calendar" : "View Month"}</span>
                            </Button>
                          </div>
                        </div>
                        {convertedAD ? (
                          <motion.div layout className="space-y-2">
                            <h2 className="text-4xl font-black text-red-900 dark:text-red-100">
                              {format(new Date(convertedAD.year, convertedAD.month - 1, convertedAD.day), "MMMM d, yyyy")}
                            </h2>
                            <p className="text-red-800 dark:text-red-300 font-medium">
                              {convertedAD.year}-{String(convertedAD.month).padStart(2, '0')}-{String(convertedAD.day).padStart(2, '0')} AD
                            </p>
                          </motion.div>
                        ) : (
                          <p className="text-red-400 dark:text-red-500/70 italic">Enter a valid BS date to convert</p>
                        )}
                      </div>
                    </div>

                    {showCalendar && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4">
                          <div className="flex items-center justify-between mb-2 px-1">
                            <h3 className="font-bold text-red-900 dark:text-red-100">
                              {NEPALI_MONTHS[Number(bsMonth) - 1]} {toNepaliNumber(bsYear)}
                            </h3>
                            <Badge variant="outline" className="text-[10px] uppercase tracking-tighter border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400">BS Calendar View</Badge>
                          </div>
                          <BSCalendar 
                            year={Number(bsYear)} 
                            month={Number(bsMonth)} 
                            selectedDay={Number(bsDay)}
                            onDayClick={(y, m, d) => {
                              setBsYear(String(y));
                              setBsMonth(String(m));
                              setBsDay(String(d));
                            }}
                            color="red"
                          />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="ad-to-bs"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ad-year" className="text-[#1E3A8A] dark:text-indigo-300 font-bold">Year (AD)</Label>
                        <Select value={adYear} onValueChange={(val) => {
                          setAdYear(val);
                          setAdDate(new Date(Number(val), Number(adMonth) - 1, Number(adDay)));
                        }}>
                          <SelectTrigger className="text-lg font-bold border-[#BFDBFE] dark:border-indigo-800 focus:border-[#3B82F6] focus:ring-[#3B82F6]/20 bg-[#E0E7FF] dark:bg-indigo-900/20 text-[#1E3A8A] dark:text-indigo-300 rounded-2xl h-14 shadow-sm">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl max-h-80 dark:bg-slate-800 dark:border-indigo-800 dark:text-indigo-300">
                            {Array.from({ length: 2044 - 1913 + 1 }, (_, i) => 1913 + i).map(year => (
                              <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ad-month" className="text-[#1E3A8A] dark:text-indigo-300 font-bold">Month</Label>
                        <Select value={adMonth} onValueChange={(val) => {
                          setAdMonth(val);
                          setAdDate(new Date(Number(adYear), Number(val) - 1, Number(adDay)));
                        }}>
                          <SelectTrigger className="text-lg font-bold border-[#BFDBFE] dark:border-indigo-800 focus:border-[#3B82F6] focus:ring-[#3B82F6]/20 bg-[#E0E7FF] dark:bg-indigo-900/20 text-[#1E3A8A] dark:text-indigo-300 rounded-2xl h-14 shadow-sm">
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl dark:bg-slate-800 dark:border-indigo-800 dark:text-indigo-300">
                            {Array.from({ length: 12 }, (_, i) => (
                              <SelectItem key={i+1} value={String(i+1)}>
                                {format(new Date(2024, i, 1), "MMMM")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ad-day" className="text-[#1E3A8A] dark:text-indigo-300 font-bold">Day</Label>
                        <div className="flex gap-2">
                          <Input 
                            id="ad-day" 
                            type="number" 
                            value={adDay} 
                            onChange={(e) => {
                              setAdDay(e.target.value);
                              setAdDate(new Date(Number(adYear), Number(adMonth) - 1, Number(e.target.value)));
                            }}
                            placeholder="1"
                            className="text-lg font-bold border-[#BFDBFE] dark:border-indigo-800 focus:border-[#3B82F6] focus:ring-[#3B82F6]/20 bg-[#E0E7FF] dark:bg-indigo-900/20 text-[#1E3A8A] dark:text-indigo-300 rounded-2xl h-14 w-full shadow-sm"
                          />
                          <Popover open={isAdPopoverOpen} onOpenChange={setIsAdPopoverOpen}>
                            <PopoverTrigger
                              className={cn(
                                buttonVariants({ variant: "outline", size: "icon" }),
                                "shrink-0 border-[#BFDBFE] dark:border-indigo-800 text-[#3B82F6] dark:text-indigo-400 hover:bg-[#BFDBFE]/30 dark:hover:bg-indigo-900/40 rounded-2xl h-14 w-14 shadow-sm"
                              )}
                            >
                              <CalendarIcon className="h-6 w-6" />
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden border-[#BFDBFE] shadow-2xl" align="end">
                              <Calendar
                                mode="single"
                                selected={adDate}
                                onSelect={onAdDateSelect}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>

                    {adError && (
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm font-medium">
                        <AlertCircle className="w-4 h-4" />
                        {adError}
                      </div>
                    )}

                    <div className="pt-6">
                      <div className="bg-[#E0E7FF] dark:bg-indigo-900/10 rounded-2xl p-8 text-center border border-dashed border-[#BFDBFE] dark:border-indigo-800/50">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm font-bold text-[#3B82F6] dark:text-indigo-400 uppercase tracking-widest">Converted BS Date</p>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-[#3B82F6]/50 dark:text-indigo-500 hover:text-[#3B82F6] dark:hover:text-indigo-300 hover:bg-[#BFDBFE]/30 dark:hover:bg-indigo-900/40 rounded-lg"
                              onClick={() => convertedBS && copyToClipboard(`${NEPALI_MONTHS[convertedBS.month - 1]} ${convertedBS.day}, ${convertedBS.year} BS`)}
                              title="Copy Result"
                            >
                              {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-[#3B82F6] dark:text-indigo-400 hover:text-[#2563EB] dark:hover:text-indigo-300 hover:bg-[#BFDBFE]/30 dark:hover:bg-indigo-900/40 gap-2 rounded-lg"
                              onClick={() => setShowCalendar(!showCalendar)}
                            >
                              <CalendarDays className="w-4 h-4" />
                              <span className="hidden sm:inline">{showCalendar ? "Hide Calendar" : "View Month"}</span>
                            </Button>
                          </div>
                        </div>
                        {convertedBS ? (
                          <motion.div layout className="space-y-2">
                            <h2 className="text-4xl font-black text-[#1E3A8A] dark:text-indigo-100">
                              {NEPALI_MONTHS[convertedBS.month - 1]} {toNepaliNumber(convertedBS.day)}, {toNepaliNumber(convertedBS.year)}
                            </h2>
                            <p className="text-[#3B82F6] dark:text-indigo-400 font-medium">
                              {convertedBS.year}-{String(convertedBS.month).padStart(2, '0')}-{String(convertedBS.day).padStart(2, '0')} BS
                            </p>
                          </motion.div>
                        ) : (
                          <p className="text-[#3B82F6]/60 dark:text-indigo-500/70 italic font-medium">Enter a valid AD date to convert</p>
                        )}
                      </div>
                    </div>

                    {showCalendar && convertedBS && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4">
                          <div className="flex items-center justify-between mb-2 px-1">
                            <h3 className="font-bold text-[#1E3A8A] dark:text-indigo-100">
                              {NEPALI_MONTHS[convertedBS.month - 1]} {toNepaliNumber(convertedBS.year)}
                            </h3>
                            <Badge variant="outline" className="text-[10px] uppercase tracking-tighter border-[#BFDBFE] dark:border-indigo-800/50 text-[#3B82F6] dark:text-indigo-400">BS Calendar View</Badge>
                          </div>
                          <BSCalendar 
                            year={convertedBS.year} 
                            month={convertedBS.month} 
                            selectedDay={convertedBS.day}
                            onDayClick={(y, m, d) => {
                              // In AD to BS tab, clicking a day should probably update the AD date
                              // But for now, let's just make it a view. 
                              // Actually, we can calculate the new AD date.
                              const newAdDate = bsToAd({ year: y, month: m, day: d });
                              onAdDateSelect(newAdDate);
                            }}
                            color="blue"
                          />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>

            <CardFooter className="bg-slate-50/50 dark:bg-slate-800/50 p-8 flex flex-col gap-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span>Verified accuracy using anchor date BS 2082-12-25</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-full gap-2 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
                    <Share2 className="w-3.5 h-3.5" />
                    Share
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Range: 1970 - 2100 BS</Badge>
                <Badge variant="secondary" className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Version: 1.2.0</Badge>
                <Badge variant="secondary" className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Data Source: Official Nepali Calendar</Badge>
              </div>
            </CardFooter>
          </Tabs>
        </Card>

        {/* Footer Info */}
        <footer className="text-center text-slate-400 dark:text-slate-500 text-sm pb-12">
          <p>© {new Date().getFullYear()} Hamro Converter. Built for accuracy and transparency.</p>
          <div className="mt-4 flex justify-center gap-6 flex-wrap">
            <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">API Documentation</a>
            <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Data Transparency</a>
            <a href="mailto:hamroconverter@gmail.com" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Contact Support</a>
            <a href="https://instagram.com/raunakshrestha45" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center gap-1">
              Instagram @raunakshrestha45
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
