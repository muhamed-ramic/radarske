export interface RadarEntry {
  timeFrom: string;
  timeTo: string;
  location: string;
  fullText: string;
}

export interface AnnouncedRadar {
  id: number;
  title: string;
  station: string;
  city: string;
  entries: RadarEntry[];
  rawLines?: string[];
}

export interface StationaryRadar {
  id: number;
  title: string;
  road: string;
  city: string;
  locationDescription?: string;
  speedLimit?: number;
}

export interface Canton {
  id: string;
  name: string;
}

export interface ScrapedRadarResponse {
  date: string;
  scrapedAt: string;
  canton: Canton;
  availableCantons: Canton[];
  targetCities: string[];
  announcedRadars: AnnouncedRadar[];
  stationaryRadars: StationaryRadar[];
  isFallback?: boolean;
}

export const TARGET_CITIES = [
  'Bugojno',
  'Gornji Vakuf',
  'Donji Vakuf',
  'Travnik',
  'Novi Travnik',
  'Vitez'
] as const;

export const DEFAULT_CANTONS: Canton[] = [
  { id: '93', name: 'MUP Srednjobosanskog kantona' },
  { id: '47', name: 'MUP Kantona Sarajevo' },
  { id: '46', name: 'MUP Zeničko-dobojskog kantona' },
  { id: '84', name: 'MUP Tuzlanskog kantona' },
  { id: '83', name: 'MUP Unsko-sanskog kantona' },
  { id: '113', name: 'MUP Hercegovačko-neretvanskog kantona' },
  { id: '110', name: 'MUP Kantona 10 (Livno)' },
  { id: '112', name: 'MUP Bosansko-podrinjskog kantona' },
  { id: '117', name: 'MUP Posavski' },
  { id: '105', name: 'MUP Zapadno-hercegovačkog kantona' },
  { id: '118', name: 'Policija Brčko distrikta' }
];

export function generateDailyFallbackData(dateStr?: string): ScrapedRadarResponse {
  const today = dateStr || new Date().toISOString().split('T')[0];
  const dateFormatted = new Date().toLocaleDateString('bs-BA', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });

  return {
    date: today,
    scrapedAt: new Date().toISOString(),
    canton: {
      id: '93',
      name: 'MUP Srednjobosanskog kantona'
    },
    availableCantons: DEFAULT_CANTONS,
    targetCities: [...TARGET_CITIES],
    announcedRadars: [
      {
        id: 415,
        title: `Najavljene radarske kontrole za ${dateFormatted}`,
        station: 'PS Travnik',
        city: 'Travnik',
        entries: []
      },
      {
        id: 416,
        title: `Najavljene radarske kontrole za ${dateFormatted}`,
        station: 'PS Donji Vakuf',
        city: 'Donji Vakuf',
        entries: []
      },
      {
        id: 420,
        title: `Najavljene radarske kontrole za ${dateFormatted}`,
        station: 'PS Bugojno',
        city: 'Bugojno',
        entries: []
      },
      {
        id: 421,
        title: `Najavljene radarske kontrole za ${dateFormatted}`,
        station: 'PS Gornji Vakuf - Uskoplje',
        city: 'Gornji Vakuf',
        entries: []
      },
      {
        id: 422,
        title: `Najavljene radarske kontrole za ${dateFormatted}`,
        station: 'PS Novi Travnik',
        city: 'Novi Travnik',
        entries: []
      },
      {
        id: 423,
        title: `Najavljene radarske kontrole za ${dateFormatted}`,
        station: 'PS Vitez',
        city: 'Vitez',
        entries: []
      }
    ],
    stationaryRadars: [
      { id: 135, title: 'MUP SBK - M-5 Kalibunar', road: 'M-5', city: 'Travnik', locationDescription: 'Kalibunar (kod restorana)', speedLimit: 50 },
      { id: 136, title: 'MUP SBK - M-5 Nova Bila', road: 'M-5', city: 'Travnik', locationDescription: 'Nova Bila (u blizini bolnice)', speedLimit: 60 },
      { id: 137, title: 'MUP SBK - M-5 Šantići', road: 'M-5', city: 'Vitez', locationDescription: 'Šantići (raskrsnica)', speedLimit: 60 },
      { id: 138, title: 'MUP SBK - M-5 PC 96', road: 'M-5', city: 'Vitez', locationDescription: 'Poslovni centar 96 Vitez', speedLimit: 60 },
      { id: 139, title: 'MUP SBK - M-16.4 Nević Polje', road: 'M-16.4', city: 'Novi Travnik', locationDescription: 'Nević Polje (pravac prema Rostovu)', speedLimit: 60 },
      { id: 140, title: 'MUP SBK - M-16.2 Trnovača', road: 'M-16.2', city: 'Gornji Vakuf', locationDescription: 'Trnovača (izlaz prema Bugojnu)', speedLimit: 60 },
      { id: 1243, title: 'MUP SBK - M-16 Čaušlije', road: 'M-16', city: 'Bugojno', locationDescription: 'Čaušlije (raskrsnica za Kupres i Donji Vakuf)', speedLimit: 60 },
      { id: 1244, title: 'MUP SBK - M-16.2 Vrbanja', road: 'M-16.2', city: 'Bugojno', locationDescription: 'Vrbanja (kod benzinske pumpe)', speedLimit: 60 },
      { id: 1586, title: 'MUP SBK - M-5 Oborci', road: 'M-5', city: 'Donji Vakuf', locationDescription: 'Oborci (ulaz u naselje)', speedLimit: 50 },
      { id: 2135, title: 'MUP SBK - M-16 Torlakovac', road: 'M-16', city: 'Donji Vakuf', locationDescription: 'Torlakovac (most na Vrbasu)', speedLimit: 60 }
    ],
    isFallback: true
  };
}
