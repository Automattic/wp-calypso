# Site-Spec Script Loading System

This module provides utilities for loading and managing the Site-Spec script in WordPress Calypso.

## Overview

The Site-Spec script loading system follows WordPress Calypso patterns for external script management, similar to how Bilmur and other third-party scripts are handled.

## Configuration

### Feature Flag

Enable the script loading with the `site-spec-script` feature flag:

```json
{
  "features": {
    "site-spec-script": true
  }
}
```

### Configuration Keys

Define the following configuration values:

- `site_spec_url`: Base URL for the Site-Spec script
- `site_spec_agent_url`: API endpoint for the Site-Spec agent
- `site_spec_agent_id`: Identifier for the Site-Spec agent
- `site_spec_build_site_url`: URL template for building sites

### Environment-Specific Configuration

#### Development
```json
{
  "site_spec_url": "http://localhost:8085/dist/sitespec.umd.js",
  "features": {
    "site-spec-script": true
  }
}
```

#### Production
```json
{
  "features": {
    "site-spec-script": true
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
Returns `true` if the `site-spec-script` feature flag is enabled.

### `getSiteSpecUrl()`
Returns the configured script URL, or `null` if not configured.

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

## Migration from sitespec

If migrating from the old `sitespec` naming:

1. Update feature flags from `sitespec-script` to `site-spec-script`
2. Update configuration keys from `sitespec_*` to `site_spec_*`
3. Update import paths from `calypso/lib/sitespec` to `calypso/lib/site-spec`
4. Update debug namespaces from `calypso:sitespec:*` to `calypso:site-spec:*`

## Architecture

The system follows WordPress Calypso patterns:

- **Configuration-driven**: Uses `@automattic/calypso-config` for all settings
- **Feature-flagged**: Script loading controlled by feature flags
- **Environment-aware**: Different behavior for development vs production
- **Error-resilient**: Graceful fallbacks and comprehensive logging
- **Testable**: Mockable dependencies and isolated functionality
