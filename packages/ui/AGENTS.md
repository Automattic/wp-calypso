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

Prefer reading colors from `_theme-variables.scss` (which resolves to the `--wp-components-*` custom properties overridden by the shared color-scheme layer) over hardcoded hex values, so most components need no dark-mode branch at all.

Shared dark-mode tokens and component-wide overrides for components used across multiple Calypso surfaces live in `client/lib/color-scheme/dark-theme.scss`; add package-local dark-mode rules only when the component itself owns the exceptional styling.

When adding a component that is not already used in a dark-mode-supported surface, verify it in dark mode and add or reuse overrides where needed. If the component is already covered by the existing dark-mode baseline, assume the shared styling holds unless the new usage introduces new variants, states, wrappers, or local CSS.
