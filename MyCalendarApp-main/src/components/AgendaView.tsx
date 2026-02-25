import { memo } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';

interface AgendaViewProps {
    holidays?: any[];
}

export const AgendaView = memo(function AgendaView({ holidays = [] }: AgendaViewProps) {
    // API se aaye asli holidays use kar rahe hain (pehle 20)
    const upcomingHolidays = holidays.slice(0, 20);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="pt-2 pb-24 space-y-4">
            {upcomingHolidays.length === 0 ? (
                <div className="text-center mt-10 text-ios-gray font-medium">
                    Holidays load ho rahe hain...
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-4 px-2"
                >
                    {upcomingHolidays.map((holiday, index) => {
                        // API date format ko handle karne ke liye
                        const dateString = holiday.date?.iso || holiday.date;
                        if (!dateString) return null;

                        const date = parseISO(dateString);
                        const monthStr = format(date, 'MMM');
                        const dayStr = format(date, 'd');
                        const dayOfWeekStr = format(date, 'EEEE');

                        const prevDateString = index > 0 ? (upcomingHolidays[index - 1].date?.iso || upcomingHolidays[index - 1].date) : null;
                        const showMonthDivider = index === 0 || (prevDateString && format(parseISO(prevDateString), 'MMM') !== monthStr);

                        return (
                            <div key={holiday.id || index}>
                                {showMonthDivider && (
                                    <div className="flex items-center mt-6 mb-4">
                                        <h3 className="text-xl font-bold tracking-tight">{format(date, 'MMMM yyyy')}</h3>
                                        <div className="ml-4 flex-1 h-[1px] bg-ios-gray-light/50" />
                                    </div>
                                )}

                                <motion.div
                                    variants={itemVariants}
                                    className="bg-ios-card rounded-3xl p-5 shadow-sm border border-ios-gray-light flex items-center mb-4 overflow-hidden relative group active:scale-[0.98] transition-transform"
                                >
                                    <div
                                        className="absolute left-0 top-0 bottom-0 w-1.5 opacity-80"
                                        style={{ backgroundColor: holiday.color || '#ff3b30' }}
                                    />

                                    <div className="flex flex-col items-center justify-center min-w-[60px] pr-4 border-r border-ios-gray-light/40">
                                        <span className="text-sm font-semibold text-ios-red uppercase tracking-wide">{monthStr}</span>
                                        <span className="text-3xl font-bold tracking-tighter -mt-1">{dayStr}</span>
                                    </div>

                                    <div className="pl-5 flex-1 flex items-center justify-between">
                                        <div>
                                            <h4 className="text-[17px] font-semibold tracking-tight">{holiday.name}</h4>
                                            <span className="text-xs text-ios-gray font-medium mt-0.5 block">
                                                {dayOfWeekStr} • {holiday.type ? holiday.type.charAt(0).toUpperCase() + holiday.type.slice(1) : 'Holiday'}
                                            </span>
                                        </div>
                                        <div className="text-4xl pl-2 drop-shadow-sm">
                                            {holiday.emoji || '📅'}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })}
                </motion.div>
            )}
        </div>
    );
});
