/** @format **/

/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import { get } from 'lodash';

// For now the site style step will determine which 'style pack' to use on pub/radcliffe-2
export const siteStyleOptions = {
	business: [
		{
			description: i18n.translate( 'Simple, yet sophisticated, with subtle, elegant typography.', {
				comment: 'A description of a WordPress theme style.',
			} ),
			id: 'default',
			label: 'Professional',
			theme: 'pub/professional-business',
			font: {
				name: 'Crimson Text',
				variations: [ 'n4', 'n7' ], // variations in fvd format: https://github.com/typekit/fvd
			},
		},
		{
			description: i18n.translate( 'A gutenberg-ready business variation.', {
				comment: 'A description of a WordPress theme style.',
			} ),
			id: 'modern',
			label: 'Modern',
			theme: 'pub/professional-business', // this will be 'pub/modern-business'
			font: {
				name: 'IBM Plex Sans',
				variations: [ 'n4', 'n7' ], // variations in fvd format: https://github.com/typekit/fvd
			},
		},
		{
			description: i18n.translate( 'A gutenberg-ready business variation.', {
				comment: 'A description of a WordPress theme style.',
			} ),
			id: 'sophisticated',
			label: 'Sophisticated',
			theme: 'pub/professional-business', // this will be 'pub/sophisticated-business'
			font: {
				name: 'Poppins',
				variations: [ 'n4', 'n7' ], // variations in fvd format: https://github.com/typekit/fvd
			},
		},
		{
			description: i18n.translate( 'A gutenberg-ready business variation.', {
				comment: 'A description of a WordPress theme style.',
			} ),
			id: 'calm',
			label: 'Calm',
			theme: 'pub/professional-business', // this will be 'pub/friendly-business'
			font: {
				name: 'Rubik',
				variations: [ 'n4', 'n7' ], // variations in fvd format: https://github.com/typekit/fvd
			},
		},
	],
};

export const getSiteStyleOptions = siteType =>
	get( siteStyleOptions, siteType, siteStyleOptions.business );
