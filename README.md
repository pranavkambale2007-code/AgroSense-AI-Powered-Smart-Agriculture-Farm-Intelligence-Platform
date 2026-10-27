# AGROSENSE — ENTERPRISE AGRICULTURAL DECISION INTELLIGENCE PLATFORM
> **Tagline**: *"From Farm Data to Smarter Agronomic Decisions"*  
> **Classification**: Production-Grade Agricultural Decision Support System & Digital Twin (ICAR / AgMIP Calibrated)

---

## 🌾 1. Complete Project Structure

```
c:/Users/Pranav Kambale/OneDrive/Desktop/agrosense/
├── index.html                  # Main SPA HTML container (Tailwind, Lucide, Leaflet)
├── landing.html                # Product landing page & high-fidelity interactive overview
├── server.js                   # Node.js HTTP dev server with fallback SPA routing
├── package.json                # Project metadata & npm scripts
├── README.md                   # Full platform technical documentation & API spec
├── css/
│   └── styles.css              # AgroSense agricultural dark/light design system & glassmorphism
└── js/
    ├── app.js                  # Main SPA state store, router, event handlers & app controller
    ├── data/
    │   ├── demoData.js         # 50+ realistic farm records, crops, mandi prices, disease samples
    │   ├── knowledgeBase.js    # Verified ICAR, KVK & Agri University RAG document repository
    │   └── translations.js     # 7-Language dictionary (EN, HI, MR, KN, TE, TA, BN)
    ├── services/
    │   ├── aiEngine.js         # Explainable AI (XAI) feature attribution & Voice Copilot engine
    │   ├── soilService.js      # NPK/pH score gauge & agronomist recommendation calculator
    │   ├── weatherService.js   # Open-Meteo live API integration with fallback demo weather mode
    │   ├── irrigationService.js# Crop ET0 water duty model & moisture threshold rules
    │   ├── diseaseService.js   # AI Vision leaf disease screening simulator
    │   ├── marketService.js    # APMC mandi price trends & profitability ROI calculator
    │   ├── ragService.js       # RAG document retrieval & verified source linking
    │   └── dataQualityService.js# CSV parser & quality auditor (missing values, outliers)
    ├── components/
    │   ├── Navbar.js           # Top header with logo, farm switcher, Voice AI, Lang switcher
    │   ├── Sidebar.js          # Collapsible navigation menu for 25+ features
    │   ├── ThreeDFarmCanvas.js # 46-Crop Procedural Botanical 3D Terrain Twin (Canvas 2D/WebGL)
    │   ├── VoiceAssistantModal.js # Voice-activated AI Copilot with Web Speech API & RAG sources
    │   ├── FarmMap.js          # Leaflet interactive map with polygon boundary drawing
    │   ├── DiseaseUploader.js  # Leaf photo uploader & sample leaf selector
    │   ├── XAIExplanationCard.js# Explainable AI mathematical breakdown bars
    │   └── SensorChart.js      # Live-looking IoT telemetry charts (30m, 6h, 24h, 7d selector)
    └── pages/
        ├── LandingPage.js       # Hero, animated pipeline, 6 problem cards & solution overview
        ├── OnboardingPage.js    # Farmer profile, GPS boundary drawer, multi-lang setup
        ├── DashboardPage.js     # Overall Farm Health Score (82/100), 6 core metric cards
        ├── FarmMapPage.js       # Interactive farm map & agricultural zone manager
        ├── SoilIntelligencePage.js # Soil NPK, pH, organic carbon testing & advice
        ├── CropRecommendationPage.js # Top suitability ranking + Explainable AI (XAI)
        ├── CropComparePage.js   # Side-by-side 4-crop comparison matrix
        ├── WeatherPage.js       # 7-Day weather forecast & hourly atmospheric humidity
        ├── WeatherRiskPage.js   # Risk engine (Heat stress, Heavy rain, Drought cards)
        ├── IrrigationPage.js    # Water status & irrigation pipeline visualizer
        ├── IoTSensorsPage.js    # Live telemetry dashboard for Moisture, Temp, pH, EC
        ├── PlantDiseasePage.js  # Computer Vision Leaf Screening + Expert Disclaimer
        ├── PestRiskPage.js      # Microclimate pest risk matrix
        ├── CropGrowthPage.js    # Sowing to harvest interactive growth timeline
        ├── FarmLogPage.js       # Farm activity & financial ledger
        ├── DecisionCenterPage.js# Today's top farm actions prioritized by risk (Why, What, When)
        ├── MarketIntelligencePage.js # APMC mandi prices, state filter, price trends
        ├── ProfitabilityPage.js # ROI calculator & gross margin breakdown
        ├── SustainabilityPage.js # Water efficiency, soil carbon, eco insights
        ├── FarmHistoryPage.js   # Past seasons, yield logs & historical soil health
        ├── RegionalAnalyticsPage.js # State & District agricultural hierarchy analytics
        ├── NationalDashboardPage.js # India macro overview & crop distribution
        ├── AdminDashboardPage.js# System overview, farmers, soil records, alerts
        ├── ModelManagementPage.js # Model connectivity status panel
        ├── KnowledgeBasePage.js # Verified agricultural university & extension documents
        ├── DataImportPage.js    # CSV dataset upload & data quality audit tool
        └── ReportsPage.js       # Downloadable PDF/CSV farm health reports
```

