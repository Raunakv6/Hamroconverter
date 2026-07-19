declare module 'nepali-date-converter' {
  export default class NepaliDate {
    constructor();
    constructor(date: Date);
    constructor(year: number, month: number, day: number);
    constructor(dateString: string);
    getYear(): number;
    getMonth(): number;
    getDate(): number;
    getDay(): number;
    setYear(year: number): void;
    setMonth(month: number): void;
    setDate(date: number): void;
    toJsDate(): Date;
    format(formatStr: string): string;
    static getDaysInBsMonth(year: number, month: number): number;
  }
}
