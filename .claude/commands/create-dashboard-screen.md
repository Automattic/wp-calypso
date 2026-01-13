# Create Dashboard Screen

Scaffold a new screen in the WordPress.com Dashboard (`client/dashboard`).

## Instructions

### Step 1: Ask for Environment Availability

Detect available environments by checking for `app-*` directories in `client/dashboard/`:

```
Glob: client/dashboard/app-*
```

This will find directories like `app-dotcom`, `app-ciab`, etc. The `app` directory (without suffix) represents shared/all environments.

Use `AskUserQuestion` to ask which environment(s) the screen should be available in:

```
question: "Which environment(s) should this screen be available in?"
header: "Environment"
options: [dynamically populated from detected app-* directories]
  - label: "All" description: "Available in all environments"
  - label: "{EnvName}" description: "Only in {EnvName} (from app-{envname}/)"
```

For example, if `app-dotcom` and `app-ciab` directories exist:
```
options:
  - label: "All" description: "Available in all environments"
  - label: "Dotcom" description: "Only in Dotcom (app-dotcom/)"
  - label: "CIAB" description: "Only in CIAB (app-ciab/)"
```

**Note:** Environment availability is controlled via `config.supports.*` checks in the router's `create{Section}Routes` function. If not "All", wrap the route registration in a conditional check.

### Step 2: Extract Available Routes

Discover router files dynamically:

```
Glob: client/dashboard/app/router/*.ts
Glob: client/dashboard/app/router/*.tsx
```

Exclude utility files (like `index.tsx`, `root.tsx`) by checking for `export const *Route = createRoute` patterns.

For each router file, extract routes matching this pattern:
```typescript
export const {name}Route = createRoute({
  ...
  getParentRoute: () => {parentRoute},
  path: '{path}',
  ...
})
```

Build the full path for each route by tracing the `getParentRoute` chain. For example:
- `siteSettingsRoute` has `getParentRoute: () => siteRoute` and `path: 'settings'`
- `siteRoute` has `getParentRoute: () => rootRoute` and `path: 'sites/$siteSlug'`
- Full path: `/sites/$siteSlug/settings`

### Step 3: Ask User to Select Parent Route

Use `AskUserQuestion` with a multi-step selection:

**First question - Select router file:**
Present options based on the router files discovered in Step 2. Derive the section name from the filename (e.g., `sites.tsx` → "Sites", `me.tsx` → "Me").

```
question: "Which section should the new screen be added to?"
header: "Section"
options: [dynamically populated from discovered router files]
```

**Second question - Select specific parent route:**
Based on the section selected, present the available routes from that router file.

```
question: "Which route should be the parent for your new screen?"
header: "Parent"
options: [dynamically populated from extracted routes in the selected file]
```

### Step 4: Ask for Screen Title

Use `AskUserQuestion` to ask for the screen title. Since this is free-form text, provide example options but expect the user to select "Other" and type their title:

```
question: "What should the screen be called?"
header: "Title"
options:
  - label: "Settings" description: "For configuration screens"
  - label: "Overview" description: "For summary/dashboard screens"
  - label: "List" description: "For list/table screens"
```

The user will likely select "Other" and provide their own title like "Tax Settings" or "API Keys".

The title will be used for:
- The page header
- The route's `head.meta.title`
- Deriving the component name (e.g., "My New Feature" -> `MyNewFeature`)
- Deriving the path (e.g., "My New Feature" -> `my-new-feature`)

### Step 5: Ask for Layout Size

Use `AskUserQuestion` to ask about the PageLayout size:

```
question: "What layout width should the screen use?"
header: "Layout"
options:
  - label: "Small (Recommended)" description: "660px max-width, good for forms and settings"
  - label: "Large" description: "1344px max-width, good for data tables and lists"
```

### Step 6: Create Screen Component

Use the selected layout size (`"small"` or `"large"`) in the PageLayout component.

Derive the component location dynamically from the parent route's lazy import path:

1. Find the parent route's `.lazy()` import in the router file:
   ```typescript
   export const billingRoute = createRoute({...}).lazy(() =>
     import('../../me/billing').then(...)  // <-- This path tells you where sibling screens go
   )
   ```

2. The import path (e.g., `../../me/billing`) indicates the parent's component location relative to `client/dashboard/app/router/`

3. Create your new screen as a sibling folder with a prefix matching the parent:
   - Parent import: `../../me/billing` → New screen: `client/dashboard/me/billing-{screen-name}/index.tsx`
   - Parent import: `../../sites/settings` → New screen: `client/dashboard/sites/settings-{screen-name}/index.tsx`
   - Parent import: `../../domains` → New screen: `client/dashboard/domains/{screen-name}/index.tsx`

4. If the parent route has no `.lazy()` (it's just a grouping route), look at its children's import paths to determine the folder pattern.

Use this template (adjust import paths based on nesting depth):

```typescript
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function {ComponentName}() {
	return (
		<PageLayout
			size="{size}"  // "small" or "large" based on user selection
			header={
				<PageHeader
					title={ __( '{Screen Title}' ) }
				/>
			}
		>
			{/* Add your screen content here */}
		</PageLayout>
	);
}
```

### Step 7: Register the Route

Add the route definition to the appropriate router file. Insert it near related routes.

```typescript
export const {screenName}Route = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( '{Screen Title}' ),
			},
		],
	} ),
	getParentRoute: () => {parentRoute},
	path: '{screen-path}',
} ).lazy( () =>
	import( '../../{relative-path-to-component}' ).then( ( d ) =>
		createLazyRoute( '{screen-name}' )( {
			component: d.default,
		} )
	)
);
```

Then register the route in the appropriate `create{Section}Routes` function by adding it to the routes array or as a child of the parent route.

### Step 8: Provide Next Steps

After creating the files, tell the user:

1. The files created and their locations
2. How to test: `yarn workspace @automattic/calypso-dashboard start`
3. The URL to navigate to (based on the full path)
4. Remind them to add the screen to navigation if needed (sidebar, tabs, etc.)

## Example

If user selects `/me/billing` as parent and "Tax Settings" as title:

1. Create `client/dashboard/me/billing-tax-settings/index.tsx`
2. Add `taxSettingsRoute` to `client/dashboard/app/router/me.tsx`
3. Register in `createMeRoutes` function under `billingRoute.addChildren([...])`
4. Test URL: `http://my.localhost:3000/me/billing/tax-settings`
