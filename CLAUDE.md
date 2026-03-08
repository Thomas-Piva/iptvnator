# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IPTVnator is a cross-platform IPTV player application built with Angular and Electron, supporting M3U/M3U8 playlists, Xtream Codes API, and Stalker portals.

**Multi-Environment Support**: The application runs in three environments:
- **Electron** — Full-featured desktop app with local SQLite database and external player support
- **PWA** — Lightweight web version running in any browser
- **Fire TV / Android TV** — PWA wrapped in a Capacitor Android WebView, optimized for D-pad navigation and 10-foot UI

The architecture uses a factory pattern to inject environment-specific services at runtime, ensuring the same codebase works in all contexts.

## Development Commands

### Building and Serving

```bash
# Serve the Angular web app only (development mode, baseHref="/")
pnpm run serve:frontend
# or
nx serve web

# Serve with PWA configuration (optimized, baseHref="/")
pnpm run serve:frontend:pwa
# or
nx serve web --configuration=pwa

# Serve the Electron app (starts both frontend and backend)
pnpm run serve:backend
# or
nx serve electron-backend

# Build frontend for Electron (baseHref="./")
pnpm run build:frontend
# or
nx build web

# Build frontend for PWA deployment (baseHref="/")
pnpm run build:frontend:pwa
# or
nx build web --configuration=pwa

# Build backend (Electron)
pnpm run build:backend
# or
nx build electron-backend

# Package the app (creates distributable without installers)
pnpm run package:app
# or
nx run electron-backend:package

# Create installers/executables
pnpm run make:app
# or
nx run electron-backend:make
```

### Fire TV / Android TV Build

```bash
# Full pipeline (build PWA → sync → APK)
.\scripts\build-firetv.ps1

# Or manual steps:
# 1. Build the PWA
npx nx build web --configuration=pwa

# 2. Sync web assets to Capacitor Android
npx cap sync android

# 3. Build debug APK
cd android
.\gradlew.bat assembleDebug

# APK output: android/app/build/outputs/apk/debug/app-debug.apk
```

**Prerequisites**: Android SDK (`ANDROID_HOME=C:\Android\sdk`), Java 17+

### Testing

```bash
# Run frontend tests
pnpm run test:frontend
# or
nx test web

# Run backend tests
pnpm run test:backend
# or
nx test electron-backend

# Run e2e tests (Playwright)
nx e2e web-e2e

# Run tests with coverage
nx test web --configuration=ci
```

### Linting

```bash
# Lint frontend
nx lint web

# Lint backend
nx lint electron-backend
```

## Architecture

### Monorepo Structure (Nx Workspace)

This is an Nx monorepo with the following structure:

- **apps/web** - Angular application (frontend)
- **apps/electron-backend** - Electron main process
- **apps/web-e2e** - Playwright end-to-end tests
- **android/** - Capacitor Android project (Fire TV / Android TV wrapper)
- **libs/** - Shared libraries:
    - **m3u-state** - NgRx state management for playlists
    - **services** - Abstract DataService and implementations
    - **shared/interfaces** - TypeScript interfaces and types
    - **shared/m3u-utils** - M3U playlist utilities
    - **ui/components** - Reusable UI components
    - **ui/pipes** - Angular pipes
    - **ui/shared-portals** - Portal-related UI components
- **scripts/** - Build scripts:
    - **build-firetv.ps1** - Full Fire TV APK build pipeline

### Frontend Architecture (Angular)

**State Management**: Uses NgRx for playlist state management:

- Store configuration in `apps/web/src/app/app.config.ts`
- Playlist state, actions, effects, and reducers in `libs/m3u-state/`
- Entity adapter pattern for managing playlists collection
- Router store integration for route-based state

**XtreamStore Architecture** (Signal Store with Feature Composition):

The Xtream Codes module uses NgRx Signal Store with a layered architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│              Components use XtreamStore (facade)                 │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         FACADE LAYER                             │
│                         XtreamStore                              │
│            (Composes feature stores, unified API)                │
└─────────────────────────────────────────────────────────────────┘
                                  │
        ┌────────────┬────────────┼────────────┬────────────┐
        ▼            ▼            ▼            ▼            ▼
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│  withPortal│ │withContent │ │withSelection│ │ withSearch │ │ withPlayer │
└────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘
        │                           │              │
        └───────────────────────────┼──────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA SOURCE LAYER                             │
│                   IXtreamDataSource                              │
│         ┌───────────────────┬───────────────────┐               │
│         ▼                   ▼                                    │
│  ElectronDataSource    PwaDataSource                            │
│  (DB-first + API)      (API-only)                               │
└─────────────────────────────────────────────────────────────────┘
```

File structure:
```
apps/web/src/app/xtream-electron/
├── stores/
│   ├── features/
│   │   ├── with-portal.feature.ts      # Playlist & portal status
│   │   ├── with-content.feature.ts     # Categories & streams
│   │   ├── with-selection.feature.ts   # UI selection & pagination
│   │   ├── with-search.feature.ts      # Search functionality
│   │   ├── with-epg.feature.ts         # EPG data
│   │   ├── with-player.feature.ts      # Stream URLs & player
│   │   └── index.ts
│   ├── xtream.store.ts                 # Facade composing all features
│   └── index.ts
├── services/
│   ├── xtream-api.service.ts           # Xtream Codes API calls
│   ├── xtream-url.service.ts           # Stream URL construction
│   └── index.ts
├── data-sources/
│   ├── xtream-data-source.interface.ts # Abstract interface + types
│   ├── electron-xtream-data-source.ts  # DB-first implementation
│   ├── pwa-xtream-data-source.ts       # API-only implementation
│   └── index.ts                        # Factory provider
└── with-favorites.feature.ts           # Favorites (existing)
└── with-recent-items.ts                # Recently viewed (existing)
```

Key patterns:
- **Feature stores**: Each `with*.feature.ts` uses `signalStoreFeature()` for focused functionality
- **Facade pattern**: `XtreamStore` composes all features, maintaining backward compatibility
- **Data source abstraction**: `IXtreamDataSource` interface with environment-specific implementations
- **Factory injection**: `provideXtreamDataSource()` selects Electron or PWA implementation at runtime

Data strategies by environment:
| Environment | Strategy |
|-------------|----------|
| **Electron** | DB-first: Check DB → fetch API if missing → cache to DB |
| **PWA** | API-only: Always fetch from API, store in memory |

**M3U Playlist Module Architecture**:

The M3U playlist module handles traditional M3U/M3U8 playlists with support for 90,000+ channels.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         VIDEO PLAYER PAGE                            │
│                    apps/web/src/app/home/video-player/              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────────────┐  ┌────────────────────┐ │
│  │   Sidebar   │  │    Video Player      │  │   EPG List         │ │
│  │             │  │  (ArtPlayer/Video.js)│  │   (Right drawer)   │ │
│  │ ┌─────────┐ │  │                      │  │                    │ │
│  │ │Channel  │ │  │                      │  │                    │ │
│  │ │List     │ │  │                      │  │                    │ │
│  │ │Container│ │  │                      │  │                    │ │
│  │ └─────────┘ │  │                      │  │                    │ │
│  └─────────────┘  └──────────────────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

Channel List Component Structure (parent coordinator pattern):
```
libs/ui/components/src/lib/channel-list-container/
├── channel-list-container.component.ts   # Parent - shared state coordinator
├── all-channels-tab/                      # Virtual scroll + debounced search
├── groups-tab/                            # Expansion panels + infinite scroll
├── favorites-tab/                         # CDK drag-drop reordering
└── channel-list-item/                     # Individual channel display
```

Key patterns:
- **EnrichedChannel**: Pre-computed EPG data attached to channels for performance
- **Parent coordinator**: Manages shared signals (`channelEpgMap`, `progressTick`, `favoriteIds`)
- **Virtual scrolling**: CDK virtual scroll for 90,000+ channel lists
- **Infinite scroll**: IntersectionObserver in groups tab loads 50 items at a time
- **Global progress tick**: Single 30s interval instead of per-item intervals

State management via NgRx (`libs/m3u-state/`):
- `PlaylistActions`: loadPlaylists, addPlaylist, removePlaylist, parsePlaylist
- `ChannelActions`: setChannels, setActiveChannel, setAdjacentChannelAsActive
- `EpgActions`: setActiveEpgProgram, setCurrentEpgProgram, setEpgAvailableFlag
- `FavoritesActions`: updateFavorites, setFavorites

See `docs/architecture/m3u-playlist-module.md` for complete documentation.

**Routing**: Lazy-loaded routes in `apps/web/src/app/app.routes.ts`

- Home/playlists overview: `/`
- Video player: `/playlists/:id` or `/iptv`
- Xtream Codes: `/xtreams/:id` (different routes for Electron vs web)
- Stalker portal: `/portals/:id`
- Settings: `/settings`

**Service Architecture** (Factory Pattern):

- Abstract `DataService` class in `libs/services/src/lib/data.service.ts` defines the contract
- Two environment-specific implementations:
    - `ElectronService` (`apps/web/src/app/services/electron.service.ts`) - Uses IPC to communicate with Electron backend
    - `PwaService` (`apps/web/src/app/services/pwa.service.ts`) - Uses HTTP API and IndexedDB for standalone web version
- Factory function `DataFactory()` in `apps/web/src/app/app.config.ts` determines which implementation to inject:
    ```typescript
    if (window.electron) {
        return new ElectronService();
    }
    return new PwaService();
    ```

**Data Storage (Environment-Specific)**:

- **Electron**: libSQL/SQLite database via Drizzle ORM
    - Location: `~/.iptvnator/databases/iptvnator.db`
    - Full-featured relational database with foreign keys and indexes
    - Supports local file or remote Turso instance via env vars
- **PWA (Web)**: IndexedDB via `ngx-indexed-db`
    - Browser-based NoSQL storage
    - Same schema structure but implemented in IndexedDB
    - Limited by browser storage quotas

**TypeScript File Size Rule**:

Keep TypeScript files under **300 lines**. Hard maximum is **350–400 lines**.

- When creating new files, design them to stay within this limit from the start.
- When adding a feature to an existing file that would push it past 350 lines, **refactor first**: extract helpers, sub-services, or feature modules before adding the new code.
- When you notice a file already exceeds 350 lines, **proactively suggest a refactoring** (or perform it if the change is straightforward) — even if the immediate task is small.

Typical split strategies:
- Angular components: extract child components, move logic to a dedicated service or store feature
- Signal store features: split into smaller `with*` feature functions in separate files
- Services: split by responsibility (e.g. separate API, transformation, and state concerns)
- Utility files: group by domain and export from a barrel `index.ts`

This rule exists to keep the codebase navigable and reviewable. A 150-line file is always preferable to a 500-line file.

---

**Angular Coding Standards**:

This project uses modern Angular signal-based APIs and patterns. **ALWAYS** use the following:

- **Component Queries**: Use `viewChild()`, `viewChildren()`, `contentChild()`, `contentChildren()` instead of `@ViewChild`, `@ViewChildren`, `@ContentChild`, `@ContentChildren` decorators
    ```typescript
    // ✅ Correct - Signal-based
    readonly menu = viewChild.required<MatMenu>('menuRef');
    readonly items = viewChildren<ElementRef>('item');

    // ❌ Incorrect - Old decorator syntax
    @ViewChild('menuRef') menu!: MatMenu;
    @ViewChildren('item') items!: QueryList<ElementRef>;
    ```

    **Important**: When using signals in templates with properties that expect non-signal values, unwrap the signal by calling it:
    ```html
    <!-- ✅ Correct - Unwrap the signal -->
    <button [matMenuTriggerFor]="menu()">Open Menu</button>

    <!-- ❌ Incorrect - Signal not unwrapped -->
    <button [matMenuTriggerFor]="menu">Open Menu</button>
    ```

- **Component Inputs/Outputs**: Use `input()` and `output()` functions instead of `@Input()` and `@Output()` decorators
    ```typescript
    // ✅ Correct - Signal-based
    readonly title = input.required<string>();
    readonly size = input<number>(10); // with default value
    readonly clicked = output<string>();

    // ❌ Incorrect - Old decorator syntax
    @Input({ required: true }) title!: string;
    @Input() size = 10;
    @Output() clicked = new EventEmitter<string>();
    ```

- **Reactive State**: Use signal primitives for reactive state management
    ```typescript
    // ✅ Use signal(), computed(), effect(), linkedSignal()
    readonly count = signal(0);
    readonly doubled = computed(() => this.count() * 2);

    constructor() {
        effect(() => {
            console.log('Count changed:', this.count());
        });
    }
    ```

- **Host Bindings**: Use `@HostBinding()` and `@HostListener()` decorators (these don't have signal equivalents yet)
    ```typescript
    @HostBinding('class.active') get isActive() { return this.active(); }
    @HostListener('click') onClick() { /* ... */ }
    ```

- **Control Flow**: Use `@if`, `@for`, `@switch` instead of `*ngIf`, `*ngFor`, `*ngSwitch`
    ```typescript
    // ✅ Correct - Modern syntax
    @if (isLoggedIn()) {
        <p>Welcome!</p>
    }

    @for (item of items(); track item.id) {
        <li>{{ item.name }}</li>
    }

    // ❌ Incorrect - Old syntax
    <p *ngIf="isLoggedIn">Welcome!</p>
    <li *ngFor="let item of items; trackBy: trackById">{{ item.name }}</li>
    ```

### Backend Architecture (Electron)

**Main Entry**: `apps/electron-backend/src/main.ts`

- Bootstraps Electron app and initializes database
- Registers event handlers for IPC communication

**Database**:

- **ORM**: Drizzle ORM with libSQL (local SQLite file or remote Turso)
- **Location**: `~/.iptvnator/databases/iptvnator.db` (avoids spaces in path)
- **Schema** (`apps/electron-backend/src/app/database/schema.ts`):
    - `playlists` - Playlist metadata (M3U, Xtream, Stalker)
    - `categories` - Content categories (live, movies, series)
    - `content` - Streams/VOD/series items
    - `favorites` - User favorites
    - `recentlyViewed` - Watch history
- **Connection**: `apps/electron-backend/src/app/database/connection.ts`
    - Auto-creates tables on init
    - Supports local file or remote via env vars (`LIBSQL_URL`, `LIBSQL_AUTH_TOKEN`)

**IPC Communication**:

- **Preload script**: `apps/electron-backend/src/app/api/main.preload.ts`
    - Exposes `window.electron` API via `contextBridge`
    - All IPC channels defined here (playlist operations, EPG, database CRUD, external players, etc.)
- **Event handlers**: `apps/electron-backend/src/app/events/`
    - `database.events.ts` - Database CRUD operations
    - `playlist.events.ts` - Playlist import/update
    - `epg.events.ts` - EPG fetch and parsing (uses worker)
    - `xtream.events.ts` - Xtream Codes API
    - `stalker.events.ts` - Stalker portal API
    - `player.events.ts` - External player (MPV, VLC) integration
    - `settings.events.ts` - App settings
    - `electron.events.ts` - App version, etc.

**Workers**:

- EPG parsing runs in worker thread: `apps/electron-backend/src/app/workers/epg-parser.worker.ts`

### Key Features

**Playlist Support**:

- M3U/M3U8 files (local or URL)
- Xtream Codes API (`username`, `password`, `serverUrl`)
- Stalker portal (`macAddress`, `url`)

**Video Players**:

- Built-in HTML5 player with HLS.js or Video.js
- External players: MPV, VLC (via IPC to Electron backend)

**EPG (Electronic Program Guide)**:

- XMLTV format support
- Background parsing in worker thread
- Stored in database for quick lookup

**Favorites and Recently Viewed**:

- Per-playlist favorites and global favorites
- Recently viewed tracks watch history

**Fire TV / Android TV Support**:

- PWA wrapped in Capacitor Android WebView for sideloadable APK
- D-pad remote navigation with visible focus indicators
- TV-optimized 10-foot interface (overscan-safe, large touch targets, no hover states)
- Fire TV launcher integration (`LEANBACK_LAUNCHER` intent)
- Landscape-locked, fullscreen display

### Fire TV / Android TV Architecture

The Fire TV build wraps the PWA output in a **Capacitor** Android WebView app.

```
┌─────────────────────────────────────────────────────┐
│                  Fire Stick / Android TV             │
│  ┌───────────────────────────────────────────────┐  │
│  │              Android WebView (Capacitor)       │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │         IPTVnator PWA (Angular)          │  │  │
│  │  │  + tv-overrides.scss (body.tv-mode)      │  │  │
│  │  │  + PlatformDetectionService              │  │  │
│  │  │  + TvFocusDirective (D-pad navigation)   │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