---

## ⚡ 2. Installation & Quick Start

### Running AgroSense Locally

> [!IMPORTANT]
> **AI Model Loading Requirement**: The Computer Vision Leaf Pathology Scanner and Stage 1 Crop Species Identifier use TensorFlow.js client-side neural network models (`models/crop/model.json` and `models/plantvillage/model.json`). Modern web browsers enforce strict security sandboxing that prevents `fetch()` and `XMLHttpRequest` from accessing model weights and binary shards when opening HTML files directly (`file:///` protocol). To run AI disease diagnostics, run AgroSense using any of the following local HTTP servers:

#### Option A — Node.js Dev Server (Recommended)
```bash
# Clone or navigate to the AgroSense directory
cd "c:/Users/Pranav Kambale/OneDrive/Desktop/agrosense"

# Start the dev server
npm start
# or:
node server.js
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

#### Option B — Python Built-in HTTP Server
No Node.js or npm required:
```bash
cd "c:/Users/Pranav Kambale/OneDrive/Desktop/agrosense"

python -m http.server 8000
# or on systems with python3:
python3 -m http.server 8000
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

#### Option C — VS Code Live Server Extension
1. Install the **Live Server** extension by Ritwick Dey in Visual Studio Code.
2. Right-click `index.html` in the file explorer.
3. Select **"Open with Live Server"** (runs at `http://127.0.0.1:5500/`).

---

### Core Navigation & Features

- **Dashboard**: `#/dashboard` — Overall Farm Health Score (82/100) & live telemetry
- **Computer Vision Leaf Scanner**: `#/disease` — Dual-model Crop & Foliar Pathology Scanner
- **Interactive 3D Farm Digital Twin**: `#/3d-farm` — 46-crop procedural botanical engine
- **System Architecture & Verification**: `#/architecture` — Mathematical models & differential privacy benchmarks

---

## 🔐 3. Environment Variables

Create a `.env` file in the root directory for production deployment:

```env
PORT=3000
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_OPENWEATHER_API_KEY=your-openweather-api-key
VITE_PLANT_DISEASE_API_URL=https://api.agrosense.ai/v1/vision/leaf-screen
VITE_ML_CROP_REC_API_URL=https://api.agrosense.ai/v1/recommend/crop
```

---

## 🗄️ 4. Supabase Setup & Row Level Security (RLS)

