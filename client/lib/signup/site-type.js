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
export const allSiteTypes = {
	blog: {
		label: i18n.translate( 'Blog' ),
		value: 'Blog',
		queryParam: 'blog',
		description: i18n.translate( 'Share and discuss ideas, updates, or creations.' ),
	},
	business: {
		label: i18n.translate( 'Business' ),
		value: 'Business',
		queryParam: 'business',
		description: i18n.translate( 'Promote products and services.' ),
	},
	professional: {
		label: i18n.translate( 'Professional' ),
		value: 'Professional',
		queryParam: 'professional',
		description: i18n.translate( 'Showcase your portfolio and work.' ),
	},
	education: {
		label: i18n.translate( 'Education' ),
		value: 'Education',
		queryParam: 'education',
		description: i18n.translate( 'Share school projects and class info.' ),
	},
	store: {
		label: i18n.translate( 'Online store' ),
		value: 'Online store',
		queryParam: 'online-store',
		description: i18n.translate( 'Sell your collection of products online. ' ),
	},
};

export function getLabelForSiteType( queryParam ) {
	const siteTypeProperties = find( allSiteTypes, object => {
		return queryParam === object.queryParam;
	} );
	return siteTypeProperties && siteTypeProperties.value;
}