Key files:

| File | Purpose |
|------|---------|
| `capacitor.config.ts` | App ID, web dir, mixed content for IPTV streams |
| `android/app/src/main/AndroidManifest.xml` | Fire TV manifest — `LEANBACK_LAUNCHER`, landscape, no touchscreen |
| `apps/web/src/app/services/platform-detection.service.ts` | Detects Fire TV / Android TV via user agent (`isFireTV`, `isTVDevice` signals) |
| `apps/web/src/app/directives/tv-focus.directive.ts` | D-pad navigation — makes elements focusable, Enter/Space triggers click |
| `apps/web/src/styles/tv-overrides.scss` | TV CSS — overscan margins, focus rings, 48px targets, hidden scrollbars |
| `scripts/build-firetv.ps1` | PowerShell build script (PWA → Capacitor sync → Gradle APK) |
| `android/variables.gradle` | Android SDK versions — `compileSdkVersion=36`, `minSdkVersion=24` |

Platform detection flow:
1. `PlatformDetectionService` checks `navigator.userAgent` for "AFT" (Fire TV) or "Android TV"
2. `AppComponent` adds `body.tv-mode` CSS class when TV is detected
3. `tv-overrides.scss` applies TV-specific styles scoped under `body.tv-mode`
4. `TvFocusDirective` (`[appTvFocus]`) enables D-pad focus management on interactive elements

