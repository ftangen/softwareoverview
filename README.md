# SoftwareOversikt

Intern webapplikasjon for å holde oversikt over installert programvare på kundeprosjekter. Søk på prosjektnummer og få full oversikt over hva som er installert, lisenstype, end of support og end of life — med automatiske varsler når noe nærmer seg utløp.

Kjøres lokalt i et isolert lab-miljø uten internett.

---

## Funksjoner

- **Dashboard** med statuskort og varsel-liste over programvare som utløper innen 180 dager
- **Prosjektoversikt** med søk på prosjektnummer, navn og kunde
- **Prosjektdetalj** med full installasjonsliste, status-badge per rad og rediger/slett
- **Programvarekatalog** med omvendt søk — se hvilke prosjekter som kjører en gitt programvare
- Autocomplete fra katalog ved innlegging, eller fritekst for ny programvare
- Fargekodet statusbadge: Utløpt (rød) / Kritisk under 90 dager (oransje) / Advarsel under 180 dager (gul) / OK (grønn)

---

## Teknologi

| Lag | Teknologi |
|-----|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL 15 |
| Deploy | Docker Compose |

---

## Kom i gang

### Krav
- Docker og Docker Compose installert på maskinen

### Start

```bash
docker compose up --build
```

Åpne [http://localhost](http://localhost) i nettleseren.

Første oppstart laster ned Docker-images og bygger applikasjonen — dette tar litt tid. Påfølgende oppstarter er vesentlig raskere.

### Stopp

```bash
docker compose down
```

Data i databasen beholdes i et Docker-volum (`pgdata`) og er der neste gang du starter opp.

For å slette all data:

```bash
docker compose down -v
```

---

## Utvikling lokalt (uten Docker)

### Krav
- Node.js 20+
- PostgreSQL kjørende lokalt

### Backend

```bash
cd backend
npm install
# Kopier og tilpass miljøvariabler
cp .env.example .env
# Sync databaseskjema
npx prisma db push
# Start dev-server
npm run dev
```

Backend kjører på [http://localhost:3000](http://localhost:3000).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend kjører på [http://localhost:5173](http://localhost:5173) og proxier API-kall til backend automatisk.

### Miljøvariabler (backend)

Opprett `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/softwareoverview
PORT=3000
```

---

## Datamodell

```
Project
├── projectNumber  (unik ID, f.eks. P-1234)
├── projectName
├── customer
└── installations[]
    ├── softwareName
    ├── version
    ├── licenseType  (COMMERCIAL | OPEN_SOURCE | NONE)
    ├── endOfSupport  (dato)
    └── endOfLife     (dato)

SoftwareCatalog
├── name  (unik)
├── vendor
└── installations[]  (referanser til alle installasjoner av denne programvaren)
```

---

## Prosjektstruktur

```
/
├── backend/
│   ├── prisma/schema.prisma     # Databaseskjema
│   ├── src/
│   │   ├── index.ts             # Express-app og ruter
│   │   ├── db.ts                # Prisma-klient
│   │   └── routes/
│   │       ├── projects.ts
│   │       ├── software.ts
│   │       ├── installations.ts
│   │       └── dashboard.ts
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/               # Dashboard, Projects, ProjectDetail, SoftwareCatalog
│   │   ├── components/          # Layout, StatusBadge, InstallationForm, ProjectForm
│   │   └── lib/                 # API-klient og utils
│   └── Dockerfile
└── docker-compose.yml
```

---

## API-endepunkter

| Metode | Endepunkt | Beskrivelse |
|--------|-----------|-------------|
| GET | `/api/projects` | Liste prosjekter (støtter `?search=`) |
| GET | `/api/projects/:id` | Prosjekt med installasjoner |
| POST | `/api/projects` | Opprett prosjekt |
| PUT | `/api/projects/:id` | Oppdater prosjekt |
| DELETE | `/api/projects/:id` | Slett prosjekt |
| GET | `/api/software` | Liste programvarekatalog (støtter `?search=`) |
| GET | `/api/software/:id/projects` | Prosjekter som bruker denne programvaren |
| POST | `/api/software` | Legg til i katalog |
| POST | `/api/installations` | Legg til installasjon på prosjekt |
| PUT | `/api/installations/:id` | Oppdater installasjon |
| DELETE | `/api/installations/:id` | Slett installasjon |
| GET | `/api/dashboard/alerts` | Installasjoner som nærmer seg utløp |
| GET | `/api/dashboard/stats` | Oppsummerte tall til dashboard |
