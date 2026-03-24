# Dashboard Entry Points

The dashboard architecture is designed to support multiple entry points, where each entry point can have:

- A distinct URL path or be deployed at a different domain.
- Custom branding (logo, colors)
- Different feature sets and navigation
- Shared core functionality

Currently, the dashboard supports two main entry points:

- WordPress.com (dotcom) at `my.wordpress.com`
- CIAB at `my.woo.ai`

This multi-entry point approach allows us to reuse the same codebase while tailoring the user experience to specific products and user types.

## How to Define a New Entry Point

To create a new entry point for the dashboard, follow these steps:

### 1. Create the Entry Point Module

Create a new directory under `client/dashboard` called `app-newproduct` with the following files:

#### `index.tsx`

```typescript
import boot from '../app/boot';
import Logo from './logo';
import './style.scss';

boot( {
  basePath: '/newproduct',
  mainRoute: '/sites', // Or whichever route should be the default
  Logo,
  supports: {
    overview: true,
    sites: true,
    domains: false,
    emails: false,
    reader: false,
    help: true,
    notifications: false,
    me: true,
  },
} );
```

#### `logo.tsx`

```typescript
function Logo() {
  return (
    // Your product's logo SVG or imported component
    <svg width="150" height="24" viewBox="0 0 150 24">
      {/* SVG content */}
    </svg>
  );
}

export default Logo;
```

#### `style.scss`

```scss
// Product-specific styles
// These will be loaded when your entry point is active
```

### 2. Create and Register the Routing

There is only a single dashboard instance for all entry points. The dashboard will route requests based on the request hostname and/or paths. See the following examples for CIAB, and follow similarly for the new entry point:

- `client/dashboard/app-ciab/routing.ts`
- `client/dashboard/app-ciab/section.ts`

Then, we need to register the routing in `client/server/pages/index.js`. Look for the following code which registers `app-ciab`:

```js
DASHBOARD_SECTION_PATHS.forEach( ( route ) => {
	handleRoute( CIAB_DASHBOARD_SECTION_DEFINITION, route, 'entry-dashboard-ciab', ( req ) =>
		isAllowedCiabDashboardHostname( req.hostname )
	);
} );
handleRoute( CIAB_DASHBOARD_SECTION_DEFINITION, '/ciab', 'entry-dashboard-ciab', ( req ) => {
	return isAllowedDotcomDashboardHostname( req.hostname );
} );
```

## Customizing Branding

Each entry point can customize its branding in several ways:

### Logo Component

The `Logo` component is passed to the boot function and rendered in the header. Create a custom logo component in your entry point directory.

### SCSS

Add entry point-specific styles in your entry point's `style.scss` file. These styles will only be loaded when your entry point is active.

For example, you can override theme variables or add entry point-specific styling:

```scss
:root {
	// Layout
	--dashboard__background-color: #fcfcfc;
	--dashboard__text-color: #{$gray-900};

	// Header bar
	--dashboard-header__background-color: #fcfcfc;
	--dashboard-header__color: #{$gray-900};
	--dashboard-header__border-color: #{$gray-100};

	// Menu
	--dashboard-menu-item__color: #{$gray-700};
	--dashboard-menu-item-active__color: #{$black};

	// Secondary menu
	--dashboard-secondary-menu-item__color: #{$gray-900};
}

```

## Customizing Content and Features

The `supports` object in your entry point configuration controls which features are available:

```typescript
supports: {
  overview: true,  // Enable/disable the Overview page
  sites: true,     // Enable/disable the Sites pages
  domains: false,  // Enable/disable the Domains page
  emails: false,   // Enable/disable the Emails page
  reader: false,   // Enable/disable the Reader
  help: true,      // Enable/disable Help functionality
  notifications: false, // Enable/disable Notifications
  me: true,        // Enable/disable the Me section
}
```

This configuration:

1. Controls which routes are created in the router
2. Controls which menu items appear in the primary menu
3. Determines the default route (`mainRoute`)

## Limitations

The customization options are intentionally limited at the moment. We need further input and explorations to ensure the following questions:

- Does the content of each route aim to be different? For example, would the sites table contain different fields/interactions depending on the application / logged in user role (agency, regular user…)?
- What kind of branding differences do we expect per dashboard? Do design tokens provide enough local variance (colors, spacing, fonts, etc.) or do we expect each property to be modified entirely (navigation, menu reordering, etc.)?
