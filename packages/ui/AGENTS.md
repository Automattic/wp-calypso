# @automattic/ui

`@automattic/ui` is a library of React components that adhere to the Automattic Design System, to be used across Automattic products.

## Conventions

### Dark mode in CSS Modules

Component styles in this package live in CSS Modules (`*.module.scss`), so the leaf class is scope-hashed and `:root[data-theme='dark'] .foo` cannot reach it. Use the shared Calypso `when-dark-theme` mixin:

```scss
@use '@wordpress/base-styles/colors';
@use 'calypso/assets/stylesheets/shared/mixins/dark-theme' as ui-mixins;
@use '../utils/_theme-variables' as theme;

.badge {
	background-color: colors.$white;

	@include ui-mixins.when-dark-theme {
		background-color: theme.$components-color-background;
	}
}
```

The mixin emits rules for both `:root[data-theme='dark']` and `:root[data-theme='system']` under `prefers-color-scheme: dark`, so consumers of either toggle behave the same.

Prefer reading colors from `_theme-variables.scss` (which resolves to the `--wp-components-*` custom properties the dashboard overrides in dark mode) over hardcoded hex values, so most components need no dark-mode branch at all.
