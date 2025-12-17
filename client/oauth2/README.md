# OAuth2 Authorization Flow - Architecture Overview

## Overview

This module implements a modern, flexible OAuth2 authorization flow for WordPress.com that allows third-party applications to request access to user accounts. The architecture is designed to be highly customizable while maintaining a consistent user experience.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Route Layer                          │
│  /oauth2/authorize → controller.jsx → variant selection     │
└───────────────────┬─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────────┐
│                    Variant Components                        │
│  • AuthorizeDefault  - Basic authorization flow             │
│  • AuthorizeStudio   - Studio-specific customization        │
│  • (extensible for new clients)                             │
└───────────────────┬─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────────┐
│                  Core Authorize Component                    │
│  Orchestrates the authorization flow with configurable UI   │
└─────┬─────────────┬──────────────┬──────────────┬───────────┘
      │             │              │              │
┌─────▼──────┐ ┌───▼────────┐ ┌──▼──────────┐ ┌─▼────────────┐
│  UserCard  │ │Permissions │ │   Actions   │ │   Success    │
│            │ │    List    │ │   Buttons   │ │   Message    │
└────────────┘ └────────────┘ └─────────────┘ └──────────────┘
      │             │              │              │
┌─────▼─────────────▼──────────────▼──────────────▼───────────┐
│                      Custom Hooks Layer                      │
│  • useAuthorizeMeta  - Fetch authorization metadata         │
│  • use-authorize-actions - Handle approve/deny/switch       │
└──────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. **Route & Controller** (`controller.jsx`)

- Entry point for OAuth2 authorization requests
- Client-based variant selection using `CLIENT_VARIANT_MAP`
- Maps client IDs to their respective authorization variants

### 2. **Authorize Component** (`components/authorize.tsx`)

The main orchestrator component that manages the authorization flow.

**Key Responsibilities:**

- Fetching and displaying authorization metadata
- Redirecting to login if user is not authenticated
- Managing loading, error, and success states
- Rendering user information, permissions, and action buttons
- Coordinating with the login context for headers

**Configurable Props:**

- `showLogo` - Toggle heading logo display
- `showPermissions` - Toggle permissions list display
- `userCardVariant` - Choose between 'horizontal' or 'centered' layout
- `approveButtonText` / `denyButtonText` - Custom button labels
- `approveButtonClassName` / `denyButtonClassName` - Custom styling
- `renderActions` - Complete override of action buttons

### 3. **Variant System** (`components/authorize-variants.tsx`)

Pre-configured authorization experiences for different clients.

**Available Variants:**

- **AuthorizeDefault** - Minimal layout, horizontal user card, no permissions
- **AuthorizeStudio** - Full layout with logo, permissions, and horizontal user card

**Extensibility:** Add new variants by creating a new component that renders `<Authorize>` with custom props and registering it in `CLIENT_VARIANT_MAP`.

### 4. **Sub-Components**

#### **UserCard** (`components/user-card.tsx`)

Displays user information with two layout variants:

- **Horizontal** - Avatar and info side-by-side (compact)
- **Centered** - Avatar and info stacked vertically (prominent)

#### **PermissionsList** (`components/permissions-list.tsx`)

Shows requested permissions with expand/collapse functionality:

- Initially displays 4 permissions
- "Show more/less" toggle for additional permissions
- Icons mapped to permission types
- Accessible with ARIA attributes
- Learn more link to support documentation

#### **AuthorizeActions** (`components/authorize-actions.tsx`)

Action buttons for the authorization flow:

- Approve button (primary variant)
- Deny button (secondary variant)
- Customizable text and styling
- Can be completely replaced via `renderActions` prop

#### **SuccessMessage** (`components/success-message.tsx`)

Confirmation displayed after successful authorization:

- Shows success icon and message
- Used primarily for custom protocol redirects
- Accessible with `role="status"` and `aria-live="polite"`

## Custom Hooks

### **useAuthorizeMeta** (`hooks/use-authorize-meta.ts`)

React Query-based hook for fetching authorization metadata.

**Returns:**

- Client information (ID, title, icon)
- User data (if logged in)
- Requested permissions
- Authorization/denial URLs
- Feature flags

**Features:**

- 30-second cache (staleTime)
- Automatic refetching on mount
- Loading and error states

### **use-authorize-actions** (`hooks/use-authorize-actions.ts`)

Utility functions for handling user actions.

**Exported Functions:**

- `handleApprove()` - Builds authorization URL and redirects
- `handleDeny()` - Decodes denial URL and redirects
- `isCustomProtocol()` - Detects non-HTTP/HTTPS protocols (e.g., Studio)
- `buildAuthorizeUrl()` - Constructs authorization URL with required parameters

**Note:** For account switching, use `redirectToLogout()` from `calypso/state/current-user/actions`. **Important:** Always pass an **absolute URL** (with `window.location.origin`) to `redirectToLogout()` so the backend redirects back to the current environment (local/staging/production) instead of always going to production.

## Data Flow

