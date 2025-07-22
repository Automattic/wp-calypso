import { addQueryArgs } from '@wordpress/url';
import type { Site } from '../data/types';

/**
 * Returns a user-friendly version of the site's URL.
 *
 * This not only produces a clean version of the site's domain, but
 * also deals with the case of Jetpack multi-sites using subdirectory
 * installations.
 */
export function getSiteDisplayUrl( site: Site ) {
	return site.URL.replace( 'https://', '' ).replace( 'http://', '' );
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