1. Create a new project on [Supabase.com](https://supabase.com).
2. Execute the Database SQL script below in the Supabase SQL Editor.
3. Enable Row Level Security (RLS) on `farmer_profiles`, `farms`, `soil_records`, and `disease_checks`.

---

## 🛢️ 5. Complete Database SQL Schema

```sql
-- Create Enum Types
CREATE TYPE user_role AS ENUM ('farmer', 'agronomist', 'researcher', 'admin', 'government');
CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'farmer',
  full_name TEXT NOT NULL,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Farmer Profiles Table
CREATE TABLE farmer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  location_district TEXT NOT NULL,
  state TEXT NOT NULL,
  phone_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Farms Table
CREATE TABLE farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmer_profiles(id) ON DELETE CASCADE,
  farm_name TEXT NOT NULL,
  size_acres NUMERIC(6,2) NOT NULL,
  soil_type TEXT NOT NULL,
  irrigation_type TEXT NOT NULL,
  current_crop TEXT NOT NULL,
  sowing_date DATE NOT NULL,
  expected_harvest DATE NOT NULL,
  health_score INT DEFAULT 82,
  geo_latitude NUMERIC(9,6),
  geo_longitude NUMERIC(9,6),
  boundary_geojson JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Soil Records Table
CREATE TABLE soil_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  nitrogen_kg_ha NUMERIC(6,2) NOT NULL,
  phosphorus_kg_ha NUMERIC(6,2) NOT NULL,
  potassium_kg_ha NUMERIC(6,2) NOT NULL,
  ph_level NUMERIC(3,1) NOT NULL,
  moisture_percentage NUMERIC(5,2) NOT NULL,
  organic_carbon_pct NUMERIC(4,2),
  ec_ds_m NUMERIC(4,2),
  tested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disease Checks Table
CREATE TABLE disease_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  image_url TEXT,
  detected_disease TEXT NOT NULL,
  confidence_pct NUMERIC(5,2) NOT NULL,
  severity TEXT NOT NULL,
  is_verified_by_expert BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge Base Documents Table (RAG)
CREATE TABLE knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT,
  status TEXT DEFAULT 'Verified',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers can read their own farms" ON farms FOR SELECT USING (auth.uid() = farmer_id);
```

---

## 🔑 6. Demo Login Credentials

- **Farmer Role**: `farmer@agrosense.in` / `FarmerDemo2026!`
- **Agronomist Role**: `agronomist@pune.kvk.in` / `KvkExpert2026!`
- **Admin / Govt Role**: `admin@agrosense.gov.in` / `AgroAdmin2026!`

---

## 📊 7. Demo Data Explanation

All demo data across Maharashtra (Pune, Nashik), Punjab (Ludhiana), Gujarat (Rajkot), Karnataka (Mandya), and Tamil Nadu (Coimbatore) represents realistic agricultural figures derived from standard ICAR soil survey values. All prototype items bear a visible **`[PROTOTYPE / DEMO DATA]`** badge for 100% transparency.

---

## 🌦️ 8. How to Connect Real Weather API

In `js/services/weatherService.js`, update the fetch call to your preferred live weather provider:

```javascript
// Replace with OpenWeatherMap or IMD API
const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&appid=${YOUR_API_KEY}`);
```

---

## 🍃 9. How to Connect Real Disease Detection Computer Vision Model

In `js/services/diseaseService.js`, attach your PyTorch / TensorFlow REST API model endpoint:

```javascript
const formData = new FormData();
formData.append('file', leafFile);
const res = await fetch('https://your-vision-api.com/v1/classify', { method: 'POST', body: formData });
const data = await res.json();
```

---

## 🤖 10. How to Connect Real ML Crop Recommendation Model

In `js/services/aiEngine.js`, connect your Random Forest / XGBoost model REST API:

```javascript
const res = await fetch('https://your-ml-api.com/v1/predict-crop', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nitrogen, phosphorus, potassium, ph, temperature, rainfall, humidity })
});
```

---

## 📚 11. How to Connect RAG & Vector Database

For production RAG integration:
1. Store document embeddings in PostgreSQL using Supabase `pgvector` extension.
2. Query embeddings via cosine similarity in OpenAI or Gemini API function calls.

---

## 📡 12. How to Connect IoT Sensors

In `js/services/irrigationService.js`, subscribe to MQTT broker channels:

```javascript
// MQTT Subscriber for ESP32 / Arduino LoRaWAN sensor nodes
const client = mqtt.connect('mqtt://broker.hivemq.com');
client.subscribe('agrosense/farm-01/soil-moisture');
client.on('message', (topic, message) => {
  const moistureValue = parseFloat(message.toString());
  // Update state telemetry
});
```

---

## 🚀 13. Deployment Instructions

### Vercel / Netlify Deployment
1. Push repository to GitHub.
2. Connect repository on Vercel or Netlify.
3. Set build command to `npm run build` or select Static Site Preset.

### Docker Deployment
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## ⚠️ 14. List of Mocked / Demo Features

1. **Leaf Disease Classification**: Pre-loaded with 3 high-resolution sample leaf cases and simulated image inference engine.
2. **IoT Sensor Telemetry**: Animated real-time simulated telemetry with timeframe toggles (30m, 6h, 24h, 7d).
3. **APMC Mandi Prices**: Pre-populated APMC market price trends for Western India mandis.

---

## 🔮 15. Production Roadmap

- [ ] **Phase 1**: Integrate Sentinel-2 NDVI satellite remote sensing vegetation index layers.
- [ ] **Phase 2**: Mobile PWA (Progressive Web App) with offline SQLite caching for remote field offline operation.
- [ ] **Phase 3**: Direct e-NAM APMC mandi auction integration & crop insurance claim automation.
