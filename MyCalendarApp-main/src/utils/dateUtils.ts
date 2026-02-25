import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    format,
    parseISO
} from 'date-fns';
import { holidays, type Holiday } from '../data/holidays';

export function getDaysInMonth(date: Date) {
    const start = startOfWeek(startOfMonth(date));
    const end = endOfWeek(endOfMonth(date));

    return eachDayOfInterval({ start, end });
}

export function getHolidaysForDate(date: Date): Holiday[] {
    return holidays.filter(holiday => isSameDay(parseISO(holiday.date), date));
}

export function getUpcomingHolidays(fromDate: Date, limit: number = 10): Holiday[] {
    return [...holidays]
        .filter(holiday => parseISO(holiday.date) >= fromDate)
        .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
        .slice(0, limit);
}

export { isSameMonth, isSameDay, format };
