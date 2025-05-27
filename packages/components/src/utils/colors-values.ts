/**
 * Internal dependencies
 */
const white = '#fff';

// Matches the grays in @wordpress/base-styles
const GRAY = {
	900: '#1e1e1e',
	800: '#2f2f2f',
	/** Meets 4.6:1 text contrast against white. */
	700: '#757575',
	/** Meets 3:1 UI or large text contrast against white. */
	600: '#949494',
	400: '#ccc',
	/** Used for most borders. */
	300: '#ddd',
	/** Used sparingly for light borders. */
	200: '#e0e0e0',
	/** Used for light gray backgrounds. */
	100: '#f0f0f0',
};

// Matches @wordpress/base-styles
const ALERT = {
	yellow: '#f0b849',
	red: '#d94f4f',
	green: '#4ab866',
};

// Should match packages/components/src/utils/theme-variables.scss
const THEME = {
	accent: 'var(--wp-components-color-accent, var(--wp-admin-theme-color, #3858e9))',
	accentDarker10:
		'var(--wp-components-color-accent-darker-10, var(--wp-admin-theme-color-darker-10, #2145e6))',
	accentDarker20:
		'var(--wp-components-color-accent-darker-20, var(--wp-admin-theme-color-darker-20, #183ad6))',
	/** Used when placing text on the accent color. */
	accentInverted: `var(--wp-components-color-accent-inverted, ${ white })`,

	background: `var(--wp-components-color-background, ${ white })`,

	foreground: `var(--wp-components-color-foreground, ${ GRAY[ 900 ] })`,
	/** Used when placing text on the foreground color. */
	foregroundInverted: `var(--wp-components-color-foreground-inverted, ${ white })`,

	gray: {
		/** @deprecated Use `COLORS.theme.foreground` instead. */
		900: `var(--wp-components-color-foreground, ${ GRAY[ 900 ] })`,
		800: `var(--wp-components-color-gray-800, ${ GRAY[ 800 ] })`,
		700: `var(--wp-components-color-gray-700, ${ GRAY[ 700 ] })`,
		600: `var(--wp-components-color-gray-600, ${ GRAY[ 600 ] })`,
		400: `var(--wp-components-color-gray-400, ${ GRAY[ 400 ] })`,
		300: `var(--wp-components-color-gray-300, ${ GRAY[ 300 ] })`,
		200: `var(--wp-components-color-gray-200, ${ GRAY[ 200 ] })`,
		100: `var(--wp-components-color-gray-100, ${ GRAY[ 100 ] })`,
	},
};

const UI = {
	background: THEME.background,
	backgroundDisabled: THEME.gray[ 100 ],
	border: THEME.gray[ 600 ],
	borderHover: THEME.gray[ 700 ],
	borderFocus: THEME.accent,
	borderDisabled: THEME.gray[ 400 ],
	textDisabled: THEME.gray[ 600 ],

	// Matches @wordpress/base-styles
	darkGrayPlaceholder: `color-mix(in srgb, ${ THEME.foreground }, transparent 38%)`,
	lightGrayPlaceholder: `color-mix(in srgb, ${ THEME.background }, transparent 35%)`,
};

export const COLORS = Object.freeze( {
	/**
	 * The main gray color object.
	 * @deprecated Use semantic aliases in `COLORS.ui` or theme-ready variables in `COLORS.theme.gray`.
	 */
	gray: GRAY, // TODO: Stop exporting this when everything is migrated to `theme` or `ui`
	/**
	 * @deprecated Prefer theme-ready variables in `COLORS.theme`.
	 */
	white,
	alert: ALERT,
	/**
	 * Theme-ready variables with fallbacks.
	 *
	 * Prefer semantic aliases in `COLORS.ui` when applicable.
	 */
	theme: THEME,
	/**
	 * Semantic aliases (prefer these over raw variables when applicable).
	 */
	ui: UI,
} );

export default COLORS;
