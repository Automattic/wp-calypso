import { addQueryArgs } from '@wordpress/url';
import { isSelfHostedJetpackConnected } from './site-types';
import type { Site } from '@automattic/api-core';

/**
 * Returns a user-friendly version of the site's URL.
 *
 * This not only produces a clean version of the site's domain, but
 * also deals with the case of Jetpack multi-sites using subdirectory
 * installations.
 */
export function getSiteDisplayUrl( site: Site ) {
	if ( site.options?.is_redirect ) {
		return site.slug;
	}
	return site.URL.replace( 'https://', '' ).replace( 'http://', '' );
}

/**
 * Returns the actual formatted URL for the site considering site redirects
 */
export function getSiteFormattedUrl( site: Site ) {
	if ( site.options?.is_redirect && site.options?.unmapped_url ) {
		return site.options.unmapped_url;
	}
	return site.URL;
}

/**
 * Returns the URL for editing the site.
 */
export function getSiteEditUrl( site: Site, isSiteUsingBlockTheme?: boolean ) {
	const location = typeof window !== 'undefined' ? window.location : null;
	const queryArgs: Record< string, string > = {};
	const siteAdminUrl = site.options?.admin_url;

	if ( isSiteUsingBlockTheme ) {
		if ( location && location.origin !== 'https://wordpress.com' ) {
			queryArgs.calypso_origin = location.origin;
		}

		return addQueryArgs( `${ siteAdminUrl }site-editor.php`, queryArgs );
	}

	if ( location ) {
		queryArgs.return = location.href;
	}

	return addQueryArgs( `${ siteAdminUrl }customize.php`, queryArgs );
}

/**
 * Returns the URL for the site visibility settings page.
 */
export function getSiteVisibilityURL( site: Site, queryArgs?: { back_to: 'site-overview' } ) {
	if ( isSelfHostedJetpackConnected( site ) ) {
		return undefined;
	}

	return addQueryArgs( `/sites/${ site.slug }/settings/site-visibility`, queryArgs );
}
