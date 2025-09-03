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
- `site_spec.agent_url`: API endpoint for the Site-Spec agent
- `site_spec.agent_id`: Identifier for the Site-Spec agent
- `site_spec.build_site_url`: URL template for building sites

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
		"site-spec": true
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

## API Reference

### `isSiteSpecEnabled()`

Returns `true` if the `site-spec` feature flag is enabled.

### `getSiteSpecUrl()`

Returns the configured script URL, or `null` if not configured.

### `getSiteSpecCssUrl()`

Returns the configured CSS URL, or `null` if not configured.

### `getSiteSpecConfig()`

Returns an object with the Site-Spec configuration:

- `agentUrl`: The agent API endpoint
- `agentId`: The agent identifier
- `buildSiteUrl`: The build site URL template

### `loadSiteSpecScript()`

Loads the Site-Spec script dynamically. Returns a Promise that resolves when the script is loaded.

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
