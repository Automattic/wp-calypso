# Site-Spec Script Loading System

This module provides utilities for loading and managing the Site Spec lib in WordPress Calypso.

## Overview

The Site Spec lib loading follows WordPress Calypso patterns for external lib management, similar to other third-party scripts are handled.

## Configuration

### Feature Flag

Enable the script loading with the `site-spec` feature flag:

```json
{
	"features": {
		"site-spec": true
	}
}
```

### Configuration Keys

Define the following configuration values:

- `site_spec.url`: Base URL for the Site-Spec script
- `site_spec.css_url`: URL for the Site-Spec CSS styles
- `site_spec.agent_id`: Identifier for the Site-Spec agent
- `site_spec.agent_url`: (Optional) API endpoint for the Site-Spec agent
- `site_spec.build_site_url`: (Optional) URL template for building sites

**Note:** `agent_url` and `build_site_url` are optional. If not provided, the Site-Spec library will use its own defaults. This allows for environment-specific overrides when needed.

### Environment-Specific Configuration

#### Development

```json
{
	"site_spec": {
		"url": "http://your-site-spec.local/dist/sitespec.umd.js",
		"css_url": "http://your-site-spec.local/dist/style.css"
	},
	"features": {
		"site-spec": true
	}
}
```

**Note:** We are using `sitespec.bundle.umd.js` because React is not available globally in the version required by SiteSpec. The bundled version includes its own React instance to avoid version conflicts with WordPress Calypso's React setup.

#### Production

```json
{
	"site_spec": {
		"url": "https://cdn.example.com/site-spec.js",
		"css_url": "https://cdn.example.com/style.css"
	},
	"features": {
		"site-spec": true // It is false for the moment
	}
}
```

## Usage

### Basic Script Loading

```javascript
import { loadSiteSpecScript } from 'calypso/lib/site-spec';

// Load the script
await loadSiteSpecScript();
```

### Load CSS Separately

```javascript
import { loadSiteSpecCSS } from 'calypso/lib/site-spec';

// Load CSS only
await loadSiteSpecCSS();
```

### Check if Enabled

```javascript
import { isSiteSpecEnabled } from 'calypso/lib/site-spec';

if ( isSiteSpecEnabled() ) {
	// Site-Spec is enabled
}
```

### Get Configuration

```javascript
import { getSiteSpecConfig } from 'calypso/lib/site-spec';

const config = getSiteSpecConfig();
// Returns: { agentUrl, agentId, buildSiteUrl }
```

### Get Script URL

```javascript
import { getSiteSpecUrl } from 'calypso/lib/site-spec';

const url = getSiteSpecUrl();
// Returns the configured script URL
```

### Get CSS URL

```javascript
import { getSiteSpecUrl } from 'calypso/lib/site-spec';

const cssUrl = getSiteSpecUrl( 'css_url' );
// Returns the configured CSS URL
```

## API Reference

### `isSiteSpecEnabled()`

Returns `true` if the `site-spec` feature flag is enabled.

### `getSiteSpecUrl( urlKey = 'url' )`

Returns the configured URL for the specified key, or `null` if not configured.

- `urlKey`: The configuration key to retrieve ('url' for script, 'css_url' for CSS)
- Returns: The configured URL string or `null`

### `getSiteSpecConfig()`

Returns an object with the Site-Spec configuration:

- `agentUrl`: The agent API endpoint
- `agentId`: The agent identifier
- `buildSiteUrl`: The build site URL template

### `loadSiteSpecScript()`

Loads the Site-Spec script dynamically. Returns a Promise that resolves when the script is loaded. Automatically loads CSS first if configured.

### `loadSiteSpecCSS()`

Loads the Site-Spec CSS separately. Returns a Promise that resolves when the CSS is loaded.

### `isSiteSpecScriptLoaded()`

Returns `true` if the script has already been loaded.

### `resetSiteSpecScriptState()`

Resets the internal script loading state (useful for testing).

## Error Handling

The system includes comprehensive error handling:

- **Configuration errors**: Logged when required config is missing
- **Script loading errors**: Caught and logged during dynamic loading
- **Network errors**: Handled gracefully with fallbacks

## Testing

Run tests for the Site-Spec utilities:

```bash
yarn test-client client/lib/site-spec/test/utils.js
```

## Architecture

The system follows WordPress Calypso patterns:

- **Configuration-driven**: Uses `@automattic/calypso-config` for all settings
- **Feature-flagged**: Script loading controlled by feature flags
- **Environment-aware**: Different behavior for development vs production
- **Error-resilient**: Graceful fallbacks and comprehensive logging
- **Testable**: Mockable dependencies and isolated functionality
