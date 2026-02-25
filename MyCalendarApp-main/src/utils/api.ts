// src/utils/api.ts

// Ye batata hai ki API se aane wala data kaisa dikhega
export interface Holiday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
}

// Ye function Nager API se data mangwata hai
export const fetchHolidays = async (year: number, countryCode: string): Promise<Holiday[]> => {
  try {
    // API link jisme saal aur desh ka code (jaise 'IN' ya 'US') jayega
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
    
    if (!response.ok) {
      throw new Error('Data lane mein problem hui');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Holidays fetch error:", error);
    return []; // Agar koi error aaye toh khali list return karega
  }
};
