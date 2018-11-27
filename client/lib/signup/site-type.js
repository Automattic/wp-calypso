/** @format **/
/**
 * Exernal dependencies
 */
import i18n from 'i18n-calypso';
import { find } from 'lodash';

/**
 * Internal dependencies
 */

/**
 * Current list of site types that are displayed in the signup site-type step
 * Some (or all) of these site types will also have landing pages.
 * A user who comes in via a landing page will not see the Site Topic dropdown.
 */
export const allSiteTypes = [
	{
		id: 'blog',
		slug: 'blog',
		label: i18n.translate( 'Blog' ),
		description: i18n.translate( 'Share and discuss ideas, updates, or creations.' ),
		theme: 'pub/independent-publisher-2',
		designType: 'blog',
	},
	{
		id: 'business',
		slug: 'business',
		label: i18n.translate( 'Business' ),
		description: i18n.translate( 'Promote products and services.' ),
		theme: 'pub/radcliffe-2',
		designType: 'page',
	},
	{
		id: 'professional',
		slug: 'professional',
		label: i18n.translate( 'Professional' ),
		description: i18n.translate( 'Showcase your portfolio and work.' ),
		theme: 'pub/altofocus',
		designType: 'portfolio',
	},
	{
		id: 'education',
		slug: 'education',
		label: i18n.translate( 'Education' ),
		description: i18n.translate( 'Share school projects and class info.' ),
		theme: 'pub/twentyfifteen',
		designType: 'blog',
	},
	{
		id: 'store',
		slug: 'online-store',
		label: i18n.translate( 'Online store' ),
		description: i18n.translate( 'Sell your collection of products online. ' ),
		theme: 'pub/dara',
		designType: 'store',
	},
];

export function getSiteTypePropertyValue( key, value, property ) {
	if ( ! value ) {
		return;
	}

	const siteTypeProperties = find( allSiteTypes, { [ key ]: value } );

	return siteTypeProperties && siteTypeProperties[ property ];
}
