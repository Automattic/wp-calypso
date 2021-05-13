/**
 * Internal dependencies
 */
import { withoutHttp } from 'calypso/lib/url';
import getRawSite from 'calypso/state/selectors/get-raw-site';
import getSiteOption from './get-site-option';
import isJetpackSite from './is-jetpack-site';

/**
 * Determines if a Jetpack site is a secondary network site.
 * Returns null if the site is not known or is not a Jetpack site.
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {?boolean} true if the site is a secondary network site
 */
export default function isJetpackSiteSecondaryNetworkSite( state, siteId ) {
	const site = getRawSite( state, siteId );

	if ( ! site || ! isJetpackSite( state, siteId ) ) {
		return null;
	}

	if ( ! site.is_multisite ) {
		return false;
	}

	const unmappedUrl = getSiteOption( state, siteId, 'unmapped_url' );
	const mainNetworkSite = getSiteOption( state, siteId, 'main_network_site' );

	if ( ! unmappedUrl || ! mainNetworkSite ) {
		return false;
	}

	// Compare unmapped_url with the main_network_site to see if is not the main network site.
	return withoutHttp( unmappedUrl ) !== withoutHttp( mainNetworkSite );
}
