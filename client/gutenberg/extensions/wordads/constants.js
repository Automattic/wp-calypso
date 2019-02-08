/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

export const DEFAULT_FORMAT = 'mrec';
export const AD_FORMATS = [
	{
		name: __( 'Rectangle 300x250' ),
		tag: DEFAULT_FORMAT,
		height: 250,
		width: 300,
	},
	{
		name: __( 'Leaderboard 728x90' ),
		tag: 'leaderboard',
		height: 90,
		width: 728,
	},
	{
		name: __( 'Mobile Leaderboard 320x50' ),
		tag: 'mobile_leaderboard',
		height: 50,
		width: 320,
	},
	{
		name: __( 'Wide Skyscraper 160x600' ),
		tag: 'wideskyscraper',
		height: 600,
		width: 160,
	},
];
