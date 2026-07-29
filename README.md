# Hamburg Park

Hamburg Park is a lightweight, mobile-first web app that identifies the official resident parking zone at the user's current location in Hamburg and compares it with a saved resident parking permit code.

**Live app:** https://emrctinkaya.github.io/hamburg-park/

## What it does

Hamburg Park combines device location with official Hamburg resident parking-zone data to answer two practical questions:

1. **Which resident parking zone am I currently in?**
2. **Does my saved permit code match that zone?**

The app visualizes official zone boundaries on an interactive map and can update the result while the app is active and the user's location changes.

> **Important:** A matching permit and zone does not automatically mean parking is allowed at a specific spot. Traffic signs, supplementary signs, temporary restrictions, construction zones, stopping restrictions, and other local rules always take precedence.

## Features

- Automatic GPS-based zone detection
- Live location updates while the app is active
- Adaptive onboarding: the large location card is shown when location access is needed and gets out of the way after location is available
- Compact live-location status after onboarding
- Interactive map with official Hamburg parking-zone boundaries
- Current-zone highlighting and GPS marker
- Resident parking permit comparison
- Permit-code suggestions based on official zone data
- Validation that prevents unknown zone codes from being saved
- Support for overlapping parking zones
- GPS accuracy display
- Map control to return to the current location
- Responsive mobile-first UI with dark-mode support
- Progressive Web App (PWA) support
- Saved language and permit preferences using browser storage
- German, English, and Turkish interface
- Localization of parking hours and parking-management descriptions returned by the Hamburg API
- Privacy-focused location processing in the browser

## Primary user flow

On first use, Hamburg Park presents a clear location onboarding card and asks the user to enable location access. Once a location result is available, that large introductory card is hidden so the current zone, permit comparison, and map become the visual priority.

If location access is unavailable or later denied, the onboarding/location action becomes available again. This keeps explanatory content useful when needed without permanently pushing the parking result down the screen.

The intended hierarchy is:

**location permission → current zone → permit comparison → map → supporting details**

## Languages

Hamburg Park supports:

- 🇩🇪 German — default
- 🇺🇸 English
- 🇹🇷 Turkish

The selected language is stored locally and restored on future visits.

Official identifiers such as `E301` and proper zone names remain unchanged. User-facing descriptive API values are localized when a reliable translation or formatting rule is available. Unknown values are intentionally preserved rather than translated by guessing.

## Data source

Parking-zone geometry and attributes are loaded from **Hamburg Open Data** through the official Hamburg API.

```text
https://api.hamburg.de/datasets/v1/bewohnerparkgebiete/collections/bewohnerparkgebiete/items?f=json&limit=1000
```

The app uses fields including:

- `bwp_code` — official zone code
- `bwp_name` — zone name
- `bewirtschaftungsart` — parking-management type
- `bewirtschaftungszeit` — applicable hours
- `hoechstparkdauer` — maximum parking duration
- `gebuehrenzone` — fee zone
- GeoJSON geometry — zone boundaries

The map is rendered with Leaflet and OpenStreetMap map tiles.

## How zone detection works

1. The browser requests permission to access the device location.
2. Hamburg Park receives latitude, longitude, and GPS accuracy from the browser Geolocation API.
3. Official parking-zone polygons are loaded from Hamburg Open Data.
4. The current coordinate is checked against the GeoJSON polygons in the browser.
5. Matching zones are displayed and highlighted on the map.
6. If a permit code is saved, it is compared with the matching official zone code(s).
7. While the app remains active, location changes can automatically update the result.

Location coordinates are used for zone calculation in the browser. Hamburg Park does not require an account or application backend for the lookup.

## Permit code selection

Users can enter a permit code such as `E301`. As they type, the app shows matching suggestions generated from the official Hamburg dataset.

Only a code present in the currently loaded official data can be saved. Selecting a new permit replaces the previously saved permit.

## Localization

Static UI text is maintained for German, English, and Turkish. API values pass through a display-localization layer before being shown to the user.

Common examples:

