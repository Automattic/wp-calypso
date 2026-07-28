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
	// Calypso's global stylesheet (html/body reset, colour schemes, wp-components overrides) —
	// left unscoped for now.
	'client/assets/stylesheets/style.scss',
	// @visx/tooltip's TooltipInPortal (line chart tooltip) self-scopes under `.visx-tooltip`
	// already — re-prefixing would double-nest it.
	'client/my-sites/stats/components/line-chart/styles.scss',
	// Third-party CSS is out of scope here. Our own bundled copy of @wordpress/components' base
	// CSS is the one exception — see `vendorPrefix` below, applied by a separate plugin instance
	// via `vendorIncludeFiles` instead of being carved out of this blanket rule, since it needs a
	// narrower prefix than everything else in this file gets.
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

// A second, narrower prefix used only for our bundled copy of `@wordpress/components`' own base
// CSS (`node_modules/@wordpress/components/build-style/style.css`, applied via `vendorIncludeFiles`
// through a separate postcss-prefix-selector instance in webpack.config.js — see AGENTS.md > CSS
// Scoping). That file defines Modal/Popover structure classes (`.components-modal__frame`,
// `.components-modal__header`, `.components-modal__content`, ...) which wp-admin's own instances
// of the same components carry too — e.g. the command palette, also a `@wordpress/components`
// Modal built from the same shared code Odyssey's JS externalizes to (`wp.components.Modal`).
// `.components-modal__screen-overlay` and `.components-popover__fallback-container` (both in
// `prefix` above) sit on that shared wrapper element, so — unlike when they anchor Odyssey's own
// compound-scoped overrides elsewhere (e.g. `.stats-utm-builder__overlay .components-modal__header`,
// which stays specific because of the extra class) — they don't distinguish "our modal" from
// "core's modal" for the vendor CSS's own bare selectors. `.is-odyssey-stats` does: Odyssey's own
// Modal instances add it via `overlayClassName` (see stats-upsell-modal, stats-module-utm-builder,
// feedback/modal), and core never emits it, so the vendor scope anchors on that instead.
const VENDOR_OVERLAY_SELF_MARKER = '.is-odyssey-stats';

const vendorPrefix = `:where(.jp-stats-dashboard, .color-scheme, ${ VENDOR_OVERLAY_SELF_MARKER }, .ReactModalPortal, [data-base-ui-portal], [data-wp-compat-overlay-slot], .jp-stats-widget)`;

const vendorEntryPointRoots = [ '.jp-stats-dashboard', '.jp-stats-widget' ];

const vendorPortalRoots = [
	'.color-scheme',
	VENDOR_OVERLAY_SELF_MARKER,
	'.ReactModalPortal',
	'[data-base-ui-portal]',
	'[data-wp-compat-overlay-slot]',
];

const vendorIncludeFiles = [ /node_modules\/@wordpress\/components\/build-style\/style\.css/ ];

// `overlayClassName` lands on the exact same element that carries `.components-modal__screen-overlay`
// (see `node_modules/@wordpress/components/build-module/modal/index.mjs`:
// `clsx("components-modal__screen-overlay", overlayClassnameProp)`) — never on an ancestor, since
// Modal always portals straight to `document.body` with nothing of Odyssey's own in between. The
// vendor CSS's own selectors that start with `.components-modal__screen-overlay` (its base
// position/backdrop rule, plus the `.is-animating-out` variant) style that element itself, so the
// default ancestor-based prefixing (`:where(vendorPrefix) .components-modal__screen-overlay`) can
// never match them — nothing is ever an ancestor of an element carrying its own marker class. Left
// alone, that makes Odyssey's own modals lose their fixed positioning and dimmed backdrop, since none
// of their first-party SCSS re-declares it (see AGENTS.md > CSS Scoping).
//
// Selectors targeting a genuine descendant instead (`.components-modal__frame` etc.) don't have this
// problem: the overlay div is a real ancestor of those, so requiring an ancestor with
// `.is-odyssey-stats` correctly matches via that same overlay div.
const vendorOverlaySelfSelector = /^\.components-modal__screen-overlay(?:\.[\w-]+)*/;

function vendorTransform( _prefix, selector, prefixedSelector ) {
	if ( vendorOverlaySelfSelector.test( selector ) ) {
		return selector.replace(
			vendorOverlaySelfSelector,
			( leadingCompound ) => `${ leadingCompound }${ VENDOR_OVERLAY_SELF_MARKER }`
		);
	}

	return prefixedSelector;
}

module.exports = {
	prefix,
	entryPointRoots,
	portalRoots,
	ignoreFiles,
	exclude,
	vendorPrefix,
	vendorEntryPointRoots,
	vendorPortalRoots,
	vendorIncludeFiles,
	vendorTransform,
};
