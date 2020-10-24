/**
 * External dependencies
 */
import { compact } from 'lodash';

/**
 * Internal dependencies
 */
import { getCustomizerFocus } from 'calypso/my-sites/customize/panels';
import { addQueryArgs } from 'calypso/lib/url';
import getSiteAdminUrl from './get-site-admin-url';
import getSiteSlug from './get-site-slug';
import isJetpackSite from './is-jetpack-site';

/**
 * Returns the customizer URL for a site, or null if it cannot be determined.
 *
 * @param   {object}  state     Global state tree
 * @param   {?number} siteId    Site ID
 * @param   {string}  panel     Optional panel to autofocus
 * @param   {string}  returnUrl Optional return url for when the user closes the customizer
 * @returns {string}            Customizer URL
 */
export default function getCustomizerUrl( state, siteId, panel, returnUrl ) {
	if ( ! isJetpackSite( state, siteId ) ) {
		const siteSlug = getSiteSlug( state, siteId );
		const url = [ '' ].concat( compact( [ 'customize', panel, siteSlug ] ) ).join( '/' );
		return addQueryArgs(
			{
				return: returnUrl,
			},
			url
		);
	}

	const adminUrl = getSiteAdminUrl( state, siteId, 'customize.php' );

	if ( ! adminUrl ) {
		return null;
	}

	if ( ! returnUrl && 'undefined' !== typeof window ) {
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
