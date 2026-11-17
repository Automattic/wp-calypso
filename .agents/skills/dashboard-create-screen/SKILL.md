---
name: dashboard-create-screen
description: Create a new screen in the Multi-site Dashboard with automatic route registration
allowed-tools: Read, Glob, Grep, Edit, Write, AskUserQuestion
---

# Dashboard Create Screen Skill

Creates new screens in `client/dashboard` with automatic route discovery and registration.

## Step 1: Discover Available Routes

First, find all router files and extract available routes.

### Find Router Files

Use Glob to discover router files:
```
client/dashboard/app/router/*.tsx
client/dashboard/app/router/*.ts
```

### Extract Routes from Each File

For each router file, use Grep to extract route information.

**Find exported route constants:**
```regex
export\s+const\s+(\w+Route)\s*=\s*createRoute
```

**Extract parent relationships:**
```regex
getParentRoute:\s*\(\)\s*=>\s*(\w+Route)
```

**Extract path segments:**
```regex
path:\s*['"]([^'"]+)['"]
```

**Extract component import paths:**
```regex
import\(\s*['"]([^'"]+)['"]\s*\)
```

### Build Route Information

For each discovered route, record:
- Route variable name (e.g., `siteBackupsRoute`)
- Parent route name (e.g., `siteRoute`)
- Path segment (e.g., `'backups'`)
- Source file path
- Component directory (derived from import path)

## Step 2: Discover Navigation Menus (After Route Selection)

Menu discovery happens after the user selects a parent route. Find menus relative to the route's location.

### Determine Menu Search Path

Based on the selected parent route's import path, determine where to search for menus:

1. Extract the component directory from the parent route's lazy import
   - Example: `import('../../sites/backups')` → search in `client/dashboard/sites/`
   - Example: `import('../../me/profile')` → search in `client/dashboard/me/`

2. Use Glob to find menu files in that area:
   ```
   client/dashboard/{area}/**/*-menu/index.tsx
   ```

3. Also check the app-level menu for top-level routes:
   ```
   client/dashboard/app/*-menu/index.tsx
   ```

### Extract Menu Information

For each discovered menu file, use Grep to find:

**Existing menu items pattern:**
```regex
<ResponsiveMenu\.Item\s+to=
```

**Route references in menu:**
```regex
to=\{?\s*[`'"/]([^`'"}\s]+)
```

This helps understand the menu's structure and where to add new items.

### Menu Item Pattern

Menu items use `ResponsiveMenu.Item`:
```typescript
<ResponsiveMenu.Item to="/path/to/screen">
	{ __( 'Menu Label' ) }
</ResponsiveMenu.Item>
```

Conditional menu items check feature support:
```typescript
{ siteTypeSupports.featureName && (
	<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/feature` }>
		{ __( 'Feature' ) }
	</ResponsiveMenu.Item>
) }
```

## Step 3: Gather User Input

Ask the user for the following using AskUserQuestion:

1. **Parent Route**: Present discovered routes grouped by source file
2. **Screen Name**: lowercase-with-dashes (e.g., `custom-settings`)
3. **Route Path**: URL path segment (e.g., `custom-settings`)
4. **Page Title**: Human-readable title (e.g., `Custom settings`)
5. **Page Description** (optional): Description shown below title
6. **Add to Navigation Menu?**: Yes or No

## Step 4: Determine File Locations

Based on the selected parent route's import path, determine where to create the component.

**Pattern:** If parent imports from `../../sites/backups`, new screen goes in `client/dashboard/sites/{screen-name}/`

**For sites area:** `client/dashboard/sites/{screen-name}/index.tsx`
**For me area:** `client/dashboard/me/{screen-name}/index.tsx`
**For other areas:** Follow the same pattern from parent's import path

## Step 5: Create Component File

Generate a basic component with the standard layout.

### Screen Template

```typescript
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function {ComponentName}() {
	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( '{PageTitle}' ) }
					description={ __( '{PageDescription}' ) }
				/>
			}
		>
			{/* Content goes here */}
		</PageLayout>
	);
}
```

## Step 6: Register the Route

Add the route definition to the same router file as the parent route.

### Route Definition Pattern

Add after other route exports in the file:

```typescript
export const {routeName}Route = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( '{PageTitle}' ),
			},
		],
	} ),
	getParentRoute: () => {parentRoute},
	path: '{routePath}',
} ).lazy( () =>
	import( '{componentImportPath}' ).then( ( d ) =>
		createLazyRoute( '{routeId}' )( {
			component: d.default,
		} )
	)
);
```

### Wire into Route Tree

Find where the parent route is used in the `create*Routes()` function and add the new route.

**For standalone routes** (direct child of main area route):
```typescript
// Find the routes array (e.g., siteRoutes, meRoutes)
// Add the new route to the array
siteRoutes.push( newScreenRoute );
```

**For nested routes** (child of a feature route):
```typescript
// Find where parent uses .addChildren()
// Add the new route to the children array
parentRoute.addChildren( [ existingRoute, newScreenRoute ] )
```

## Step 7: Add Navigation Menu Entry (Optional)

If the user requested a navigation menu entry, add it to the discovered menu file.

### Locate Target Menu File

Use the menu discovered in Step 2 based on the route's area:

1. From the parent route's import path, extract the area (e.g., `sites`, `me`, `plugins`)
2. Glob for `client/dashboard/{area}/**/*-menu/index.tsx`
3. If multiple menus found, present them to the user for selection
4. If no area-specific menu found, fall back to `client/dashboard/app/primary-menu/index.tsx`

### Add Menu Item

Read the target menu file and find an appropriate location (typically before the closing `</ResponsiveMenu>` tag).

**Build the route path from parent route's path + new screen path:**
- If parent path is `/sites/$siteSlug` and screen path is `analytics` → `/sites/${ siteSlug }/analytics`
- If parent path is `/me` and screen path is `api-keys` → `/me/api-keys`

**Insert menu item:**
```typescript
<ResponsiveMenu.Item to={ `{fullRoutePath}` }>
	{ __( '{PageTitle}' ) }
</ResponsiveMenu.Item>
```

### Match Existing Patterns

Analyze the existing menu items to match the pattern:
- If menu uses template literals with `siteSlug`, use the same pattern
- If menu uses simple strings, use simple strings
- If menu items have conditional wrappers, ask user if one is needed

### Conditional Menu Items

If the screen requires feature gating (check if similar items in the menu use conditions):
```typescript
{ siteTypeSupports.{featureName} && (
	<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/{routePath}` }>
		{ __( '{PageTitle}' ) }
	</ResponsiveMenu.Item>
) }
```

## Coding Standards

Follow the coding standards documented in `client/dashboard/docs/`.
