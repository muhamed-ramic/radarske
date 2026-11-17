# 🚗 BIHAMK Radari - Srednjobosanski Kanton

Aplikacija izrađena u **React**-u pomoću **Vite**-a koja automatski preuzima (scrapes) najavljene i stacionarne radarske kontrole sa službene stranice [bihamk.ba/spi/radari](https://bihamk.ba/spi/radari) za **Srednjobosanski kanton (SBK)**, filtrira podatke za tražene gradove te implementira **inteligentni jednodnevni sistem keširanja**.

---

## 🎯 Glavne funkcionalnosti

1. **Scraping sa bihamk.ba/spi/radari**:
   - Analizira HTML strukturu i Livewire v3 mehanizam stranice BIHAMK.
   - Odabire kanton: **MUP Srednjobosanskog kantona** (opcija ID `93`, uz mogućnost odabira i ostalih kantona u BiH).
   - Preuzima raspored radarskih kontrola: satnice, lokacije, nazive dionica, magistralne puteve i policijske stanice.
   - Preuzima i stacionarne (stalne) radarske kamere (M-5, M-16, M-16.2, itd.).

2. **Ciljani gradovi**:
   - **Bugojno** (PS Bugojno, Čaušlije, Vrbanja, Poriče...)
   - **Gornji Vakuf** / Uskoplje (PS Gornji Vakuf, Trnovača, Raduša...)
   - **Donji Vakuf** (PS Donji Vakuf, Oborci, Torlakovac...)
   - **Travnik** (PS Travnik, Kalibunar, Nova Bila, Vitovlje, Vrelo, Turbe, Dolac...)
   - **Novi Travnik** (PS Novi Travnik, Nević Polje, Opara...)
   - **Vitez** (PS Vitez, Šantići, PC 96...)

3. **Jednodnevni keš sistem (Daily Cache)**:
   - **Scrape samo jednom dnevno**: Pri prvom dolasku na stranicu podaci se preuzimaju sa web stranice i spremaju u `localStorage` sa datumom današnjeg dana (`YYYY-MM-DD`).
   - **Keširanje tokom dana**: Svaki naredni dolazak ili osvježavanje stranice istog dana momentalno učitava podatke iz keša (nema nepotrebnog preuzimanja).
   - **Automatsko osvježavanje sutradan**: Čim nastupi novi dan i korisnik otvori stranicu, aplikacija detektuje da je datum keša zastario, automatski pokreće novi scrape za novi dan i ažurira keš.
   - **Dugme za testiranje "Simuliraj sutrašnji dan"**: Omogućava trenutan test — postavlja datum keša na jučerašnji, nakon čega aplikacija sama demonstrira detekciju novog dana i preuzimanje svježih podataka.
   - **Ručno osvježavanje**: Dugme "Osveži podatke" omogućava forsirano osvježavanje na zahtjev korisnika u bilo kom trenutku.

4. **Dodatne korisničke pogodnosti**:
   - Prikaz vremenskih intervala (npr. `08:45 - 09:45`).
   - Oznaka **● TRENUTNO AKTIVNO** za kontrole koje se odvijaju u trenutnom vremenu.
   - Dugmad za brzi pregled lokacije na Google Mapama.
   - Brojač aktivnih radara po svakom gradu.
   - **Cache Inspector**: Preglednik sirovog JSON keša iz `localStorage` sa mogućnošću kopiranja i pražnjenja keša.

---

## 🚀 Pokretanje aplikacije

### 1. Instalacija zavisnosti (već instalirano)
```bash
npm install
```

### 2. Pokretanje razvojnog servera (Vite Dev Server)
```bash
npm run dev
```

Aplikacija će se pokrenuti na:
```
http://localhost:5173
```

Otvorite navedeni URL u Vašem web pregledniku.

---

## 🛠️ Struktura koda

```
radarske/
├── index.html                           # Glavna HTML stranica
├── package.json                         # Zavisnosti i skripte
├── tsconfig.json                        # TypeScript konfiguracija
├── vite.config.ts                       # Vite konfiguracija sa scraper pluginom
├── src/
│   ├── main.tsx                         # React ulazna tačka
│   ├── App.tsx                          # Glavna komponenta i upravljanje stanjem
│   ├── index.css                        # Moderni stilovi inspirisani BIHAMK dizajnom
│   ├── vite-env.d.ts                    # Vite tipovi
│   ├── data/
│   │   └── fallbackData.ts              # TypeScript tipovi, gradovi i kantoni (bez izmišljenih podataka)
│   ├── services/
│   │   └── radarService.ts              # Upravljanje dnevnim kešom (localStorage) i API
│   ├── server/
│   │   ├── bihamkScraper.js             # Cheerio scraping logika za bihamk.ba/spi/radari
│   │   └── vitePluginBihamk.js          # Vite server middleware za /api/scrape
│   └── components/
│       ├── Header.tsx                   # Zaglavlje sa statusom i datumom
│       ├── CacheBanner.tsx              # Prikaz statusa dnevnog keša i akcija
│       ├── CantonAndCitySelector.tsx    # Odabir kantona i filteri za gradove
│       ├── AnnouncedRadarList.tsx       # Lista najavljenih radarskih kontrola
│       ├── StationaryRadarList.tsx      # Lista fiksnih stacionarnih kamera
│       └── CacheInspectorModal.tsx      # Modal za inspekciju i testiranje keša
```

---

## 🧪 Kako testirati mehanizam keširanja

1. Otvorite aplikaciju u pregledniku (`http://localhost:5173`).
2. U gornjem banneru vidjet ćete poruku:
   `Status: 🟢 Aktivan za danas` i obavijest da su podaci spremljeni u keš.
3. Osvježite stranicu (F5):
   Vidjet ćete obavijest:
   `📦 Podaci su uspješno učitani iz lokalnog keša za danas. Nije bilo potrebe za novim mrežnim scrapeom.`
4. Kliknite na dugme **"Simuliraj sutrašnji dan"**:
   Aplikacija će promijeniti datum keša na jučerašnji, odmah detektovati dolazak novog dana, automatski pokrenuti novo preuzimanje i ažurirati keš sa današnjim datumom!
5. Klikom na dugme **"Keš podaci"** možete vidjeti kompletan JSON sadržaj spremljen u `localStorage` pod ključem `bihamk_radari_daily_cache_v1`.
