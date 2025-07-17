import colorStudio from '@automattic/color-studio';
import { __ } from '@wordpress/i18n';

// Extract colors from Color Studio
const COLORS = colorStudio.colors;

// Configuration constants
export const ICON_GRID_COLUMNS = 5;
export const ICON_PICKER_MAX_HEIGHT = '310px';
export const CALLOUT_TEMPLATE_DEFAULT_COLOR = COLORS[ 'Gray 60' ];
export const CALLOUT_TEMPLATE_DEFAULT_BACKGROUND_COLOR = COLORS.White;

// Callout template definitions
export const CALLOUT_TEMPLATES = {
	custom: {
		name: __( 'Custom' ),
		color: CALLOUT_TEMPLATE_DEFAULT_COLOR,
		icon: 'dashicons-megaphone',
	},
	info: {
		name: __( 'Info' ),
		color: COLORS[ 'Simplenote Blue 40' ],
		icon: 'dashicons-info-outline',
	},
	tip: {
		name: __( 'Tip' ),
		color: COLORS[ 'Celadon 40' ],
		icon: 'dashicons-lightbulb',
	},
	example: {
		name: __( 'Example' ),
		color: COLORS[ 'Purple 40' ],
		icon: 'dashicons-edit-page',
	},
	warning: {
		name: __( 'Warning' ),
		color: COLORS[ 'Red 40' ],
		icon: 'dashicons-flag',
	},
};

// Color palette for the color picker
export const CALLOUT_PANEL_COLORS = [
	{ name: __( 'Simplenote Blue' ), color: COLORS[ 'Simplenote Blue 40' ] },
	{ name: __( 'Automattic Blue' ), color: COLORS[ 'Automattic Blue 40' ] },
	{ name: __( 'WordPress Blue' ), color: COLORS[ 'Blue 40' ] },
	{ name: __( 'WooCommerce Purple' ), color: COLORS[ 'WooCommerce Purple 40' ] },
	{ name: __( 'Purple' ), color: COLORS[ 'Purple 40' ] },
	{ name: __( 'Pink' ), color: COLORS[ 'Pink 40' ] },
	{ name: __( 'Red' ), color: COLORS[ 'Red 40' ] },
	{ name: __( 'Orange' ), color: COLORS[ 'Orange 40' ] },
	{ name: __( 'Yellow' ), color: COLORS[ 'Yellow 40' ] },
	{ name: __( 'Green' ), color: COLORS[ 'Green 40' ] },
	{ name: __( 'Jetpack Green' ), color: COLORS[ 'Jetpack Green 40' ] },
	{ name: __( 'Celadon' ), color: COLORS[ 'Celadon 40' ] },
	{ name: __( 'Gray 40' ), color: COLORS[ 'Gray 40' ] },
	{ name: __( 'Gray 60' ), color: COLORS[ 'Gray 60' ] },
	{ name: __( 'Gray 80' ), color: COLORS[ 'Gray 80' ] },
];

// Background color palette for the background color picker
export const CALLOUT_PANEL_BACKGROUND_COLORS = [
	{ name: __( 'Light Simplenote Blue' ), color: COLORS[ 'Simplenote Blue 0' ] },
	{ name: __( 'Light Automattic Blue' ), color: COLORS[ 'Automattic Blue 0' ] },
	{ name: __( 'Light WordPress Blue' ), color: COLORS[ 'Blue 0' ] },
	{ name: __( 'Light WooCommerce Purple' ), color: COLORS[ 'WooCommerce Purple 0' ] },
	{ name: __( 'Light Purple' ), color: COLORS[ 'Purple 0' ] },
	{ name: __( 'Light Pink' ), color: COLORS[ 'Pink 0' ] },
	{ name: __( 'Light Red' ), color: COLORS[ 'Red 0' ] },
	{ name: __( 'Light Orange' ), color: COLORS[ 'Orange 0' ] },
	{ name: __( 'Light Yellow' ), color: COLORS[ 'Yellow 0' ] },
	{ name: __( 'Light Green' ), color: COLORS[ 'Green 0' ] },
	{ name: __( 'Light Jetpack Green' ), color: COLORS[ 'Jetpack Green 0' ] },
	{ name: __( 'Light Celadon' ), color: COLORS[ 'Celadon 0' ] },
	{ name: __( 'Gray 0' ), color: COLORS[ 'Gray 0' ] },
	{ name: __( 'Gray 10' ), color: COLORS[ 'Gray 10' ] },
	{ name: __( 'Gray 20' ), color: COLORS[ 'Gray 20' ] },
	{ name: __( 'White' ), color: COLORS.White },
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
