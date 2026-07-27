/**
 * The `postcss-prefix-selector` options that scope Odyssey's first-party component styles to
 * their mount points, so generic classes (`.card`, `.button`, etc.) can't collide with wp-admin's
 * own chrome. See AGENTS.md > CSS Scoping.
 *
 * Pulled out of webpack.config.js so `css-scope.test.js` can run the real options through the
 * real plugin instead of a hand-copied stand-in that can drift from what actually ships.
 */

// .jp-stats-dashboard for normal content, .jp-stats-widget for the WP-Admin dashboard widget's
// own mount point. The rest are portal roots first-party components can render into:
// .color-scheme/.ReactModalPortal (Popover/Dialog), [data-base-ui-portal]/[data-wp-compat-overlay-slot]
// (@wordpress/ui Popover/Tooltip/Dialog, e.g. StatsInfotip), .components-modal__screen-overlay
// (@wordpress/components Modal, e.g. the UTM builder, stats upsell modal, and feedback modal),
// .components-popover__fallback-container (@wordpress/components Popover/Dropdown/DropdownMenu —
// document.body.append(container) whenever there's no <Popover.Slot> ancestor, which there never
// is here since Odyssey/Calypso Stats render no SlotFillProvider).
const prefix =
	':where(.jp-stats-dashboard, .color-scheme, .ReactModalPortal, [data-base-ui-portal], [data-wp-compat-overlay-slot], .components-modal__screen-overlay, .components-popover__fallback-container, .jp-stats-widget)';

// The subset of `prefix`'s roots that Jetpack's PHP places directly as top-level mount points —
// never nested inside each other or inside a portal root. Unlike the portal roots (.color-scheme,
// .ReactModalPortal, etc.), which are routinely nested *inside* one of these two for per-section
// theming, these two can never have a matching ancestor, so self-nesting them under `prefix` is
// always dead, at any depth in the selector chain — not just when they style themselves directly.
// verify-css-scope.js uses this list (rather than re-deriving it from `prefix`) to check for that
// specific failure mode without flagging legitimate portal-root nesting as a false positive.
const entryPointRoots = [
	'.jp-stats-dashboard',
	'.jp-stats-widget',
	// @wordpress/components' Popover fallback container: unconditionally document.body.append'd
	// (node_modules/@wordpress/components/src/popover/index.tsx) whenever there's no <Popover.Slot>
	// ancestor — which there never is here — so it can never nest inside another root either.
	'.components-popover__fallback-container',
];

// The remaining `prefix` roots: portal roots first-party components render into, which — unlike
// entryPointRoots — can legitimately be nested inside .jp-stats-dashboard/.jp-stats-widget.
// verify-css-scope.js cross-checks entryPointRoots + portalRoots against `prefix`'s actual roots
// and fails if a root in `prefix` isn't classified in either list: without that check, adding a
// new root to `prefix` without also updating this file would silently fall through both checks
// rather than failing loudly, defeating the point of automating this in the first place.
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
	// @visx/tooltip's TooltipInPortal (used by the line chart tooltip) portals to an unmarked
	// <body> div, always wrapped in a `.visx-tooltip` element. This file already self-scopes
	// under `.visx-tooltip` (like app.scss does under `[id="wpcom"]`) — re-prefixing would
	// double-nest it.
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
	// .jp-stats-dashboard styling its own mount element or its descendants (e.g. wp-admin.scss's
	// WP-Admin layout overrides — sidebar width vars, padding fixes, fixed-nav fixes), including
	// compound forms like `.jp-stats-dashboard.theme-default .focus-content`. It's one of the
	// prefix roots above and, unlike the portal roots, is never nested inside another one — Jetpack's
	// PHP places it directly on the page — so nesting it under itself would go dead at any depth,
	// same problem :root/html/body have. Lookahead (not `$`) avoids also matching unrelated classes.
	/^\.jp-stats-dashboard(?![\w-])/,
	// .jp-stats-widget styling its own mount element (widget/index.scss), including compound
	// forms like `.jp-stats-widget.is-ready` or `.jp-stats-widget :hover`. It's already one of
	// the prefix roots above, so nesting it as a descendant of itself would go dead — same
	// problem :root/html/body have. Lookahead (not `$`) avoids also matching unrelated classes
	// like `.jp-stats-widget-extra`.
	/^\.jp-stats-widget(?![\w-])/,
	// .color-scheme.is-<scheme> from @automattic/calypso-color-schemes sets the accent/primary
	// scales on the element that carries the class itself (main dashboard, portals, widget), so
	// prefixing it as a descendant of a scope root would go dead — same self-scoping case as the
	// mount roots above. Anchored to the full compound so nested rules like
	// `.color-scheme.is-light .masterbar` still get prefixed.
	/^\.color-scheme\.is-[\w-]+$/,
	// .stats-widget-content.color-scheme carries the widget's primary→accent remap on its own
	// root element (scoped-theme-for-widget.scss); same self-scoping reason.
	/^\.stats-widget-content\.color-scheme$/,
	// @wordpress/components' Tooltip (built on @ariakit/react, not @wordpress/ui/base-ui — already
	// imported in client/my-sites/stats/stats-list/action-{link,promote,spam}.jsx) always portals
	// to document.body via Ariakit's own portal, with no class/attribute on the wrapper to add to
	// `prefix` — only the rendered content carries `.components-tooltip`. No first-party rule
	// targets it today, but if one ever does, prefixing it would go dead the same way the mount
	// roots above do; excluding it pre-emptively means that regression can't happen silently.
	/^\.components-tooltip(?![\w-])/,
];

module.exports = { prefix, entryPointRoots, portalRoots, ignoreFiles, exclude };