**Internationalization**:

- Uses `@ngx-translate` with 16 language files in `apps/web/src/assets/i18n/`

## Development Notes

### Environment Detection and Dual-Mode Architecture

The app determines whether it's running in Electron or as a PWA by checking:

```typescript
window.electron; // truthy in Electron, undefined in browser
```

**Why Dual Mode?**
IPTVnator supports both Electron (desktop app) and PWA (web browser) to provide flexibility:

- **Electron**: Full-featured desktop experience with local database, external player support (MPV/VLC), and native file system access
- **PWA**: Lightweight web version that runs in any browser without installation

**Environment-Specific Behavior**:

- `app.config.ts` - `DataFactory()` selects DataService implementation based on environment
- `app.routes.ts` - Different routes for Xtream portals (Electron uses Tauri-based routes, PWA uses standard routes)
- Storage layer switches automatically:
    - Electron → libSQL/Drizzle ORM → `~/.iptvnator/databases/iptvnator.db`
    - PWA → IndexedDB → Browser storage
- External player support (MPV/VLC) only available in Electron
- File system operations only available in Electron (uploading playlists from disk)

**Base Href Configuration**:
The app uses different base href values depending on the build target:

- **Development & PWA**: `baseHref="/"` (from `index.html`)
    - Used by: `pnpm run serve:frontend`, `pnpm run build:frontend:pwa`
    - For web servers with proper routing
