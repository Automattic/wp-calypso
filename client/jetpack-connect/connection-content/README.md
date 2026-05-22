# Adding a new plugin to the jetpack-connector flow

> Read this when adding a plugin to the unified `from=jetpack-connector` authorize / login / signup flow (or to its secondary-connection variant).

This guide covers everything needed to register a new plugin in the unified Jetpack connection flow (`from=jetpack-connector`). The flow is plugin-aware: it selects logos, subtitles, feature cards, and secondary-connection copy based on the `plugins` query parameter passed from the WordPress site.

Secondary-connection content (cards + subtitle shown when a non-owner admin connects an additional wpcom account) is gated by the `has_connected_owner=1` URL signal emitted by the Jetpack plugin's `Manager::get_authorization_url()` whenever the site already has a connection owner. `isSecondaryConnection()` in `authorize.jsx` is the consumer; the legacy `already_authorized=1` signal still flows from `Webhooks::handle_connect_url_redirect()` and is unrelated to the plugin-aware secondary content described here.

## How it works

The plugin slug arrives in the URL as part of the `plugins` query parameter (comma-separated list). Calypso classifies each slug into a **family** (`a4a`, `woo`, `jetpack`, or `other`), then uses the family composition to select:

1. **Composite logo** — the header logo shown on the authorize, login, and signup pages
2. **Subtitle scenario** — one of 16 pre-composed subtitle strings per surface (auth, login, signup)
3. **Feature cards** — up to 3 brand-keyed cards in the "what you'll get" section
4. **Secondary connection copy** — simplified content for users connecting after the site owner

```
plugins query param
    │
    ▼
families.ts ── getFamilyFromSlug() ──► Family ('a4a' | 'woo' | 'jetpack' | 'other')
    │
    ├── plugin-registry.ts ──► display name, isFullJetpack flag
    │
    ├── scenarios.ts ──► SubtitleScenario (16 possibilities)
    │   └── copy.ts ──► subtitle strings for auth / login / signup / secondary
    │
    ├── selectors.ts ──► getFeatureSelection() ──► card keys
    │   └── family-features.ts ──► card title + bullets (first connection & secondary)
    │       └── feature-cards.tsx ──► assembled cards with logos
    │
    └── plugin-registry.ts ──► getLogoForFamilies() ──► composite header logo
```

## Step-by-step: adding a plugin to an existing family

If your plugin falls into an existing family (A4A, Woo, or Jetpack), most of the system works automatically via prefix matching. Here's what you need to do:

### 1. Verify family classification (`families.ts`)

`getFamilyFromSlug()` classifies slugs by prefix:

- `automattic*` → `a4a`
- `woocommerce*` → `woo`
- `jetpack` or `jetpack-*` → `jetpack`
- everything else → `other`

**If your plugin slug matches one of these prefixes, you're done here.** If it belongs to a known family but uses a non-standard prefix (e.g. a Woo extension called `payments-gateway`), add a clause to `getFamilyFromSlug()`.

### 2. Register the plugin (`plugin-registry.ts`)

Add an entry to `PLUGIN_REGISTRY`:

```typescript
'your-plugin-slug': {
    slug: 'your-plugin-slug',
    family: 'woo',  // or 'jetpack', 'a4a'
    displayName: 'Your Plugin Name',
},
```

This gives the plugin a human-readable name for any surface that references it. If you skip this step, the raw slug is used as the display name — the flow never breaks, it just looks less polished.

For Jetpack-family plugins: set `isFullJetpack: true` only on the main Jetpack plugin. Sub-plugins should omit this flag.

### 3. Decide if the plugin needs a dedicated feature card

There are two tiers of card specificity:

- **Family-level card** (e.g. `'woo'`, `'jetpack'`): Used when the full plugin or multiple plugins from the same family are active. Most new plugins should use this.
- **Per-plugin card** (e.g. `'jetpack-backup'`, `'jetpack-social'`): Used only when exactly one individual Jetpack sub-plugin is active. This lets the card be hyper-specific.

**If your plugin should get a per-plugin card** (Jetpack sub-plugins only):

#### a. Add a `FeatureCardKey` (`family-features.ts`)

Add your slug to the `FeatureCardKey` type:

```typescript
export type FeatureCardKey =
    | 'a4a'
    | 'woo'
    | 'jetpack'
    // ...existing keys...
    | 'your-plugin-slug'  // ← add here
    | 'other';
```

#### b. Add first-connection card data (`family-features.ts`)

Add a `case` to `getFeatureCardData()`:

```typescript
case 'your-plugin-slug':
    return {
        title: __( 'Your Plugin Name' ),
        bullets: [
            __( 'First key benefit of your plugin.' ),
            __( 'Second key benefit.' ),
            __( 'Third key benefit.' ),
        ],
    };
```

#### c. Add secondary-connection card data (`family-features.ts`)

Add a `case` to `getSecondaryFeatureCardData()`. Secondary bullets should describe what an additional admin user gets (narrower than the owner connection):

```typescript
case 'your-plugin-slug':
    return {
        title: __( 'Your Plugin Name' ),
        bullets: [
            __( 'What a secondary admin can do with this plugin.' ),
        ],
    };
```

#### d. Register the card key in the selector (`selectors.ts`)

