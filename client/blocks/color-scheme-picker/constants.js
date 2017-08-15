/** @format */
/**
 * Internal dependencies
 */
import { translate } from 'i18n-calypso';

export const ColorSchemes = [
	{
		label: translate( 'Default' ),
		value: 'default',
		thumbnail: {
			cssClass: 'is-default-theme',
		},
	},
	{
		label: translate( 'Light' ),
		value: 'light',
		thumbnail: {
			cssClass: 'is-light-theme',
		},
	},
	{
		label: translate( 'Dark' ),
		value: 'dark',
		thumbnail: {
			cssClass: 'is-dark-theme',
		},
	},
];
