/** @format **/

/**
 * Internal dependencies
 */
import { getSiteTypePropertyValue } from 'lib/signup/site-type';

export const siteStyleOptions = {
	business: [
		{
			label: 'Modern',
			name: 'modern',
			value: 'pub/business',
		},
		{
			label: 'Pro',
			name: 'pro',
			value: 'pub/business-professional',
		},
		{
			label: 'Minimal',
			name: 'minimal',
			value: 'pub/business-minimal',
		},
		{
			label: 'Elegant',
			name: 'elegant',
			value: 'pub/business-elegant',
		},
	],
};

export const getSiteStyleOptions = siteType =>
	getSiteTypePropertyValue( 'slug', siteType, 'slug' ) && siteStyleOptions[ siteType ]
		? siteStyleOptions[ siteType ]
		: siteStyleOptions.business;
