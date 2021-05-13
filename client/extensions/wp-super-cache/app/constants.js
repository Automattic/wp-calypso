/**
 * Internal dependencies
 */

import { translate } from 'i18n-calypso';

export const WPSC_MIN_VERSION = '1.5.4';

export const Tabs = {
	EASY: {
		label: translate( 'Easy' ),
		slug: '',
	},
	ADVANCED: {
		label: translate( 'Advanced' ),
		slug: 'advanced',
	},
	CDN: {
		label: translate( 'CDN' ),
		slug: 'cdn',
	},
	CONTENTS: {
		label: translate( 'Contents' ),
		slug: 'contents',
	},
	PRELOAD: {
		label: translate( 'Preload' ),
		slug: 'preload',
	},
	PLUGINS: {
		label: translate( 'Plugins' ),
		slug: 'plugins',
		minVersion: '1.5.6', // The /plugins endpoint is only present in WPSC 1.5.6 and later!
	},
	DEBUG: {
		label: translate( 'Debug' ),
		slug: 'debug',
	},
};
