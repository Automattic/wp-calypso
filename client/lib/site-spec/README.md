# Site-Spec Script Loading System

A robust, type-safe module for dynamically loading and managing SiteSpec resources in WordPress Calypso.

## Overview

This module provides intelligent resource loading with built-in caching, error handling, and DOM management. It follows WordPress Calypso patterns for external library management while providing a clean, modern API.

## Features

- **Loading**: Automatically loads CSS and JavaScript in the correct order


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

- `site_spec.script_url`: Base URL for the Site-Spec JavaScript bundle
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
		"script_url": "http://your-site-spec.local/dist/sitespec.umd.js",
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

## API Reference

### Core Functions

#### `isSiteSpecEnabled()`

Checks if the SiteSpec feature is enabled in the current environment.

```typescript
import { isSiteSpecEnabled } from 'calypso/lib/site-spec';

if (isSiteSpecEnabled()) {
  await loadSiteSpecScriptAndCSS();
}
```

**Returns:** `boolean`

#### `getSiteSpecConfig()`

Retrieves the SiteSpec configuration object for initializing the widget.

```typescript
import { getSiteSpecConfig } from 'calypso/lib/site-spec';

const config = getSiteSpecConfig();
// Returns: { agentUrl?, agentId?, buildSiteUrl? }
```

**Returns:** `SiteSpecConfig`

### Utility Functions

#### `getSiteSpecUrl(urlKey)`

Retrieves the cache-busted URL for a specific SiteSpec resource.

```typescript
import { getSiteSpecUrl } from 'calypso/lib/site-spec';

const scriptUrl = getSiteSpecUrl('script_url');
const cssUrl = getSiteSpecUrl('css_url');
```

**Parameters:**
- `urlKey` (optional): `'script_url' | 'css_url'` - Defaults to `'script_url'`

**Returns:** `string | null`

#### `useSiteSpec(options)`

Custom React hook for loading and managing SiteSpec resources.

```typescript
import { useSiteSpec } from 'calypso/lib/site-spec';

const MyComponent = () => {
  useSiteSpec({
    container: '#site-spec', // Optional: container selector (default: '#site-spec')
    onMessage: (message) => { /* handle messages */ },
    onError: (error) => { /* handle errors */ },
  });
};
```

**Parameters:**
- `options.container` (optional): `string` - Container selector for the widget (default: `'#site-spec'`)
- `options.onMessage` (optional): `(message: unknown) => void` - Message handler
- `options.onError` (optional): `(error: unknown) => void` - Error handler

**Returns:** Object with manual control functions (for advanced usage)

#### `loadSiteSpecScriptAndCSS()`

Loads both SiteSpec CSS and JavaScript resources in the correct order.

```typescript
import { loadSiteSpecScriptAndCSS } from 'calypso/lib/site-spec';

// Load both resources
try {
  await loadSiteSpecScriptAndCSS();
  console.log('SiteSpec resources loaded successfully');
} catch (error) {
  console.error('Failed to load SiteSpec:', error);
}
```

**Returns:** `Promise<void>`

#### `resetSiteSpecScriptState()`

Resets the loader's internal state without affecting existing DOM elements.

```typescript
import { resetSiteSpecScriptState } from 'calypso/lib/site-spec';

resetSiteSpecScriptState();
```

**Returns:** `void`

## Usage Patterns

### Option 1: React Hook (Recommended)
Use the `useSiteSpec` hook for React components:

```typescript
import { useSiteSpec } from 'calypso/lib/site-spec';

const MyComponent = () => {
  useSiteSpec({ container: '#site-spec' });
  return <div id="site-spec" />;
};
```

### Option 2: Manual Loading
Use the individual functions for more control:

```typescript
import { loadSiteSpecScriptAndCSS, getSiteSpecConfig } from 'calypso/lib/site-spec';

const initializeSiteSpec = async () => {
  await loadSiteSpecScriptAndCSS();
  
  if (window.SiteSpec?.init) {
    const config = getSiteSpecConfig();
    window.SiteSpec.init({ container: '#site-spec', ...config });
  }
};
```

## Complete Example

Here's a complete example of how to use SiteSpec in a React component:

```typescript
import { useSiteSpec } from 'calypso/lib/site-spec';

const SiteSpecComponent = () => {
  // Use the SiteSpec hook to handle all loading and initialization
  useSiteSpec({
    container: '#site-spec',
    onMessage: (message) => {
      console.log('SiteSpec message:', message);
    },
    onError: (error) => {
      console.error('SiteSpec error:', error);
    },
  });

  return <div id="site-spec" />;
};

export default SiteSpecComponent;
```

**Note:** This approach loads SiteSpec scripts and CSS only when the component mounts, and removes them when the component unmounts. This is more efficient than loading globally for all pages.

## Type Definitions

```typescript
// Resource types
type ResourceType = 'script' | 'css';

// Configuration object
interface SiteSpecConfig {
  agentUrl?: string;
  agentId?: string;
  buildSiteUrl?: string;
}

// URL configuration keys
type UrlKey = 'script_url' | 'css_url';
```

## Error Handling

The system includes comprehensive error handling:

- **Configuration errors**: Thrown when required URLs are not configured
- **Network errors**: Caught and re-thrown with descriptive messages
- **DOM errors**: Handled gracefully in SSR environments
- **Duplicate loading**: Prevented through intelligent caching

## Testing

Run tests for the Site-Spec utilities:

```bash
yarn test-client client/lib/site-spec
```

## Architecture

The system follows WordPress Calypso patterns:

- **Configuration-driven**: Uses `@automattic/calypso-config` for all settings
- **Feature-flagged**: Script loading controlled by feature flags
- **Environment-aware**: Different behavior for development vs production
- **Error-resilient**: Graceful fallbacks and comprehensive logging
- **Testable**: Mockable dependencies and isolated functionality
