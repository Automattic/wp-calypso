import { __ } from '@wordpress/i18n';

// Base color palette - these match the $callout-template-colors in style.js
// Uses hex values from https://github.com/Automattic/color-studio/blob/trunk/dist/colors.json
const COLOR_PALETTE = {
	simplenoteBlue: '#618df2',
	automatticBlue: '#24a3e0',
	wordPressBlue: '#7b90ff',
	wooCommercePurple: '#a77eff',
	purple: '#c475bd',
	pink: '#eb6594',
	red: '#f86368',
	orange: '#e68b28',
	yellow: '#deb100',
	green: '#00ba37',
	jetpackGreen: '#2fb41f',
	celadon: '#09b585',
	gray30: '#8c8f94',
	gray50: '#646970',
	gray70: '#3c434a',
};

// Configuration constants
export const ICON_GRID_COLUMNS = 5;
export const ICON_PICKER_MAX_HEIGHT = '310px';
export const CALLOUT_TEMPLATE_DEFAULT_COLOR = COLOR_PALETTE.gray50;

// Callout template definitions
export const CALLOUT_TEMPLATES = {
	custom: {
		name: __( 'Custom' ),
		color: CALLOUT_TEMPLATE_DEFAULT_COLOR,
		icon: 'dashicons-megaphone',
	},
	info: {
		name: __( 'Info' ),
		color: COLOR_PALETTE.simplenoteBlue,
		icon: 'dashicons-info-outline',
	},
	tip: {
		name: __( 'Tip' ),
		color: COLOR_PALETTE.celadon,
		icon: 'dashicons-lightbulb',
	},
	example: {
		name: __( 'Example' ),
		color: COLOR_PALETTE.purple, // Ensures consistency with Purple color
		icon: 'dashicons-edit-page',
	},
	warning: {
		name: __( 'Warning' ),
		color: COLOR_PALETTE.red,
		icon: 'dashicons-flag',
	},
};

// Color palette for the color picker
export const CALLOUT_PANEL_COLORS = [
	{ name: __( 'Simplenote Blue' ), color: COLOR_PALETTE.simplenoteBlue },
	{ name: __( 'Automattic Blue' ), color: COLOR_PALETTE.automatticBlue },
	{ name: __( 'WordPress Blue' ), color: COLOR_PALETTE.wordPressBlue },
	{ name: __( 'WooCommerce Purple' ), color: COLOR_PALETTE.wooCommercePurple },
	{ name: __( 'Purple' ), color: COLOR_PALETTE.purple },
	{ name: __( 'Pink' ), color: COLOR_PALETTE.pink },
	{ name: __( 'Red' ), color: COLOR_PALETTE.red },
	{ name: __( 'Orange' ), color: COLOR_PALETTE.orange },
	{ name: __( 'Yellow' ), color: COLOR_PALETTE.yellow },
	{ name: __( 'Green' ), color: COLOR_PALETTE.green },
	{ name: __( 'Jetpack Green' ), color: COLOR_PALETTE.jetpackGreen },
	{ name: __( 'Celadon' ), color: COLOR_PALETTE.celadon },
	{ name: __( 'Gray 30' ), color: COLOR_PALETTE.gray30 },
	{ name: __( 'Gray 50' ), color: COLOR_PALETTE.gray50 },
	{ name: __( 'Gray 70' ), color: COLOR_PALETTE.gray70 },
];

// Dashicons for the icon picker
export const CALLOUT_PANEL_DASHICONS = [
	// Popular documentation icons
	'dashicons-megaphone',
	'dashicons-info-outline',
	'dashicons-lightbulb',
	'dashicons-edit-page',
	'dashicons-flag',
	'dashicons-star-filled',
	'dashicons-bell',
	'dashicons-warning',
	'dashicons-format-quote',
	'dashicons-admin-comments',
	'dashicons-editor-code',
	'dashicons-editor-paragraph',
	'dashicons-admin-tools',
	'dashicons-filter',
	'dashicons-lock',
	'dashicons-yes-alt',
	'dashicons-dismiss',
	'dashicons-plus-alt',
	'dashicons-visibility',
	'dashicons-hidden',

	// Work related icons
	'dashicons-wordpress-alt',
	'dashicons-chart-bar',
	'dashicons-chart-area',
	'dashicons-database',
	'dashicons-cloud',

	// Social and media related icons
	'dashicons-heart',
	'dashicons-groups',
	'dashicons-buddicons-activity',
	'dashicons-games',
	'dashicons-coffee',
	'dashicons-format-image',
	'dashicons-video-alt3',
	'dashicons-format-audio',
	'dashicons-camera-alt',
	'dashicons-video-alt2',
];
