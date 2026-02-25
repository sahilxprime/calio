import { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addMonths, subMonths, parseISO, isSameDay as fnsIsSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Sparkles, MapPin } from 'lucide-react';
import { getDaysInMonth, isSameMonth, isSameDay } from '../utils/dateUtils';
import { cn } from '../utils/cn';

interface CalendarViewProps {
    holidays?: any[];
}

export const CalendarView = memo(function CalendarView({ holidays = [] }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date("2026-01-01T00:00:00"));
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [direction, setDirection] = useState(0);
    const [isLocalMode, setIsLocalMode] = useState(true);

    const handlePreviousMonth = useCallback(() => {
        setDirection(-1);
        setCurrentDate(prev => subMonths(prev, 1));
    }, []);

    const handleNextMonth = useCallback(() => {
        setDirection(1);
        setCurrentDate(prev => addMonths(prev, 1));
    }, []);

    const days = getDaysInMonth(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // API ke asli data se holidays nikalne ka naya function
    const getRealHolidaysForDate = (day: Date) => {
        return holidays.filter(h => {
            const dStr = h.date?.iso || h.date;
            if (!dStr) return false;
            return fnsIsSameDay(parseISO(dStr), day);
        });
    };

    const variants = {
        enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0, scale: 0.9 }),
        center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
        exit: (direction: number) => ({ zIndex: 0, x: direction > 0 ? -300 : 300, opacity: 0, scale: 0.9 })
    };

    return (
        <div className="flex flex-col h-full pt-2 pb-24">
            <div className="flex items-center justify-between mb-4 px-2">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-ios-blue to-ios-green bg-clip-text text-transparent">
                        {format(currentDate, 'MMMM')}
                    </h2>
                    <span className="text-xl font-bold text-ios-gray/80 -mt-2 block">{format(currentDate, 'yyyy')}</span>
                </div>

                <div className="flex items-center space-x-3">
                    <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => setIsLocalMode(!isLocalMode)}
                        className={cn(
                            "p-2.5 rounded-full transition-all flex items-center shadow-sm",
                            isLocalMode ? "bg-ios-orange text-white ring-4 ring-ios-orange/20" : "bg-ios-card text-ios-gray border border-ios-gray-light"
                        )}
                    >
                        <MapPin size={20} strokeWidth={isLocalMode ? 3 : 2} />
                    </motion.button>

                    <div className="flex space-x-1 bg-ios-card rounded-full p-1 border border-ios-gray-light shadow-sm">
                        <motion.button whileTap={{ scale: 0.9 }} onClick={handlePreviousMonth} className="p-2 rounded-full text-ios-gray hover:text-ios-blue transition-colors">
                            <ChevronLeft size={22} strokeWidth={2.5} />
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={handleNextMonth} className="p-2 rounded-full text-ios-gray hover:text-ios-blue transition-colors">
                            <ChevronRight size={22} strokeWidth={2.5} />
                        </motion.button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 mb-3 px-2">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-[10px] font-bold text-ios-gray/60 uppercase tracking-widest">{day}</div>
                ))}
            </div>

            <div className="relative flex-1 px-1 overflow-visible">
                <AnimatePresence custom={direction} mode="popLayout" initial={false}>
                    <motion.div
                        key={currentDate.toString()}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="grid grid-cols-7 gap-y-3 gap-x-1"
                    >
                        {days.map((day) => {
                            let dayHolidays = getRealHolidaysForDate(day);
                            if (isLocalMode) {
                                dayHolidays = dayHolidays.filter(h => h.type === 'indian' || h.type === 'regional' || h.type === 'important');
                            }

                            const isCurrentMonth = isSameMonth(day, currentDate);
                            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                            const isToday = isSameDay(day, new Date(new Date().setHours(0, 0, 0, 0)));
                            const hasEvents = dayHolidays.length > 0;

                            return (
                                <div key={day.toString()} className="flex flex-col items-center justify-start h-14 relative">
                                    <motion.button
                                        whileTap={{ scale: 0.8, y: 2 }}
                                        whileHover={{ scale: 1.1 }}
                                        onClick={() => setSelectedDate(day)}
                                        className={cn(
                                            "flex items-center justify-center w-11 h-11 rounded-full text-lg relative font-medium transition-colors",
                                            !isCurrentMonth && "text-ios-gray/30",
                                            isCurrentMonth && !isSelected && !isToday && "text-ios-text hover:bg-ios-gray-light/40",
                                            isToday && !isSelected && "text-ios-blue font-black bg-ios-blue/10",
                                            isSelected && "text-white font-bold shadow-lg shadow-ios-blue/30",
                                            isSelected && (hasEvents ? `bg-ios-text` : `bg-ios-blue`)
                                        )}
                                    >
                                        {format(day, 'd')}
                                    </motion.button>

                                    <div className="flex justify-center space-x-0.5 mt-1 bottom-0 absolute">
                                        {dayHolidays.slice(0, 3).map((holiday, i) => (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                key={holiday.id || i}
                                                className="w-1.5 h-1.5 rounded-full shadow-sm"
                                                style={{ backgroundColor: holiday.color || '#ff3b30' }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {selectedDate && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className="mt-2"
                    >
                        {getRealHolidaysForDate(selectedDate).length > 0 ? (
                            <div className="space-y-3">
                                {getRealHolidaysForDate(selectedDate)
                                    .filter(holiday => !isLocalMode || ['indian', 'regional', 'important'].includes(holiday.type))
                                    .map((holiday, i) => (
                                        <motion.div
                                            whileTap={{ scale: 0.96 }}
                                            key={holiday.id || i}
                                            className="bg-ios-card rounded-[32px] p-5 shadow-sm border border-ios-gray-light relative overflow-hidden group cursor-pointer"
                                        >
                                            <div
                                                className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 mix-blend-multiply filter blur-2xl transition-transform group-hover:scale-150"
                                                style={{ backgroundColor: holiday.color || '#ff3b30' }}
                                            />

                                            <div className="flex items-start mb-3 relative z-10">
                                                <div className="text-5xl mr-4 drop-shadow-md">{holiday.emoji || '📅'}</div>
                                                <div className="flex-1 pt-1">
                                                    <div className="flex items-center space-x-2">
                                                        <h4 className="font-extrabold text-xl tracking-tight text-ios-text">{holiday.name}</h4>
                                                    </div>
                                                    <p className="text-[13px] font-medium text-ios-gray/80 uppercase tracking-widest mt-1">
                                                        {holiday.type || 'Holiday'}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="text-[15px] text-ios-gray leading-relaxed relative z-10 font-medium">
                                                {holiday.description || 'Special day'}
                                            </p>

                                            {holiday.funFact && (
                                                <div className="mt-4 pt-4 border-t border-ios-gray-light/50 relative z-10 flex items-start">
                                                    <Sparkles size={16} className="text-ios-orange mt-0.5 mr-2 shrink-0" />
                                                    <p className="text-[13px] text-ios-orange font-semibold italic">
                                                        " {holiday.funFact} "
                                                    </p>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                            </div>
                        ) : (
                            <motion.div
                                whileTap={{ scale: 0.97 }}
                                className="bg-ios-card/50 rounded-3xl p-5 border border-ios-gray-light border-dashed text-center"
                            >
                                <p className="text-ios-gray font-medium text-sm">No special events on {format(selectedDate, 'MMMM do')}.</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});