- **Electron Production**: `baseHref="./"` (overridden in build config)
    - Used by: `pnpm run build:backend`, `pnpm run make:app`
    - Required for `file://` protocol in Electron

Build configurations in `apps/web/project.json`:

- `production`: Electron build with `baseHref="./"`
- `pwa`: Web deployment with `baseHref="/"`
- `development`: Dev mode with `baseHref="/"` from index.html

**Factory Pattern Implementation**:
The factory pattern ensures a single codebase works in both environments without conditional checks scattered throughout the application. All environment-specific logic is encapsulated in the service implementations.

### Testing Strategy

- **Unit tests**: Jest with `jest-preset-angular` and `ng-mocks`
- **E2E tests**: Playwright testing the web app
- Backend tests use standard Jest

### Nx Commands

Use `nx` CLI for better performance:

```bash
nx run <project>:<target>
# Example: nx run web:build
# Example: nx run electron-backend:serve
```

To run multiple projects:

```bash
nx run-many --target=test --all
```

### Electron Build Process

The Electron backend depends on the web app being built first:

- `electron-backend:build` depends on `web:build`
- Output goes to `dist/apps/electron-backend` (backend) and `dist/apps/web` (frontend)
- Packaging combines both into distributable

### Database Migrations

No formal migration system yet. Schema changes are applied via raw SQL in `connection.ts` `createTables()` function using `CREATE TABLE IF NOT EXISTS`.

### Common Patterns

**IPC Communication**:

1. Define handler in appropriate events file (e.g., `database.events.ts`)
2. Register with `ipcMain.handle()` in the event bootstrap function
3. Expose in preload script via `contextBridge.exposeInMainWorld()`
4. Call from Angular via `window.electron.<methodName>()`

**Adding New Playlist Source**:

1. Add type to `libs/shared/interfaces/src/lib/playlist.interface.ts`
2. Create event handler in `apps/electron-backend/src/app/events/`
3. Add UI in `apps/web/src/app/home/`
4. Update database schema if needed

**State Management**:

- Use NgRx for global application state (playlists)
- Use component stores (`@ngrx/component-store`) for feature-specific state
- Use NgRx signals for reactive data streams

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->
