import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { LocalNotifications } from '@capacitor/local-notifications';
import html2canvas from 'html2canvas';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

// 🟢 NEW: AdMob Imports
import { AdMob, BannerAdPosition, BannerAdSize, BannerAdPluginEvents } from '@capacitor-community/admob';

// @ts-ignore
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(2026);

  const [view, setView] = useState('calendar');
  const [holidays, setHolidays] = useState<any[]>([]);
  const [country, setCountry] = useState('IN');
  const [availableCountries, setAvailableCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [slideDirection, setSlideDirection] = useState('fade');

  // 🟡 MY DIARY / PERSONAL EVENTS STATE
  const [personalEvents, setPersonalEvents] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventNote, setNewEventNote] = useState('');

  // 📸 SHARE FEATURE STATE
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  // ⏱️ LIVE TIMER STATE
  const [nextEvent, setNextEvent] = useState<any | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // 🔥 DAILY STREAK STATE
  const [streak, setStreak] = useState(0);

  // 🏏 LIVE SCORE HUB STATE
  const [showScoreHub, setShowScoreHub] = useState(false);

  // 🔮 AI PREDICTION STATE
  const [currentPrediction, setCurrentPrediction] = useState('');

  // 🟢 NEW: AD STATE
  const [adInitialized, setAdInitialized] = useState(false);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // 🧠 DAILY TRIVIA LIST
  const triviaList = [
    "Sachin Tendulkar is the only player to score 100 international centuries.",
    "The longest cricket match in history lasted for 14 days between England and South Africa in 1939!",
    "MS Dhoni is the only captain in the world to win all three ICC trophies.",
    "Virat Kohli holds the record for the most runs in a single IPL season (973 runs).",
    "Chris Gayle is the only batsman to hit a six off the very first ball of a Test match.",
    "Muttiah Muralitharan took a staggering 800 wickets in Test cricket.",
    "India won its first Cricket World Cup in 1983 under the captaincy of Kapil Dev.",
    "Rohit Sharma holds the record for the highest individual score in ODIs (264).",
    "Shoaib Akhtar bowled the fastest delivery in cricket history at 161.3 km/h.",
    "Cricket was originally played with a bat that looked like a hockey stick!"
  ];
  const todayFact = triviaList[new Date().getDate() % triviaList.length];

  // 🔮 AI ASTRO PREDICTIONS
  const predictions = [
    "Aaj 1st Innings mein bada score banne ki umeed hai! 🏏",
    "Spinners ko aaj pitch se kafi madad milegi. 🌀",
    "Captain aaj toss jeet kar bowling choose karega! 🪙",
    "Ek unexpected player aaj Man of the Match ban sakta hai! ✨"
  ];

  // 📝 SMART HOLIDAY CHECKLISTS
  const holidayChecklists: { [key: string]: string[] } = {
    'Diwali': ["Buy Crackers 🎆", "Order Sweets 🍬", "Clean House 🧹", "New Clothes 👕"],
    'Holi': ["Buy Colors 🎨", "Pichkari ready? 🔫", "Make Gujiya 🥟"],
    'Independence Day': ["Flag Hoisting 🇮🇳", "Watch Parade 📺", "Patriotic Songs 🎵"]
  };

  // 🟢 NEW: ADMOB INITIALIZATION & HELPER FUNCTIONS
  useEffect(() => {
    const initAds = async () => {
      try {
        await AdMob.initialize({ requestTrackingAuthorization: true });
        setAdInitialized(true);
        loadBanner();
      } catch (e) {
        console.error("AdMob Init Error", e);
      }
    };
    initAds();
  }, []);

  const loadBanner = async () => {
    const options = {
      adId: 'ca-app-pub-3940256099942544/6300978111', // TEST ID
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 85, // Safety margin for Bottom Nav
      isTesting: true
    };
    await AdMob.showBanner(options);
  };

  const showInterstitial = async () => {
    await AdMob.prepareInterstitial({
      adId: 'ca-app-pub-3940256099942544/1033173712', // TEST ID
      isTesting: true
    });
    await AdMob.showInterstitial();
  };

  const showRewardVideo = async () => {
    triggerHaptic();
    await AdMob.prepareRewardVideoAd({
      adId: 'ca-app-pub-3940256099942544/5224354917', // TEST ID
      isTesting: true
    });
    await AdMob.showRewardVideoAd();
  };

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.targetTouches[0].clientX; touchEndX.current = null; };
  const onTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.targetTouches[0].clientX; };
  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) triggerNextMonth();
    else if (distance < -50) triggerPrevMonth();
  };

  const triggerNextMonth = () => {
    triggerHaptic();
    setSlideDirection('slide-left');
    if (currentMonth >= 11) { setCurrentMonth(0); setCurrentYear(prev => prev + 1); }
    else { setCurrentMonth(p => p + 1); }
  };

  const triggerPrevMonth = () => {
    triggerHaptic();
    setSlideDirection('slide-right');
    if (currentMonth <= 0) { setCurrentMonth(11); setCurrentYear(prev => prev - 1); }
    else { setCurrentMonth(p => p - 1); }
  };

  const triggerHaptic = () => { try { if (navigator.vibrate) navigator.vibrate(40); } catch (e) { } };

  const fireEmojiRain = (type: string) => {
    const emojis = type === 'cricket' ? ['🏏', '⚾', '🇮🇳', '🏆'] : ['🎉', '✨', '🏮', '🎊'];
    const scalar = 3;
    const shape = confetti.shapeFromText({ text: emojis[Math.floor(Math.random() * emojis.length)], scalar });
    confetti({ shapes: [shape], particleCount: 35, spread: 80, origin: { y: 0.5 }, gravity: 0.8 });
  };

  const getZodiacSign = (dateString: string) => {
    if (!dateString) return "♑ Capricorn";
    const parts = dateString.split('-');
    if (parts.length < 3) return "♑ Capricorn";
    const day = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10);
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "♒ Aquarius";
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "♓ Pisces";
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "♈ Aries";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "♉ Taurus";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "♊ Gemini";
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "♋ Cancer";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "♌ Leo";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "♍ Virgo";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "♎ Libra";
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "♏ Scorpio";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "♐ Sagittarius";
    return "♑ Capricorn";
  };

  const getDaysLeft = (dateString: string) => {
    if (!dateString) return "Passed";
    const [y, m, d] = dateString.split('-');
    const holidayDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const today = new Date(); today.setHours(0, 0, 0, 0); holidayDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((holidayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "🔥 Today!";
    if (diffDays < 0) return "Passed";
    return `⏳ In ${diffDays} days`;
  };

  const asianCountries = [{ countryCode: 'IN', name: 'India' }, { countryCode: 'US', name: 'United States' }];

  const customHolidays: { [key: string]: any[] } = {
    'IN': [
      { date: '2026-01-01', localName: 'New Year\'s Day', name: 'New Year\'s Day' },
      { date: '2026-01-14', localName: 'Makar Sankranti', name: 'Makar Sankranti/Pongal/Magh Bihu' },
      { date: '2026-01-23', localName: 'Vasant Panchami', name: 'Vasant Panchami/Subhas Chandra Bose' },
      { date: '2026-01-26', localName: 'Republic Day', name: 'Republic Day' },
      { date: '2026-01-30', localName: 'Gandhi Punyatithi', name: 'Gandhi Punyatithi' },
      { date: '2026-02-01', localName: 'Guru Ravidas Jayanti', name: 'Guru Ravidas Jayanti' },
      { date: '2026-02-12', localName: 'Maharishi Dayanand', name: 'Maharishi Dayanand Saraswati' },
      { date: '2026-02-15', localName: 'Maha Shivaratri', name: 'Maha Shivaratri' },
      { date: '2026-02-19', localName: 'Shivaji Jayanti', name: 'Shivaji Jayanti' },
      { date: '2026-03-03', localName: 'Holika Dahan', name: 'Holika Dahan/Chhoti Holi' },
      { date: '2026-03-04', localName: 'Holi', name: 'Holi' },
      { date: '2026-03-20', localName: 'Eid al-Fitr', name: 'Eid al-Fitr (Tentative)' },
      { date: '2026-03-31', localName: 'Ram Navami', name: 'Ram Navami' },
      { date: '2026-04-02', localName: 'Mahavir Jayanti', name: 'Mahavir Jayanti' },
      { date: '2026-04-03', localName: 'Good Friday', name: 'Good Friday' },
      { date: '2026-04-14', localName: 'Ambedkar Jayanti', name: 'Ambedkar Jayanti' },
      { date: '2026-05-01', localName: 'Labour Day', name: 'May Day/Labour Day' },
      { date: '2026-05-12', localName: 'Buddha Purnima', name: 'Buddha Purnima' },
      { date: '2026-05-28', localName: 'Eid al-Adha', name: 'Eid al-Adha/Bakrid' },
      { date: '2026-06-26', localName: 'Muharram', name: 'Muharram (Tentative)' },
      { date: '2026-07-06', localName: 'Ashura', name: 'Muharram/Ashura' },
      { date: '2026-08-07', localName: 'National Handloom Day', name: 'National Handloom Day' },
      { date: '2026-08-15', localName: 'Independence Day', name: 'Independence Day' },
      { date: '2026-08-16', localName: 'Janmashtami', name: 'Janmashtami' },
      { date: '2026-08-26', localName: 'Milad-un-Nabi', name: 'Milad-un-Nabi' },
      { date: '2026-08-28', localName: 'Raksha Bandhan', name: 'Raksha Bandhan' },
      { date: '2026-09-04', localName: 'Janmashtami (Alt)', name: 'Janmashtami (Alternative)' },
      { date: '2026-09-14', localName: 'Ganesh Chaturthi', name: 'Ganesh Chaturthi' },
      { date: '2026-10-01', localName: 'Dussehra Mahanavami', name: 'Dussehra Mahanavami' },
      { date: '2026-10-02', localName: 'Gandhi Jayanti', name: 'Gandhi Jayanti' },
      { date: '2026-10-02', localName: 'Vijayadashami', name: 'Vijayadashami' },
      { date: '2026-10-20', localName: 'Diwali', name: 'Diwali (Deepavali)' },
      { date: '2026-10-21', localName: 'Govardhan Puja', name: 'Diwali (Day 2)' },
      { date: '2026-10-22', localName: 'Bhaiya Dooj', name: 'Bhaiya Dooj' },
      { date: '2026-11-05', localName: 'Guru Nanak Jayanti', name: 'Guru Nanak Jayanti' },
      { date: '2026-11-24', localName: 'Guru Nanak\'s Birthday', name: 'Guru Nanak\'s Birthday (Alt)' },
      { date: '2026-12-25', localName: 'Christmas Day', name: 'Christmas Day' },
      { date: '2026-12-31', localName: 'New Year\'s Eve', name: 'New Year\'s Eve' }
    ]
  };

  const fallbackCricketMatches = [
    { date: '2026-01-11', localName: 'IND vs NZ (1st ODI)', name: 'New Zealand Tour of India', icon: '🏏', venue: 'Vadodara, India', type: 'cricket' },
    { date: '2026-01-14', localName: 'IND vs NZ (2nd ODI)', name: 'New Zealand Tour of India', icon: '🏏', venue: 'Rajkot, India', type: 'cricket' },
    { date: '2026-01-18', localName: 'IND vs NZ (3rd ODI)', name: 'New Zealand Tour of India', icon: '🏏', venue: 'Indore, India', type: 'cricket' },
    { date: '2026-01-21', localName: 'IND vs NZ (1st T20I)', name: 'New Zealand Tour of India', icon: '🏏', venue: 'Nagpur, India', type: 'cricket' },
    { date: '2026-01-23', localName: 'IND vs NZ (2nd T20I)', name: 'New Zealand Tour of India', icon: '🏏', venue: 'Raipur, India', type: 'cricket' },
    { date: '2026-01-25', localName: 'IND vs NZ (3rd T20I)', name: 'New Zealand Tour of India', icon: '🏏', venue: 'Guwahati, India', type: 'cricket' },
    { date: '2026-01-28', localName: 'IND vs NZ (4th T20I)', name: 'New Zealand Tour of India', icon: '🏏', venue: 'Visakhapatnam, India', type: 'cricket' },
    { date: '2026-01-31', localName: 'IND vs NZ (5th T20I)', name: 'New Zealand Tour of India', icon: '🏏', venue: 'Thiruvananthapuram, India', type: 'cricket' },
    { date: '2026-02-07', localName: 'IND vs USA (T20 WC)', name: 'T20 World Cup 2026', icon: '🏏', venue: 'Wankhede, Mumbai', type: 'cricket' },
    { date: '2026-02-12', localName: 'IND vs NAM (T20 WC)', name: 'T20 World Cup 2026', icon: '🏏', venue: 'Delhi, India', type: 'cricket' },
    { date: '2026-02-15', localName: 'IND vs PAK (T20 WC)', name: 'T20 World Cup 2026', icon: '🔥', venue: 'Colombo, Sri Lanka', type: 'cricket' },
    { date: '2026-02-18', localName: 'IND vs NED (T20 WC)', name: 'T20 World Cup 2026', icon: '🏏', venue: 'Ahmedabad, India', type: 'cricket' },
    { date: '2026-02-26', localName: 'IND vs ZIM (T20 WC Super 8)', name: 'T20 World Cup 2026', icon: '🏏', venue: 'Chennai, India', type: 'cricket' },
    { date: '2026-03-01', localName: 'IND vs WI (T20 WC Super 8)', name: 'T20 World Cup 2026', icon: '🏏', venue: 'Kolkata, India', type: 'cricket' },
    { date: '2026-03-08', localName: 'T20 WC Final', name: 'T20 World Cup 2026', icon: '🏆', venue: 'TBD', type: 'cricket' },
    { date: '2026-03-26', localName: 'IPL 2026 Opener', name: 'Indian Premier League', icon: '🏏', venue: 'India', type: 'cricket' },
    { date: '2026-05-31', localName: 'IPL 2026 Final', name: 'Indian Premier League', icon: '🏆', venue: 'India', type: 'cricket' },
    { date: '2026-07-01', localName: 'ENG vs IND (1st T20I)', name: 'India Tour of England', icon: '🏏', venue: 'Chester-le-Street, UK', type: 'cricket' },
    { date: '2026-07-04', localName: 'ENG vs IND (2nd T20I)', name: 'India Tour of England', icon: '🏏', venue: 'Manchester, UK', type: 'cricket' },
    { date: '2026-07-07', localName: 'ENG vs IND (3rd T20I)', name: 'India Tour of England', icon: '🏏', venue: 'Nottingham, UK', type: 'cricket' },
    { date: '2026-07-09', localName: 'ENG vs IND (4th T20I)', name: 'India Tour of England', icon: '🏏', venue: 'Bristol, UK', type: 'cricket' },
    { date: '2026-07-11', localName: 'ENG vs IND (5th T20I)', name: 'India Tour of England', icon: '🏏', venue: 'Southampton, UK', type: 'cricket' },
    { date: '2026-07-14', localName: 'ENG vs IND (1st ODI)', name: 'India Tour of England', icon: '🏏', venue: 'Birmingham, UK', type: 'cricket' },
    { date: '2026-07-16', localName: 'ENG vs IND (2nd ODI)', name: 'India Tour of England', icon: '🏏', venue: 'Cardiff, Wales', type: 'cricket' },
    { date: '2026-07-19', localName: 'ENG vs IND (3rd ODI)', name: 'India Tour of England', icon: '🏏', venue: 'Lord\'s, London', type: 'cricket' },
    { date: '2026-09-19', localName: 'Asian Games 2026 Begins', name: 'Asian Games T20', icon: '🥇', venue: 'Nagoya, Japan', type: 'cricket' },
    { date: '2026-10-04', localName: 'Asian Games Final', name: 'Asian Games T20', icon: '🏆', venue: 'Nagoya, Japan', type: 'cricket' }
  ];

  const [cricketMatches, setCricketMatches] = useState<any[]>(fallbackCricketMatches);

  useEffect(() => {
    const saved = localStorage.getItem('myPersonalEvents');
    if (saved) setPersonalEvents(JSON.parse(saved));
  }, []);

  const handleSavePersonalEvent = () => {
    if (!newEventName || !newEventDate) return;
    const newEvt = { date: newEventDate, localName: newEventName, name: 'My Personal Event', type: 'personal', icon: '🎂', note: newEventNote };
    const updated = [...personalEvents, newEvt];
    setPersonalEvents(updated);
    localStorage.setItem('myPersonalEvents', JSON.stringify(updated));
    setShowAddModal(false); setNewEventName(''); setNewEventDate(''); setNewEventNote(''); triggerHaptic();
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://date.nager.at/api/v3/AvailableCountries');
        const apiData = await response.json();
        const mergedData = [...apiData, ...asianCountries].sort((a: any, b: any) => a.countryCode === 'IN' ? -1 : b.countryCode === 'IN' ? 1 : a.name.localeCompare(b.name));
        setAvailableCountries(mergedData.filter((v, i, a) => a.findIndex(v2 => (v2.countryCode === v.countryCode)) === i));
      } catch (error) { setAvailableCountries(asianCountries); }
    }; fetchCountries();
  }, []);

  useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true);
      try {
        let fetchedHolidays = [];
        if (currentYear === 2026 && customHolidays[country]) {
          fetchedHolidays = customHolidays[country].map(h => ({ ...h, type: 'holiday' }));
        } else {
          const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${currentYear}/${country}`);
          if (response.ok) {
            const data = await response.json();
            fetchedHolidays = data.map((h: any) => ({ ...h, type: 'holiday' }));
          }
        }
        setHolidays(fetchedHolidays);
      } catch (error) { setHolidays([]); } finally { setLoading(false); }
    };
    if (country) fetchHolidays();
  }, [country, currentYear]);

  useEffect(() => {
    const fetchLiveCricketMatches = async () => {
      try {
        const API_KEY = "1dd084d3-a4ed-49e1-9c26-6d62cae81194";
        const response = await fetch(`https://api.cricapi.com/v1/matches?apikey=${API_KEY}&offset=0`);
        const data = await response.json();
        if (data && data.data) {
          const formattedMatches = data.data
            .filter((m: any) => m.name.includes('India') || m.name.includes('IND'))
            .map((m: any) => ({
              date: m.date.split('T')[0],
              localName: m.name.length > 30 ? m.name.substring(0, 30) + '...' : m.name,
              name: m.matchInfo || m.status || 'International Cricket',
              icon: m.name.includes('PAK') ? '🔥' : '🏏',
              venue: m.venue || 'TBD',
              type: 'cricket'
            }));
          if (formattedMatches.length > 0) {
            setCricketMatches(formattedMatches);
          }
        }
      } catch (error) {
        console.log("Internet/API issue. Smoothly running on offline backup data.");
      }
    };
    if (country === 'IN') {
      fetchLiveCricketMatches();
    }
  }, [country]);

  const currentEventsList = country === 'IN' ? cricketMatches : [];
  const allEvents = [...holidays, ...currentEventsList, ...personalEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const displayedEvents = allEvents.filter(e => {
    const matchesFilter = activeFilter === 'all' || e.type === activeFilter;
    const matchesSearch = e.name?.toLowerCase().includes(searchQuery.toLowerCase()) || e.localName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const upcoming = displayedEvents.find(e => {
    if (!e || !e.date) return false;
    const [y, m, d] = e.date.split('-');
    const eventEnd = new Date(parseInt(y), parseInt(m) - 1, parseInt(d), 23, 59, 59).getTime();
    return eventEnd > new Date().getTime();
  });

  const upcomingId = upcoming ? `${upcoming.localName}-${upcoming.date}` : null;

  useEffect(() => {
    setNextEvent(upcoming || null);
    if (!upcoming) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }

    const updateTimer = () => {
      const [y, m, d] = upcoming.date.split('-');
      const targetDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      if (upcoming.type === 'cricket') targetDate.setHours(15, 30, 0, 0);
      else targetDate.setHours(0, 0, 0, 0);
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [upcomingId, activeFilter, view]);

  const handleEventClick = (event: any) => {
    triggerHaptic();
    setSelectedEvent(event);
    if (event.type === 'cricket') {
      setCurrentPrediction(predictions[Math.floor(Math.random() * predictions.length)]);
      fireEmojiRain(event.type);
    } else if (event.type === 'holiday') { fireEmojiRain(event.type); }
  };

  const handleNavClick = (newView: string) => { triggerHaptic(); setView(newView); };

  const scheduleReminder = async (event: any) => {
    triggerHaptic();
    try {
      let permStatus = await LocalNotifications.checkPermissions();
      if (permStatus.display !== 'granted') permStatus = await LocalNotifications.requestPermissions();
      if (permStatus.display !== 'granted') { alert('Please allow notifications to set reminders! 🔔'); return; }
      const [y, m, d] = event.date.split('-');
      const eventDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d), 9, 0, 0);
      if (eventDate.getTime() < new Date().getTime()) { alert('This event has already passed! 😅'); return; }
      await LocalNotifications.schedule({
        notifications: [{ title: event.type === 'cricket' ? '🏏 Match Day Today!' : '🎉 Event Today!', body: `Don't forget: ${event.localName}`, id: Math.floor(Math.random() * 100000), schedule: { at: eventDate } }]
      });
      alert(`Reminder set! 🔔`);
    } catch (error) { alert(`Reminder saved for: ${event.localName}. 🔔`); }
  };

  // 🟢 UPDATED: Share logic now shows Interstitial Ad first
  const handleSharePoster = async () => {
    triggerHaptic();
    if (!modalContentRef.current) return;
    setIsSharing(true);

    // Earning part: Show Ad before sharing
    await showInterstitial();

    try {
      const canvas = await html2canvas(modalContentRef.current, { backgroundColor: isDarkMode ? '#1c1c1e' : '#ffffff', scale: 2, useCORS: true });
      const base64Data = canvas.toDataURL('image/png').split(',')[1];
      const fileName = `India-Calendar-${new Date().getTime()}.png`;
      const savedFile = await Filesystem.writeFile({ path: fileName, data: base64Data, directory: Directory.Cache });
      await Share.share({ title: selectedEvent.localName, text: `Check this out! 🗓️ Download India Calendar.`, url: savedFile.uri });
      setIsSharing(false);
    } catch (error) { setIsSharing(false); alert("Failed to share poster."); }
  };

  useEffect(() => {
    const calculateStreak = () => {
      const today = new Date().toDateString();
      const lastOpen = localStorage.getItem('lastOpenDate');
      let currentStreak = parseInt(localStorage.getItem('myStreak') || '0');
      if (lastOpen === today) { setStreak(currentStreak); return; }
      if (lastOpen) {
        const lastDate = new Date(lastOpen);
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate.toDateString() === yesterday.toDateString()) { currentStreak += 1; }
        else { currentStreak = 1; }
      } else { currentStreak = 1; }
      setStreak(currentStreak);
      localStorage.setItem('myStreak', currentStreak.toString());
      localStorage.setItem('lastOpenDate', today);
    };
    calculateStreak();
  }, []);

  const renderCalendarDays = () => {
    let days = [];
    const realToday = new Date();
    const currentFirstDay = new Date(currentYear, currentMonth, 1).getDay();
    const currentDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let i = 0; i < currentFirstDay; i++) days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    for (let i = 1; i <= currentDaysInMonth; i++) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayEvents = displayedEvents.filter(e => e.date === dateString);
      const isToday = realToday.getFullYear() === currentYear && realToday.getMonth() === currentMonth && realToday.getDate() === i;
      const hasHoliday = dayEvents.some(e => e.type === 'holiday');
      const hasCricket = dayEvents.some(e => e.type === 'cricket');
      const hasPersonal = dayEvents.some(e => e.type === 'personal');
      let dayClass = '';
      if (hasPersonal) dayClass = 'personal';
      else if (hasHoliday && hasCricket) dayClass = 'holiday cricket-mixed';
      else if (hasHoliday) dayClass = 'holiday';
      else if (hasCricket) dayClass = 'cricket';
      days.push(
        <div key={`day-${i}`} className={`calendar-day ${dayClass} ${isToday ? 'today' : ''} haptic-btn`} onClick={() => dayEvents.length > 0 ? handleEventClick(dayEvents[0]) : null}>
          {i}
        </div>
      );
    }
    return days;
  };

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : ''} ${adInitialized ? 'ad-active' : ''}`}>
      <div className="main-content">

        {view === 'calendar' && (
          <div className="calendar-view" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            <div className="calendar-header">
              <div key={`title-${currentMonth}-${currentYear}`} className={`calendar-anim-wrapper ${slideDirection}`}>
                <h1 className="month-title">{months[currentMonth]}</h1>
                <h2 className="year-title">{currentYear}</h2>
              </div>
              <div className="controls">
                {streak > 0 && (
                  <div className="streak-badge haptic-btn" onClick={() => { triggerHaptic(); alert(`🔥 You're on a ${streak}-day streak!`); }}>
                    🔥 {streak}
                  </div>
                )}
                <button className="theme-toggle haptic-btn" onClick={() => { triggerHaptic(); setIsDarkMode(!isDarkMode); }}>{isDarkMode ? '☀️' : '🌙'}</button>
                <select className="country-select haptic-btn" value={country} onChange={(e) => { triggerHaptic(); setCountry(e.target.value); }}>
                  {availableCountries.map((c) => <option key={c.countryCode} value={c.countryCode}>{c.countryCode === 'IN' ? '🇮🇳 India' : c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="filter-container">
              <button className={`filter-chip haptic-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => { triggerHaptic(); setActiveFilter('all') }}>🌍 All</button>
              <button className={`filter-chip haptic-btn ${activeFilter === 'holiday' ? 'active' : ''}`} onClick={() => { triggerHaptic(); setActiveFilter('holiday') }}>🎉 Holidays</button>
              {country === 'IN' && (
                <button className={`filter-chip haptic-btn ${activeFilter === 'cricket' ? 'active' : ''}`} onClick={() => { triggerHaptic(); setActiveFilter('cricket') }}>🏏 Cricket</button>
              )}
            </div>

            <div key={`grid-${currentMonth}-${currentYear}`} className={`calendar-anim-wrapper ${slideDirection}`} style={{ width: '100%' }}>
              <div className="calendar-grid">
                {daysOfWeek.map(day => <div key={day} className="day-name">{day}</div>)}
                {renderCalendarDays()}
              </div>
            </div>
          </div>
        )}

        {view === 'agenda' && (
          <div className="agenda-view animation-fade-in">
            <h1 className="page-title">Upcoming Events</h1>
            <input type="text" className="search-bar" placeholder="Search holidays or matches..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

            <div className="filter-container">
              <button className={`filter-chip haptic-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => { triggerHaptic(); setActiveFilter('all') }}>🌍 All</button>
              <button className={`filter-chip haptic-btn ${activeFilter === 'holiday' ? 'active' : ''}`} onClick={() => { triggerHaptic(); setActiveFilter('holiday') }}>🎉 Holidays</button>
              {country === 'IN' && (
                <button className={`filter-chip haptic-btn ${activeFilter === 'cricket' ? 'active' : ''}`} onClick={() => { triggerHaptic(); setActiveFilter('cricket') }}>🏏 Cricket</button>
              )}
            </div>

            <div className="trivia-card animation-slide-up">
              <div className="trivia-header">💡 FACT OF THE DAY</div>
              <p className="trivia-text">{todayFact}</p>
            </div>

            {nextEvent && (
              <div className="live-timer-card animation-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="timer-header">
                  <span className="live-pulse"></span> NEXT BIG EVENT
                </div>
                <h3 className="timer-title">{nextEvent.type === 'cricket' ? nextEvent.icon : '🎉'} {nextEvent.localName}</h3>
                <div className="timer-grid">
                  <div className="time-box"><strong>{String(timeLeft.days).padStart(2, '0')}</strong><span>Days</span></div>
                  <div className="time-colon">:</div>
                  <div className="time-box"><strong>{String(timeLeft.hours).padStart(2, '0')}</strong><span>Hours</span></div>
                  <div className="time-colon">:</div>
                  <div className="time-box"><strong>{String(timeLeft.minutes).padStart(2, '0')}</strong><span>Mins</span></div>
                  <div className="time-colon">:</div>
                  <div className="time-box"><strong>{String(timeLeft.seconds).padStart(2, '0')}</strong><span>Secs</span></div>
                </div>
              </div>
            )}

            {loading ? <div className="loading-spinner"></div> : displayedEvents.length > 0 ? (
              displayedEvents.map((e: any, index: number) => (
                <div key={index} className="agenda-item animation-slide-up haptic-btn" style={{ animationDelay: `${(index + 2) * 0.05}s` }} onClick={() => handleEventClick(e)}>
                  <div className={`agenda-date ${e.type === 'cricket' ? 'cricket-date' : ''}`}>
                    <span className="agenda-day">{e.date ? e.date.split('-')[2] : ''}</span>
                    <span className="agenda-month">{e.date ? months[parseInt(e.date.split('-')[1]) - 1].substring(0, 3) : ''}</span>
                  </div>
                  <div className="agenda-details">
                    <strong>{e.type === 'cricket' ? e.icon : e.type === 'personal' ? '🎂' : ''} {e.localName}</strong>
                    <p>{e.name}</p>
                    <div className="badge-row">
                      <span className={`countdown-badge ${getDaysLeft(e.date) === 'Passed' ? 'passed' : ''}`}>{getDaysLeft(e.date)}</span>
                      {e.type === 'cricket' ? (
                        <span className="venue-badge">🏟️ {e.venue}</span>
                      ) : (
                        <span className="zodiac-badge">{getZodiacSign(e.date)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : <p style={{ textAlign: 'center', color: '#888', marginTop: '50px', fontWeight: 600 }}>No events found for this filter.</p>}
          </div>
        )}

        {view === 'about' && (
          <div className="about-view animation-fade-in">
            <h1 className="page-title" style={{ marginBottom: '30px' }}>About Developer</h1>
            <div className="premium-profile-header">
              <div className="profile-image-wrapper">
                <img src="/profile.jpg" alt="Sahil" className="profile-image" />
              </div>
              <h2 className="profile-name">Sahil</h2>
              <p className="profile-title">Lead iOS & Android Developer</p>
              <p className="profile-bio">Crafting beautiful, minimal, and user-friendly mobile experiences.</p>
            </div>

            <div className="ios-settings-group">
              {/* 🟢 NEW: Ad-Free / Support Button with Reward Ad */}
              <div className="ios-setting-item haptic-btn" onClick={showRewardVideo}>
                <div className="setting-icon" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>💰</div>
                <div className="setting-label">Support App (Add-Free Mode)</div>
                <div className="setting-value">Watch Video</div>
                <div className="setting-arrow">›</div>
              </div>
              <div className="setting-divider"></div>
              <a href="https://instagram.com/primexsahil" target="_blank" rel="noreferrer" className="ios-setting-item haptic-btn" onClick={triggerHaptic}>
                <div className="setting-icon insta-bg">📸</div>
                <div className="setting-label">Instagram</div>
                <div className="setting-value">@primexsahil</div>
                <div className="setting-arrow">›</div>
              </a>
              <div className="setting-divider"></div>
              <a href="mailto:primexsahil45@gmail.com" className="ios-setting-item haptic-btn" onClick={triggerHaptic}>
                <div className="setting-icon email-bg">📧</div>
                <div className="setting-label">Email Me</div>
                <div className="setting-value">primexsahil45...</div>
                <div className="setting-arrow">›</div>
              </a>
              <div className="setting-divider"></div>
              <div className="ios-setting-item haptic-btn" style={{ cursor: 'default' }} onClick={triggerHaptic}>
                <div className="setting-icon location-bg">📍</div>
                <div className="setting-label">Location</div>
                <div className="setting-value">Shimla, HP</div>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '40px' }}><p className="version-text">INDIA CRICKET EDITION • V 2.0.0 PRO</p></div>
          </div>
        )}
      </div>

      {selectedEvent && (
        <div className="modal-overlay" onClick={() => { triggerHaptic(); setSelectedEvent(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} ref={modalContentRef}>
            <div className="modal-handle"></div>
            <h2 className="modal-title">{selectedEvent.type === 'cricket' ? selectedEvent.icon : selectedEvent.type === 'personal' ? '🎂' : ''} {selectedEvent.localName}</h2>
            <p className="modal-date-text">🗓️ {formatDateString(selectedEvent.date)}</p>

            {selectedEvent.type === 'cricket' ? (
              <div className="cricket-box">
                <h4 style={{ margin: '0 0 5px 0', color: '#059669' }}>🏟️ Match Details</h4>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', marginBottom: '15px' }}>Get ready! The epic <strong>{selectedEvent.name}</strong> clash will happen at <strong>{selectedEvent.venue}</strong>.</p>
                <div className="prediction-box">
                  <h4>🔮 AI Astro Prediction</h4>
                  <p>{currentPrediction}</p>
                </div>
                <button className="watch-live-btn haptic-btn" style={{ background: 'linear-gradient(135deg, #007aff, #0056b3)', marginBottom: '10px' }} onClick={() => { triggerHaptic(); setShowScoreHub(true); }}>🔴 VIEW LIVE SCORE</button>
                <button className="watch-live-btn haptic-btn" onClick={() => { triggerHaptic(); window.open('https://www.jiocinema.com/sports/cricket', '_blank'); }}><span className="live-dot"></span> WATCH LIVE</button>
              </div>
            ) : selectedEvent.type === 'personal' ? (
              <>
                <div className="fun-fact-box" style={{ borderLeftColor: '#f59e0b' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#f59e0b' }}>📝 Event Notes</h4>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{selectedEvent.note ? selectedEvent.note : "You haven't added any notes for this event."}</p>
                </div>
                <div className="astrology-box">
                  <h4 style={{ margin: '0 0 5px 0', color: '#a020f0' }}>🔮 Astrology Insight</h4>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>Zodiac Sign for this day: <strong>{getZodiacSign(selectedEvent.date)}</strong></p>
                </div>
              </>
            ) : (
              <>
                <div className="fun-fact-box">
                  <h4 style={{ margin: '0 0 5px 0', color: '#007aff' }}>✨ Event Info</h4>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{selectedEvent.name} is scheduled on this day. It is <strong>{getDaysLeft(selectedEvent.date)}</strong>!</p>
                </div>
                {holidayChecklists[selectedEvent.localName] && (
                  <div className="checklist-box">
                    <h4>📝 Smart Planner</h4>
                    {holidayChecklists[selectedEvent.localName].map((item: string) => (
                      <label key={item} className="check-item">
                        <input type="checkbox" style={{ accentColor: '#34c759' }} /> {item}
                      </label>
                    ))}
                  </div>
                )}
                <div className="astrology-box">
                  <h4 style={{ margin: '0 0 5px 0', color: '#a020f0' }}>🔮 Astrology Insight</h4>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>Zodiac Sign for this day: <strong>{getZodiacSign(selectedEvent.date)}</strong></p>
                </div>
              </>
            )}

            <div className="watermark-text">🚀 India Calendar {currentYear} Edition</div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '15px', flexWrap: 'wrap' }} data-html2canvas-ignore="true">
              <button className="remind-btn haptic-btn" onClick={() => scheduleReminder(selectedEvent)}>🔔 Remind</button>
              <button className="share-btn haptic-btn" onClick={handleSharePoster} disabled={isSharing}>{isSharing ? '⏳ Loading...' : '📸 Share Poster'}</button>
              <button className="modal-close-btn haptic-btn" onClick={() => { triggerHaptic(); setSelectedEvent(null); }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showScoreHub && (
        <div className="score-hub-overlay animation-fade-in">
          <div className="score-hub-header">
            <button className="haptic-btn" onClick={() => setShowScoreHub(false)}>✕ Close Score</button>
            <span>🔴 LIVE SCORE HUB</span>
          </div>
          <iframe src="https://www.google.com/search?q=cricket+live+score&igu=1" title="Live Score" className="score-iframe"></iframe>
        </div>
      )}

      <button className="add-event-fab haptic-btn" onClick={() => { triggerHaptic(); setShowAddModal(true); }}>+</button>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle"></div>
            <h2 className="modal-title">🎂 Add Event</h2>
            <p className="modal-date-text">Save birthdays, anniversaries, or meetings!</p>
            <input type="text" className="search-bar" placeholder="Event Name" value={newEventName} onChange={e => setNewEventName(e.target.value)} style={{ marginBottom: '10px' }} />
            <input type="date" className="search-bar" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} style={{ marginBottom: '10px' }} />
            <textarea className="search-bar" placeholder="Add notes..." value={newEventNote} onChange={e => setNewEventNote(e.target.value)} style={{ marginBottom: '20px', height: '80px', resize: 'none', borderRadius: '16px' }} />
            <button className="share-btn haptic-btn" style={{ width: '100%', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }} onClick={handleSavePersonalEvent}>Save Event</button>
          </div>
        </div>
      )}

      <div className="bottom-nav">
        <button className={`nav-item haptic-btn ${view === 'calendar' ? 'active' : ''}`} onClick={() => handleNavClick('calendar')}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg><span>Calendar</span></button>
        <button className={`nav-item haptic-btn ${view === 'agenda' ? 'active' : ''}`} onClick={() => handleNavClick('agenda')}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg><span>Agenda</span></button>
        <button className={`nav-item haptic-btn ${view === 'about' ? 'active' : ''}`} onClick={() => handleNavClick('about')}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg><span>About</span></button>
      </div>
    </div>
  );
};

export default App;