Add a `case` to `getFamilyCardKey()` so the single-plugin detection returns your key:

```typescript
case 'your-plugin-slug':
    return 'your-plugin-slug';
```

#### e. Add a logo mapping (`feature-cards.tsx`)

Add a `case` to `getLogoForCardKey()`. All Jetpack-family cards share the Jetpack logo; Woo and A4A use their own:

```typescript
case 'your-plugin-slug':
    return <JetpackLogo full size={ 32 } />;
```

### 4. Decide if the plugin needs a dedicated subtitle scenario

Subtitles are the descriptive text below the "Connect your account" heading. They're pre-composed per scenario to give translators complete sentences.

**Most new plugins don't need a new scenario.** The existing family-level scenarios cover multi-plugin combinations. A new scenario is only needed if your plugin is a Jetpack sub-plugin that can appear alone and deserves a unique pitch (like "enable real-time backups" for Jetpack Backup).

**If you do need a new scenario:**

#### a. Add the scenario key (`scenarios.ts`)

Add to the `SubtitleScenario` type:

```typescript
export type SubtitleScenario =
    // ...existing scenarios...
    | 'YOUR_PLUGIN'
    | 'OTHER_ONLY';
```

#### b. Add detection logic (`scenarios.ts`)

Add your plugin to `getJetpackSingleScenario()` (Jetpack sub-plugins) or add a new branch in `getSubtitleScenario()`:

```typescript
case 'your-plugin-slug':
    return 'YOUR_PLUGIN';
```

#### c. Add subtitle strings for all three surfaces (`copy.ts`)

Add an entry to each of the three subtitle tables:

- `getLoginSubtitles()` — "Your site is registered with WordPress.com — finish connecting your account to {benefit}."
- `getAuthSubtitles()` — "Your site is registered with WordPress.com — connecting your account gives it secure access to features from {plugin name}."
- `getSignupSubtitles()` — "You'll use it to {benefit}."

### 5. Secondary connection copy (`copy.ts`)

`getSecondaryAuthCopy()` uses simplified family-level branching (not the full 16-scenario system). If your plugin falls into an existing family, the existing subtitle covers it. If you're adding a new family, add a branch:

```typescript
const hasYourFamily = families.includes( 'your-family' );
if ( hasYourFamily ) {
    subtitle = __( 'Connect your account to access [your plugin benefits] for this site.' );
}
```

### 6. Composite header logo (`plugin-registry.ts`)

The header logo is selected by `getLogoForFamilies()` based on which families are present. Current logic:

- Woo + A4A → `jetpack-connect-all.svg`
- Woo only → `jetpack-connect-woo.svg`
- A4A only → `jetpack-connect-a8c.svg`
- Default (Jetpack/other) → `jetpack-connect.svg`

If your plugin introduces a new family that needs a distinct header logo, add a branch here and create the SVG asset.

### 7. Update tests

Tests live alongside each module:

| File                 | Test file                        |
| -------------------- | -------------------------------- |
| `families.ts`        | `test/families.test.ts`          |
| `plugin-registry.ts` | `test/plugin-registry.test.ts`   |
| `scenarios.ts`       | `test/scenarios.test.ts`         |
| `selectors.ts`       | `test/selectors.test.ts`         |
| `family-features.ts` | `test/family-features.test.ts`   |
| `copy.ts`            | `test/copy.test.ts`              |
| `feature-cards.tsx`  | `../test/feature-cards.test.tsx` |
| `authorize.jsx`      | `../test/authorize.js`           |

Run the full suite:

```bash
yarn test-client client/jetpack-connect/connection-content/test/
yarn test-client client/jetpack-connect/test/feature-cards.test.tsx
yarn test-client client/jetpack-connect/test/authorize.js
```

## Quick reference: what to touch per family type

| Step                            | Woo plugin    | Jetpack sub-plugin | A4A plugin    | Other         |
| ------------------------------- | ------------- | ------------------ | ------------- | ------------- |
| `families.ts`                   | Auto (prefix) | Auto (prefix)      | Auto (prefix) | Add clause    |
| `plugin-registry.ts`            | Add entry     | Add entry          | Add entry     | Add entry     |
| `FeatureCardKey` type           | No            | If per-plugin card | No            | No            |
| `getFeatureCardData()`          | No            | If per-plugin card | No            | No            |
| `getSecondaryFeatureCardData()` | No            | If per-plugin card | No            | No            |
| `getFamilyCardKey()`            | No            | If per-plugin card | No            | No            |
| `getLogoForCardKey()`           | No            | If per-plugin card | No            | No            |
| `SubtitleScenario`              | No            | If unique subtitle | No            | No            |
| `getSubtitleScenario()`         | No            | If unique subtitle | No            | No            |
| `copy.ts` subtitles             | No            | If unique subtitle | No            | No            |
| `getSecondaryAuthCopy()`        | No            | No                 | No            | If new family |
| `getLogoForFamilies()`          | No            | No                 | No            | If new logo   |

**TL;DR for existing families:** Add a `PLUGIN_REGISTRY` entry. That's it — the prefix-based family classification, family-level cards, and subtitle scenarios handle everything else automatically. Only add per-plugin overrides if the plugin appears alone and deserves unique copy.
