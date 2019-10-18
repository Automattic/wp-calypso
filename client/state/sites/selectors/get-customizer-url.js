/**
 * External dependencies
 */
import { compact } from 'lodash';

/**
 * Internal dependencies
 */
import { getCustomizerFocus } from 'my-sites/customize/panels';
import { addQueryArgs } from 'lib/url';
import getSiteAdminUrl from './get-site-admin-url';
import getSiteSlug from './get-site-slug';
import isJetpackSite from './is-jetpack-site';

/**
 * Returns the customizer URL for a site, or null if it cannot be determined.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @param  {String} panel  Optional panel to autofocus
 * @return {String}        Customizer URL
 */
export default function getCustomizerUrl( state, siteId, panel ) {
	if ( ! isJetpackSite( state, siteId ) ) {
		const siteSlug = getSiteSlug( state, siteId );
		return [ '' ].concat( compact( [ 'customize', panel, siteSlug ] ) ).join( '/' );
	}

	const adminUrl = getSiteAdminUrl( state, siteId, 'customize.php' );
	if ( ! adminUrl ) {
		return null;
	}

	let returnUrl;
	if ( 'undefined' !== typeof window ) {
		returnUrl = window.location.href;
	}

	return addQueryArgs(
		{
			return: returnUrl,
			...getCustomizerFocus( panel ),
		},
		adminUrl
	);
}
