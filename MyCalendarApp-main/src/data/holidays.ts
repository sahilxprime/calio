export type HolidayType = 'indian' | 'foreign' | 'important' | 'fun' | 'regional';

export interface Holiday {
    id: string;
    name: string;
    date: string; // ISO format YYYY-MM-DD
    type: HolidayType;
    description: string;
    emoji: string;
    color: string; // Tailwind/CSS color variable
    funFact?: string; // Daily fun fact
}

export const holidays: Holiday[] = [
    // --- Indian Festivals & Important Dates ---
    {
        id: 'lohri-2026',
        name: 'Lohri',
        date: '2026-01-13',
        type: 'regional',
        description: 'Popular winter folk festival celebrated primarily in Northern India.',
        emoji: '🔥',
        color: 'var(--color-ios-orange)',
        funFact: 'Lohri marks the end of winter and the traditional welcome of longer days!'
    },
    {
        id: 'makar-sankranti-2026',
        name: 'Makar Sankranti / Pongal',
        date: '2026-01-14',
        type: 'regional',
        description: 'Harvest festival celebrated across India with kites and sweet treats.',
        emoji: '🪁',
        color: 'var(--color-ios-orange)',
        funFact: 'Millions of people fly kites on this day, coloring the sky in vibrant hues.'
    },
    {
        id: 'republic-day-2026',
        name: 'Republic Day',
        date: '2026-01-26',
        type: 'important',
        description: 'Honours the date on which the Constitution of India came into effect.',
        emoji: '🇮🇳',
        color: 'var(--color-ios-blue)',
        funFact: 'The Republic Day parade showcases India\'s cultural and military heritage.'
    },
    {
        id: 'maha-shivratri-2026',
        name: 'Maha Shivratri',
        date: '2026-02-15',
        type: 'indian',
        description: 'A Hindu festival celebrated annually in honour of the god Shiva.',
        emoji: '🕉️',
        color: 'var(--color-ios-gray)',
        funFact: 'Devotees often stay awake all night singing hymns and chanting mantras.'
    },
    {
        id: 'holi-2026',
        name: 'Holi',
        date: '2026-03-04',
        type: 'indian',
        description: 'Festival of Colors, celebrating spring and love.',
        emoji: '🎨',
        color: 'var(--color-ios-red)',
        funFact: 'Holi signifies the triumph of good over evil.'
    },
    {
        id: 'independence-day-2026',
        name: 'Independence Day',
        date: '2026-08-15',
        type: 'important',
        description: 'Commemorates the nation\'s independence from the United Kingdom.',
        emoji: '🇮🇳',
        color: 'var(--color-ios-blue)',
        funFact: 'The Prime Minister hoists the Indian flag at the Red Fort in Delhi every year.'
    },
    {
        id: 'gandhi-jayanti-2026',
        name: 'Gandhi Jayanti',
        date: '2026-10-02',
        type: 'important',
        description: 'Celebrates the birthday of Mahatma Gandhi.',
        emoji: '🕊️',
        color: 'var(--color-ios-blue)',
        funFact: 'Gandhi Jayanti is heavily associated with promoting non-violence globally.'
    },
    {
        id: 'diwali-2026',
        name: 'Diwali',
        date: '2026-11-08',
        type: 'indian',
        description: 'Festival of Lights, celebrating the victory of light over darkness.',
        emoji: '🪔',
        color: 'var(--color-ios-orange)',
        funFact: 'Homes are decorated with thousands of clay lamps called diyas.'
    },
    {
        id: 'childrens-day-2026',
        name: 'Children\'s Day',
        date: '2026-11-14',
        type: 'important',
        description: 'Celebrated on the birthday of India\'s first Prime Minister, Jawaharlal Nehru.',
        emoji: '🧒🏽',
        color: 'var(--color-ios-green)',
        funFact: 'Jawaharlal Nehru was fondly called Chacha Nehru by children.'
    },

    // --- Global Observances ---
    {
        id: 'hindi-day-2026',
        name: 'World Hindi Day',
        date: '2026-01-10',
        type: 'foreign',
        description: 'Celebrated to promote the Hindi language worldwide.',
        emoji: '📖',
        color: 'var(--color-ios-blue)',
        funFact: 'Hindi is the third most spoken language in the world.'
    },
    {
        id: 'womens-day-2026',
        name: 'International Women\'s Day',
        date: '2026-03-08',
        type: 'foreign',
        description: 'A global holiday celebrating the social, economic, cultural, and political achievements of women.',
        emoji: '👩🏽',
        color: 'var(--color-ios-red)',
        funFact: 'The first National Woman\'s Day was observed in the United States in 1909.'
    },
    {
        id: 'earth-day-2026',
        name: 'Earth Day',
        date: '2026-04-22',
        type: 'foreign',
        description: 'An annual event to demonstrate support for environmental protection.',
        emoji: '🌍',
        color: 'var(--color-ios-green)',
        funFact: 'Earth Day has gone global, mobilizing 1 billion people in 192 countries.'
    },
    {
        id: 'yoga-day-2026',
        name: 'International Yoga Day',
        date: '2026-06-21',
        type: 'foreign',
        description: 'Celebrates the physical and spiritual prowess that yoga has brought to the world stage.',
        emoji: '🧘🏽',
        color: 'var(--color-ios-green)',
        funFact: 'Yoga is known to have originated in India over 5,000 years ago.'
    },

    // --- Fun / Niche Days ---
    {
        id: 'penguin-day-2026',
        name: 'Penguin Awareness Day',
        date: '2026-01-20',
        type: 'fun',
        description: 'A day to learn about and appreciate these amazing flightless birds.',
        emoji: '🐧',
        color: 'var(--color-ios-gray)',
        funFact: 'Emperor Penguins can dive up to 1,850 feet deep!'
    },
    {
        id: 'pizza-day-2026',
        name: 'World Pizza Day',
        date: '2026-02-09',
        type: 'fun',
        description: 'A global celebration of one of the world\'s most popular foods.',
        emoji: '🍕',
        color: 'var(--color-ios-orange)',
        funFact: 'The largest pizza ever made was 122 feet in diameter.'
    },
    {
        id: 'emoji-day-2026',
        name: 'World Emoji Day',
        date: '2026-07-17',
        type: 'fun',
        description: 'A global celebration of emojis.',
        emoji: '😎',
        color: 'var(--color-ios-blue)',
        funFact: 'July 17 was chosen because it is the date shown on the famous calendar emoji.'
    }
];