```
User visits → /oauth2/authorize?client_id=X&redirect_uri=Y
                         ↓
Controller determines variant based on client_id
                         ↓
useAuthorizeMeta fetches authorization metadata
                         ↓
          ┌──────────────▼──────────────┐
          │   User logged in?           │
          └──────┬─────────────┬────────┘
           NO    │             │  YES
          ┌──────▼──────┐      │
          │  Redirect   │      │
          │  to Login   │      │
          └─────────────┘      │
                               ▼
          Authorize component renders user card, permissions, actions
                         ↓
          User clicks Approve/Deny
                         ↓
          handleApprove/handleDeny processes action
                         ↓
          Redirect to authorization/denial URL
```

**Login Redirect:** If the user is not logged in (checked via Redux `currentUser` state), they are automatically redirected to the login page before seeing the authorization screen. The redirect URL is constructed directly as `/log-in?redirect_to=...` (not using `meta.links.calypso_login_url`) and uses `window.location.replace()`. A ref is used to ensure the redirect only happens once. After login, the user returns to complete the authorization.

## Customization Guide

### Adding a New Client Variant

<!--eslint ignore list-item-content-indent-->

1. **Create the variant component** in `authorize-variants.tsx`:

   ```typescript
   export const AuthorizeMyClient = () => (
   	<Authorize
   		userCardVariant="centered"
   		showPermissions
   		showLogo
   		approveButtonText="Connect"
   	/>
   );
   ```

2. **Register in controller** (`controller.jsx`):

   ```javascript
   const CLIENT_VARIANT_MAP = {
   	[ OAUTH2_CLIENT_IDS.STUDIO ]: AuthorizeStudio,
   	[ OAUTH2_CLIENT_IDS.MY_CLIENT ]: AuthorizeMyClient,
   };
   ```

3. **Add client ID** to `constants.ts`:

   ```typescript
   export const OAUTH2_CLIENT_IDS = {
   	STUDIO: 95109,
   	MY_CLIENT: 12345,
   } as const;
   ```

### Custom Action Buttons

Use the `renderActions` prop for complete control:

<!--eslint ignore list-item-content-indent-->

```tsx
<Authorize
	renderActions={ ( { onApprove, onDeny } ) => (
		<div>
			<Button onClick={ onDeny }>Cancel</Button>
			<Button onClick={ onApprove } variant="primary">
				Grant Access
			</Button>
		</div>
	) }
/>
```

## Styling

All styles are contained in `style.scss` with the following structure:

- `.oauth2-connect` - Main container (432px max-width, centered)
- `.oauth2-connect__user-card` - User information display
- `.oauth2-connect__permissions` - Permissions section
- `.oauth2-connect__actions` - Action buttons
- `.oauth2-connect__success` - Success message

**Mobile Responsive:** Uses `max-width` with `width: 100%` to adapt to smaller screens without media queries.

## Accessibility

- Semantic HTML structure
- ARIA labels and attributes on interactive elements
- `aria-expanded` on show more/less button
- `role="status"` and `aria-live="polite"` on success message
- Keyboard navigation support via WordPress Button components
- Screen reader friendly permission list

## Security Considerations

- HTML entity decoding using DOMParser (prevents XSS)
- Custom protocol detection for app-based OAuth clients
- Nonce validation for authorization requests
- Parameter validation via useAuthorizeMeta
- HTTPS-only redirect validation

## Future Enhancements

- Add unit tests for components and hooks
- Add E2E tests for authorization flow
- Analytics tracking for user actions
- URL validation for redirect URLs
- Error boundary for graceful error handling
- Loading skeletons for better perceived performance

## Dependencies

- **@tanstack/react-query** - Data fetching and caching
- **@wordpress/components** - UI components (Button, Notice, Spinner)
- **@wordpress/element** - React abstractions
- **@wordpress/icons** - Icon library
- **i18n-calypso** - Internationalization
- **wpcom-proxy-request** - API communication

## Files Structure

```
client/oauth2/
├── README.md                          # This file
├── index.js                           # Route registration
├── controller.jsx                     # Route controller & variant selection
├── constants.ts                       # OAuth2 client IDs
├── style.scss                        # All component styles
├── components/
│   ├── authorize.tsx                 # Main component
│   ├── authorize-variants.tsx        # Pre-configured variants
│   ├── authorize-actions.tsx         # Action buttons
│   ├── user-card.tsx                 # User information display
│   ├── permissions-list.tsx          # Permissions with expand/collapse
│   └── success-message.tsx           # Success confirmation
├── hooks/
│   ├── use-authorize-meta.ts         # Fetch authorization data
│   └── use-authorize-actions.ts      # Action handlers
└── utils/
    └── permission-icons.ts           # Permission icon mapping
```

## Related Files

- `client/sections.js` - Section registration
- `client/layout/logged-out.jsx` - Masterbar configuration
- `client/login/wp-login/components/one-login-layout.tsx` - Layout wrapper
- `client/state/oauth2-clients/ui/reducer.js` - Client ID state management

---

For questions or contributions, please refer to the main Calypso documentation.
