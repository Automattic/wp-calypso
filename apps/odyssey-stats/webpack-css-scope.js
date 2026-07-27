/**
 * The `postcss-prefix-selector` options that scope Odyssey's first-party component styles to
 * their mount points, so generic classes (`.card`, `.button`, etc.) can't collide with wp-admin's
 * own chrome. See AGENTS.md > CSS Scoping.
 *
 * Pulled out of webpack.config.js so `css-scope.test.js` can run the real options through the
 * real plugin instead of a hand-copied stand-in that can drift from what actually ships.
 */

// .jp-stats-dashboard: normal content. .jp-stats-widget: the WP-Admin dashboard widget's mount.
// The rest are portal roots: .color-scheme/.ReactModalPortal (Popover/Dialog),
// [data-base-ui-portal]/[data-wp-compat-overlay-slot] (@wordpress/ui), .components-modal__screen-overlay
// (@wordpress/components Modal), .components-popover__fallback-container (@wordpress/components
// Popover/Dropdown, document.body-appended since we render no <Popover.Slot>/SlotFillProvider).
const prefix =
	':where(.jp-stats-dashboard, .color-scheme, .ReactModalPortal, [data-base-ui-portal], [data-wp-compat-overlay-slot], .components-modal__screen-overlay, .components-popover__fallback-container, .jp-stats-widget)';

// `prefix` roots that are always document.body-appended and never nested inside another root, so
// self-nesting them under `prefix` is always dead — unlike the portal roots below, which routinely
// nest legitimately inside these two. verify-css-scope.js uses this to check for that failure mode
// without flagging legitimate portal-root nesting as a false positive.
const entryPointRoots = [
	'.jp-stats-dashboard',
	'.jp-stats-widget',
	'.components-popover__fallback-container',
];

// The rest of `prefix`'s roots: legitimately nestable inside entryPointRoots. verify-css-scope.js
// fails the build if a `prefix` root isn't classified in entryPointRoots or here — otherwise a new
// root added to `prefix` without updating this file would silently go unchecked.
const portalRoots = [
	'.color-scheme',
	'.ReactModalPortal',
	'[data-base-ui-portal]',
	'[data-wp-compat-overlay-slot]',
	'.components-modal__screen-overlay',
];

const ignoreFiles = [
	// Already hand-scoped; re-prefixing would double-nest it.
	'odyssey-stats/src/app.scss',
	// Calypso's global stylesheet (html/body reset, @wordpress/components CSS) — left unscoped
	// for now.
	'client/assets/stylesheets/style.scss',
	// @visx/tooltip's TooltipInPortal (line chart tooltip) self-scopes under `.visx-tooltip`
	// already — re-prefixing would double-nest it.
	'client/my-sites/stats/components/line-chart/styles.scss',
	// Third-party CSS is out of scope here.
	/node_modules/,
];

// Selectors that target the real <html>/<body>/document root, or a mount point's own root rule.
// Prefixing these would require the mount point to be its own ancestor, which is impossible —
// the rule would just go dead. Leave them unscoped instead.
const exclude = [
	/^:root(?![\w-])/, // :root, :root[data-theme=dark] .foo
	/(^|[\s,])(html|body)(?=$|[\s.[:#,])/, // html.rtl, body.lockscroll
	/^\.rtl(?![\w-])/, // .rtl button
	/^:lang\(/, // :lang(he) .rtl
	/^\[lang/, // [lang*=fr] .wp-brand-font
	/^\[dir[~|^$*]?=/, // [dir=rtl] .chevron
	// .jp-stats-dashboard styling itself or descendants (wp-admin.scss). Compound forms too, e.g.
	// `.jp-stats-dashboard.theme-default .focus-content`.
	/^\.jp-stats-dashboard(?![\w-])/,
	// .jp-stats-widget styling itself (widget/index.scss). Compound forms too, e.g.
	// `.jp-stats-widget.is-ready` or `.jp-stats-widget :hover`.
	/^\.jp-stats-widget(?![\w-])/,
	// .color-scheme.is-<scheme> sets vars on the element that carries the class itself. Anchored
	// to the full compound so nested rules like `.color-scheme.is-light .masterbar` still prefix.
	/^\.color-scheme\.is-[\w-]+$/,
	// .stats-widget-content.color-scheme: widget's primary→accent remap on its own root element.
	/^\.stats-widget-content\.color-scheme$/,
	// @wordpress/components' Tooltip (Ariakit, not @wordpress/ui) portals to document.body with no
	// class/attribute on the wrapper — only its content carries `.components-tooltip`. Nothing
	// targets it today; excluded pre-emptively so that stays true if something ever does.
	/^\.components-tooltip(?![\w-])/,
];

module.exports = { prefix, entryPointRoots, portalRoots, ignoreFiles, exclude };
