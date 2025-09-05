# Site-Spec Integration Library

A React hook for integrating the SiteSpec AI site builder widget into WordPress Calypso components.

## Overview

This library provides a reusable React hook that handles loading and initializing the SiteSpec widget. It manages script loading, DOM manipulation, and cleanup.

## Features

- **Automatic Loading**: Loads CSS and JavaScript resources only when needed
- **React Integration**: hook-based API for React components
- **SSR Safe**: Works with server-side rendering
- **Auto Cleanup**: Cleans up resources when components unmount

## Configuration

### Feature Flag

Enable the SiteSpec integration with the `site-spec` feature flag:

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

**Note:** `agent_url` and `build_site_url` are optional. If not provided, the Site-Spec library will use its own defaults.

### Environment-Specific Configuration

#### Development

```json
{
	"site_spec": {
		"script_url": "http://widgets.wp.com/site-spec/bundle-1.0.0.umd.js",
		"css_url": "http://widgets.wp.com/site-spec/style-1.0.0.css",
		"agent_id": "site-spec"
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
		"script_url": "https://widgets.wp.com/site-spec/bundle-1.0.0.umd.js",
		"css_url": "https://widgets.wp.com/site-spec/style-1.0.0.css",
		"agent_id": "site-spec"
	},
	"features": {
		"site-spec": true // It is false for the moment
	}
}
```

## Usage

### Basic Usage

```typescript
import { useSiteSpec } from 'calypso/lib/site-spec';

const MyComponent = () => {
  useSiteSpec({ container: '#site-spec' });
  return <div id="site-spec" />;
};
```

### With Event Handlers

```typescript
import { useSiteSpec } from 'calypso/lib/site-spec';

const SiteSpecComponent = () => {
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

## API Reference

### `useSiteSpec(options)`

Custom React hook for loading and managing SiteSpec resources.

#### Parameters

- `options.container` (string, optional): Container selector for the widget (default: `'#site-spec'`)
- `options.onMessage` (function, optional): Message handler callback
- `options.onError` (function, optional): Error handler callback

#### Example

```typescript
useSiteSpec({
  container: '#my-site-spec-container',
  onMessage: (message) => {
    console.log('Received message:', message);
  },
  onError: (error) => {
    console.error('SiteSpec error:', error);
  },
});
```

## How It Works

1. **Feature Check**: Verifies that the `site-spec` feature flag is enabled
2. **Resource Loading**: Dynamically loads CSS and JavaScript from the configured URLs
3. **Widget Initialization**: Initializes the SiteSpec widget with the provided configuration
4. **Cleanup**: Removes resources when the component unmounts

## Notes

- The hook automatically handles duplicate initialization attempts
- Resources are only loaded when the component mounts
- The widget is automatically cleaned up when the component unmounts
- All operations are SSR-safe and won't cause server-side rendering errors