/** @format **/
/**
 * Exernal dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */

/**
 * Current list of verticals that have/will have landing pages.
 * A user who comes in via a landing page will not see the Site Topic dropdown.
 */
export const allSiteTypes = [
	{
		type: i18n.translate( 'blogger' ),
		description: i18n.translate( 'Share a collection of posts.' ),
	},
	{
		type: i18n.translate( 'business' ),
		description: i18n.translate( 'Promote products and services.' ),
	},
	{
		type: i18n.translate( 'professional' ),
		description: i18n.translate( 'Showcase your portfolio and work.' ),
	},
	{
		type: i18n.translate( 'educator' ),
		description: i18n.translate( 'Share school projects and class info.' ),
	},
	{
		type: i18n.translate( 'non-profit organization' ),
		description: i18n.translate( 'Raise money and awareness for a cause.' ),
	},
];

function isSiteTypeInList( siteType ) {
	const allSiteTypesFiltered = allSiteTypes.map( elem => {
		return elem.type;
	} );
	const sanitizedSiteTypes = allSiteTypesFiltered.map( dasherize );
	siteType = dasherize( siteType );
	return allSiteTypesFiltered.includes( siteType ) || sanitizedSiteTypes.includes( siteType );
}

export function dasherize( string ) {
	return string
		.toLowerCase()
		.replace( / /g, '-' )
		.replace( /-+/, '-' );
}

export function isValidLandingPageSiteType( siteType ) {
	if ( ! siteType || siteType === '' ) {
		return false;
	}
	return isSiteTypeInList( siteType );
}
