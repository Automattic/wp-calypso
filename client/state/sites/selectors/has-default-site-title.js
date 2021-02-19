/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import { startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import getRawSite from 'calypso/state/selectors/get-raw-site';
import getSiteSlug from './get-site-slug';

/**
 * Returns true if the site has unchanged site title
 *
 * @param {object} state Global state tree
 * @param {object} siteId Site ID
 * @returns {boolean} True if site title is default, false otherwise.
 */
export default function hasDefaultSiteTitle( state, siteId ) {
	const site = getRawSite( state, siteId );
	if ( ! site ) {
		return null;
	}
	const slug = getSiteSlug( state, siteId );
	// we are using startsWith here, as getSiteSlug returns "slug.wordpress.com"
	return site.name === i18n.translate( 'Site Title' ) || startsWith( slug, site.name );
}
