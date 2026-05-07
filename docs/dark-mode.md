# Dark Mode

Dark mode is an alternative Dashboard appearance that renders the interface with dark surfaces and adjusted foreground, border, status, and accent colors. It has been added so users can choose a lower-brightness interface, follow their operating system appearance preference, and work more comfortably in low-light environments.

This document describes how dark mode works in Calypso and how to build UI that adapts to it.

Dark mode currently applies to the Dashboard client in `client/dashboard`. It is separate from the classic Calypso dashboard color schemes described in [Color](color.md). Color schemes change brand and accent palettes; Dashboard dark mode changes the lightness model for the application by switching semantic CSS custom properties and a small set of component overrides.

## How It Works

Dashboard apps opt in to color-scheme support through the app config:

- `supports.colorScheme` controls whether the Dashboard wraps routes in `ColorSchemeProvider`.
- The WordPress.com Dashboard enables that support from the `dark-mode` feature flag.
- `ColorSchemeProvider` reads and writes the `hosting-dashboard-color-scheme` user preference.
- Supported preference values are `light`, `dark`, and `system`; the default is `light`.
- The active value is written to `document.documentElement.dataset.theme`, which renders as `data-theme` on the `<html>` element.

Dark styles are activated from `client/dashboard/app/style.scss`:

```scss
:root[data-theme='dark'] {
	@include dashboard-dark-theme;
}

@media (prefers-color-scheme: dark) {
	:root[data-theme='system'] {
		@include dashboard-dark-theme;
	}
}
```

The shared dark-theme variables and global component overrides live in `client/dashboard/app/_dark-theme.scss`.

## Development

During local development, you can quickly switch the active Dashboard color scheme from the debug menu in the bottom-right corner of the screen:

1. Open the debug menu.
2. Select Preferences.
3. Change `hosting-dashboard-color-scheme` to `dark`, `light`, or `system`.

## Styling Guidelines

Start with semantic variables. Most components should adapt without a dark-mode branch when they use Dashboard and WordPress component tokens instead of hardcoded colors:

```scss
.dashboard-example {
	background: var( --dashboard-surface__background-color );
	border: 1px solid var( --dashboard-surface__border-color );
	color: var( --dashboard__text-color );
}
```

Prefer these variable families before adding a custom value:

- `--dashboard__*` for page-level foreground, background, status, and muted text.
- `--dashboard-surface__*` for cards, panels, modals, and other raised surfaces.
- `--dashboard-field__*` for form controls.
- `--wp-components-color-*` for components that follow the WordPress component token model.
- `--wp-admin-theme-color*` for accent and focus colors.
- `--color-*` only when working with shared Calypso code that already expects Calypso theme properties.

Avoid hardcoded `#fff`, `#000`, and gray values for surfaces, borders, and text unless the value is intentionally brand, media, or asset related. If a component needs a fixed color, include a short comment explaining why it should not follow the theme.

## Adding Dark Overrides

Use a dark override only when semantic variables are not enough. The preferred order is:

1. Use semantic variables in the component styles. This is usually enough.
2. If variables are not enough, add a focused override to `client/dashboard/app/_dark-theme.scss` and include it from `dashboard-dark-theme`.
3. As a last resort, add a component-specific dark style with the `when-dark-theme` mixin.

Common cases that may need an override include third-party components, embedded iframes, charts, SVGs, screenshots, logos, shadows, or components from packages that hardcode light colors.

For broad overrides to shared or third-party components, prefer adding a focused mixin in `client/dashboard/app/_dark-theme.scss`. Keep those overrides narrow and grouped by the component or surface they target.

When an override truly has to live in component-specific Sass, use the `when-dark-theme` mixin from `packages/ui/src/utils/_mixins.scss`. It covers both explicit dark mode and system mode when the OS prefers dark:

```scss
@use '../../../../packages/ui/src/utils/mixins' as ui-mixins;

.dashboard-example {
	background: #fff;

	@include ui-mixins.when-dark-theme {
		background: var( --dashboard-surface__background-color );
	}
}
```

Adjust the relative import path to match the stylesheet location.

## Package Components

Components in `packages/ui` use CSS Modules. Since scope-hashed class names cannot be reliably targeted from global selectors, package styles should use theme variables first:

```scss
@use '../utils/_theme-variables' as theme;

.badge {
	background-color: theme.$components-color-background;
	color: theme.$components-color-foreground;
}
```

Prefer values from `packages/ui/src/utils/_theme-variables.scss` so package components resolve to the `--wp-components-*` custom properties that Dashboard overrides in dark mode. If a package component still needs an explicit dark-mode branch, use the same `when-dark-theme` mixin inside the scoped class.

## Testing

When making a visual change in Dashboard, test all three color-scheme preferences from Me > Preferences > Appearance:

- Light
- Dark
- Auto, with the operating system set to dark

Also check these states when relevant:

- Hover, focus, selected, disabled, loading, empty, warning, and error states.
- Text contrast for primary, muted, link, destructive, and inverted text.
- Borders, dividers, shadows, and focus rings against dark surfaces.
- SVG icons, charts, iframes, screenshots, thumbnails, and brand assets.
- Modals, popovers, dropdowns, tooltips, snackbars, and other portal-rendered UI.

Run `yarn lint:css` for Sass changes and the relevant unit or component tests for behavior changes.
