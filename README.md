# Hamburg Park

Hamburg Park is a lightweight, mobile-first web app that helps users identify the official resident parking zone at their current location in Hamburg and compare it with their saved resident parking permit code.

**Live app:** https://emrctinkaya.github.io/hamburg-park/

## What it does

Hamburg Park combines the user's device location with official Hamburg resident parking zone data. It is designed to answer two practical questions quickly:

1. **Which resident parking zone am I currently in?**
2. **Does my saved permit code match that zone?**

The app also visualizes official zone boundaries on an interactive map and updates the result while the app is active and the user's location changes.

> **Important:** A matching permit and zone does not automatically mean parking is allowed at a specific spot. Traffic signs, supplementary signs, temporary restrictions, construction zones, stopping restrictions, and other local rules always take precedence.

## Features

- Automatic GPS-based zone detection
- Live location updates while the app is active
- Interactive map with official Hamburg parking-zone boundaries
- Current zone highlighting and GPS marker
- Resident parking permit comparison
- Permit-code suggestions based on official zone data
- Validation that prevents unknown zone codes from being saved
- Support for overlapping parking zones
- GPS accuracy display
- Map control to return to the current location
- Responsive, mobile-first UI with dark-mode support
- Progressive Web App (PWA) support
- Saved language and permit preferences using local browser storage
- German, English, and Turkish interface
- Localization of displayed API values such as parking hours and parking-management descriptions
- Privacy-focused location processing in the browser

## Languages

Hamburg Park supports:

- 🇩🇪 German — default
- 🇺🇸 English
- 🇹🇷 Turkish

The selected language is saved locally and restored on future visits.

Official identifiers such as `E301` remain unchanged. User-facing API values are localized where a reliable translation or formatting rule is available. Unknown values are intentionally shown as provided by the official source rather than guessed.

## Data source

Parking-zone geometry and related attributes are loaded from **Hamburg Open Data** through the official Hamburg API.

Dataset endpoint used by the app:

```text
https://api.hamburg.de/datasets/v1/bewohnerparkgebiete/collections/bewohnerparkgebiete/items?f=json&limit=1000
```

The app currently uses fields including:

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

Location coordinates are used for the zone calculation in the browser. Hamburg Park does not require an account or its own backend to perform the lookup.

## Permit code selection

Users can enter a permit code such as `E301`. As they type, the app shows matching suggestions generated from the official Hamburg dataset.

Only a code present in the currently loaded official data can be saved. Selecting a new permit simply replaces the previously saved permit.

## Localization

Static UI text is maintained separately for German, English, and Turkish.

API values are passed through a display-localization layer. This handles common values and time expressions, for example:

| German source | English | Turkish |
| --- | --- | --- |
| `Täglich 9 - 22` | `Daily 9 AM–10 PM` | `Her gün 09:00–22:00` |
| `gebührenpflichtig` | `Paid parking` | `Ücretli park` |
| `mit Parkschein` | `Parking ticket required` | `Park bileti gerekli` |
| `keine Höchstparkdauer` | `No maximum parking time` | `Azami park süresi yok` |

Official zone codes and proper names are not translated.

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

Clone the repository:

```bash
git clone https://github.com/emrctinkaya/hamburg-park.git
cd hamburg-park
```

Serve the directory with a local HTTP server. For example, with Python:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Geolocation behavior depends on browser security rules. `localhost` is generally treated as a secure context for development; production deployment should use HTTPS.

## Deployment

The production web app is hosted with GitHub Pages from this repository.

Changes merged or committed to the branch configured for GitHub Pages are published through the repository's Pages deployment process.

Production:

```text
https://emrctinkaya.github.io/hamburg-park/
```

Because Hamburg Park includes a Service Worker, an older cached version can occasionally remain visible briefly after a deployment. The Service Worker cache version should be updated when cache behavior or application assets change significantly.

## PWA

Hamburg Park can be used as a Progressive Web App on supported devices. The repository includes a Web App Manifest, application icon assets, and a Service Worker.

On mobile devices, users can add the app to their home screen for a more app-like experience. GPS behavior and background execution remain subject to browser and operating-system restrictions, particularly on iOS.

## Privacy

Hamburg Park is designed without user accounts or an application backend.

The app stores limited preferences in the browser, such as:

- selected language
- saved resident parking permit code
- whether location access was previously used

GPS coordinates are used to determine the current parking zone in the browser. The project itself does not need to send the user's coordinates to a custom Hamburg Park server.

Third-party services used by the app, such as map tile providers and the official Hamburg data API, may receive normal network request information according to their own policies.

## Limitations

Hamburg Park is an informational aid, not an official parking authorization or legal determination.

A zone match cannot account for every rule affecting an individual parking space. Always check the signs at the actual location before parking.

Other limitations include:

- GPS accuracy varies by device and environment.
- A location near a zone boundary may be ambiguous when GPS accuracy is poor.
- Official dataset structure or values may change over time.
- Live location tracking works only while permitted by the browser and operating system.
- Map tiles require network access unless already available through browser caching.

## Project structure

The project is intentionally compact. Core application UI and logic currently live in `index.html`, while PWA-related assets such as the manifest, icons, and Service Worker are stored alongside it.

As the project grows, localization, map logic, API normalization, and styles can be split into dedicated modules without changing the underlying architecture.

## Contributing

Issues and pull requests are welcome. When changing parking-data handling, translations, or zone logic, prefer official Hamburg sources and avoid assumptions about parking eligibility that are not represented by the source data.

For UI changes, keep the primary user flow simple:

**current location → current zone → permit comparison → map → supporting details**

## Disclaimer

Hamburg Park is an independent project and is **not an official service of the Free and Hanseatic City of Hamburg**.

Official data remains the responsibility of its respective publisher. Local traffic signs and applicable regulations take precedence over information displayed by this app.
