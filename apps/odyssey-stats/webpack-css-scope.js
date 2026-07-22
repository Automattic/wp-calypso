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
// (@wordpress/components Modal, e.g. the UTM builder, stats upsell modal, and feedback modal).
const prefix =
	':where(.jp-stats-dashboard, .color-scheme, .ReactModalPortal, [data-base-ui-portal], [data-wp-compat-overlay-slot], .components-modal__screen-overlay, .jp-stats-widget)';

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
	// .jp-stats-widget styling its own mount element (widget/index.scss), including compound
	// forms like `.jp-stats-widget.is-ready` or `.jp-stats-widget :hover`. It's already one of
	// the prefix roots above, so nesting it as a descendant of itself would go dead — same
	// problem :root/html/body have. Lookahead (not `$`) avoids also matching unrelated classes
	// like `.jp-stats-widget-extra`.
	/^\.jp-stats-widget(?![\w-])/,
];

module.exports = { prefix, ignoreFiles, exclude };
