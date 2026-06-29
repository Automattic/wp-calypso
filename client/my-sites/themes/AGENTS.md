# Themes

The Themes surface renders the Theme Showcase on `/themes` and related views for logged-in, logged-out, single-site, and Jetpack-site flows.

## Dark mode

- Themes dark mode is supported for logged-in users who have opted in to the Dashboard experience. The current route gate lives in `shouldEnableThemesColorScheme()` and applies to non-site Themes routes when `isLoggedIn` and `dashboardOptIn` are both true.
- Shared dark-mode tokens and component-wide overrides for components used across multiple Calypso surfaces live in `client/lib/color-scheme/dark-theme.scss`. Prefer adding or reusing values there when the style belongs to shared components outside Themes or affects multiple areas.
- Themes-only dark-mode exceptions live in `client/my-sites/themes/_dark-mode.scss`. Keep local overrides there when the styling is specific to the Theme Showcase.
- When adding a component that is not already used in a dark-mode-supported surface, verify it in dark mode and add or reuse overrides where needed. If the component is already covered by the existing dark-mode baseline, assume the shared styling holds unless the new usage introduces new variants, states, wrappers, or local CSS.
- Prefer overriding existing CSS custom properties over hardcoded colors.