| German API value | English | Turkish |
| --- | --- | --- |
| `Täglich 9 - 22` | `Daily 9 AM–10 PM` | `Her gün 09:00–22:00` |
| `gebührenpflichtig` | `Paid parking` | `Ücretli park` |
| `mit Parkschein` | `Parking ticket required` | `Park bileti gerekli` |
| `Parkschein, Bewohner mit Ausweis frei` | `Parking ticket required; residents with permit exempt` | `Park bileti gerekli; izinli bölge sakinleri muaf` |
| `Bewohner mit Ausweis frei` | `Residents with permit exempt` | `İzinli bölge sakinleri muaf` |
| `keine Höchstparkdauer` | `No maximum parking time` | `Azami park süresi yok` |

The normalization also handles common wording variants such as `Bewohner frei` and `Bewohner mit Parkausweis frei`. Official codes and proper names are not translated.

If Hamburg introduces a descriptive value that the app does not recognize, the original official value is retained instead of inventing a translation.

## Tech stack

The project intentionally stays small and dependency-light:

- HTML5
- CSS
- Vanilla JavaScript
- Leaflet
- OpenStreetMap
- Browser Geolocation API
- Hamburg Open Data API / GeoJSON
- Service Worker + Web App Manifest for PWA support
- GitHub Pages for hosting

There is no application server, database, authentication system, or build framework required for the current web version.

## Run locally

```bash
git clone https://github.com/emrctinkaya/hamburg-park.git
cd hamburg-park
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Geolocation behavior depends on browser security rules. `localhost` is generally treated as a secure context for development; production deployment should use HTTPS.

## Deployment

The production web app is hosted with GitHub Pages:

```text
https://emrctinkaya.github.io/hamburg-park/
```

Changes committed to the branch configured for GitHub Pages are published through the repository's Pages deployment process.

Because Hamburg Park uses a Service Worker, cache versions should be updated when application assets or runtime behavior change significantly.

## PWA

Hamburg Park can be installed as a Progressive Web App on supported devices. The project includes a Web App Manifest, icon assets, and a Service Worker.

Mobile GPS behavior and background execution remain subject to browser and operating-system restrictions, particularly on iOS.

## Privacy

Hamburg Park is designed without user accounts or a custom application backend.

The app stores limited preferences in the browser, including:

- selected language
- saved resident parking permit code
- whether location access was previously used

GPS coordinates are used to determine the current parking zone in the browser. Hamburg Park itself does not need to send those coordinates to a custom server.

Third-party services such as map tile providers and the official Hamburg data API may receive normal network request information according to their own policies.

## Limitations

Hamburg Park is an informational aid, not an official parking authorization or legal determination.

A zone match cannot account for every rule affecting an individual parking space. Always check the signs at the actual location before parking.

Other limitations include:

- GPS accuracy varies by device and environment.
- Locations near a zone boundary can be ambiguous when GPS accuracy is poor.
- Official dataset structure, terminology, and values may change over time.
- Live location tracking works only while permitted by the browser and operating system.
- Map tiles require network access unless already available through browser caching.
- Translations describe official API values for usability; the German source value remains authoritative where legal interpretation matters.

## Project structure

The project is intentionally compact. Core application UI and logic currently live in `index.html`. PWA assets and the Service Worker live alongside it. Small compatibility layers are used for API-value localization and adaptive onboarding behavior.

As the project grows, localization, map logic, API normalization, onboarding behavior, and styles can be split into dedicated modules without changing the underlying architecture.

## Contributing

Issues and pull requests are welcome. When changing parking-data handling, translations, or zone logic, prefer official Hamburg sources and avoid assumptions about parking eligibility that are not represented by the source data.

For UI changes, keep the primary flow simple and prioritize the current parking result over introductory content once location access is available.

## Disclaimer

Hamburg Park is an independent project and is **not an official service of the Free and Hanseatic City of Hamburg**.

Official data remains the responsibility of its publisher. Local traffic signs and applicable regulations take precedence over information displayed by this app.
