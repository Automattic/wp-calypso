import { SiteId, SiteSlug, URL as URLString } from 'calypso/types';
import { trailingslashit, untrailingslashit } from './index';

/**
 * Module variables
 */
const statsLocationsByTab = {
	day: '/stats/day/',
	week: '/stats/week/',
	month: '/stats/month/',
	year: '/stats/year/',
	insights: '/stats/insights/',
	googleMyBusiness: '/google-my-business/stats/',
};

export function getSiteFragment( path: URLString ): SiteSlug | SiteId | false {
	const basePath = path.split( '?' )[ 0 ];
	const pieces = basePath.split( '/' );

	// Some paths include a receipt or subscription ID that can be mistaken for a site ID.
	// Always return false for these specific paths.
	if (
		// Avoid confusing the receipt ID for the site ID in domain-only checkouts.
		0 === basePath.indexOf( '/checkout/thank-you/no-site/' ) ||
		// Avoid confusing the subscription ID for the site ID in gifting checkouts.
		( basePath.includes( '/gift/' ) && basePath.startsWith( '/checkout/' ) ) ||
		// Avoid confusing the subscription ID for the site ID in Akismet checkouts.
		( basePath.includes( '/akismet/' ) && basePath.startsWith( '/checkout/' ) ) ||
		// Avoid confusing the subscription ID for the site ID in Marketplace checkouts.
		( basePath.includes( '/marketplace/' ) && basePath.startsWith( '/checkout/' ) )
	) {
		return false;
	}

	// By default there are two URL positions where we should look for the site fragment:
	// last (most sections) and second-to-last (post ID is last in editor).
	// searchPositions defines the second-to-last and last index positions to search. Order matters.
	let searchPositions = [ pieces.length - 2, pieces.length - 1 ];

	// There are exceptions. In some paths the site fragment could also be in the third position.
	// e.g. /me/purchases/example.wordpress.com/foo/bar
	if (
		0 === basePath.indexOf( '/me/purchases/' ) ||
		0 === basePath.indexOf( '/checkout/thank-you/' )
	) {
		searchPositions = [ 3, pieces.length - 2, pieces.length - 1 ];
	}
	// For this specific path, the site fragment is in the last index position.
	// e.g /checkout/offer-professional-email/new-domain.com/example.wordpress.com (last)
	else if (
		basePath.includes( '/offer-professional-email/' ) &&
		basePath.startsWith( '/checkout/' )
	) {
		searchPositions = [ pieces.length - 1 ];
	}

	// Search for site slug in the URL positions defined in searchPositions.
	for ( let i = 0; i < searchPositions.length; i++ ) {
		const piece = pieces[ searchPositions[ i ] ];

		if ( piece && -1 !== piece.indexOf( '.' ) ) {
			// There is a special Jetpack case for site slugs that end with '::'.
			return piece.endsWith( '::' ) ? piece.replace( /::$/, '' ) : piece;
		}
	}

	// If a site slug is not found search for a site ID in the URL positions defined in searchPositions.
	for ( let i = 0; i < searchPositions.length; i++ ) {
		const piece = pieces[ searchPositions[ i ] ];

		// We can't just do parseInt because some strings look like numbers, eg: '404-hello'
		const isNumber = /^\d+$/.test( piece );
		const intPiece = parseInt( piece, 10 );
		if ( isNumber && Number.isSafeInteger( intPiece ) ) {
			return intPiece;
		}
	}

	// No site fragment found.
	return false;
}

export function addSiteFragment( path: URLString, site: SiteSlug ): URLString {
	const pieces = sectionify( path ).split( '/' );

	if ( [ 'post', 'page', 'edit' ].includes( pieces[ 1 ] ) ) {
		// Editor-style URL; insert the site as either the 2nd or 3rd piece of
		// the URL ( '/post/:site' or '/edit/:cpt/:site' )
		const sitePos = 'edit' === pieces[ 1 ] ? 3 : 2;
		pieces.splice( sitePos, 0, site );
	} else {
		// Somewhere else in Calypso; add /:site onto the end
		pieces.push( site );
	}

	return pieces.join( '/' );
}

export function sectionify( path: URLString, siteFragment?: SiteSlug | SiteId ): URLString {
	let basePath = path.split( '?' )[ 0 ];
	let fragment: SiteSlug | SiteId | false | undefined = siteFragment;

	// Sometimes the caller knows better than `getSiteFragment` what the `siteFragment` is.
	// For example, when the `:site` parameter is not the last or second-last part of the route
	// and is retrieved from `context.params.site`. In that case, it can pass the `siteFragment`
	// explicitly as the second parameter. We call `getSiteFragment` only as a fallback.
	if ( ! fragment ) {
		fragment = getSiteFragment( basePath );
	}

	if ( fragment ) {
		basePath = trailingslashit( basePath ).replace( '/' + fragment + '/', '/' );
	}
	return untrailingslashit( basePath );
}

export function getStatsDefaultSitePage( siteFragment?: SiteId | SiteSlug ): URLString {
	const path = '/stats/day/';

	if ( siteFragment ) {
		return path + String( siteFragment );
	}

	return untrailingslashit( path );
}

export function getStatsPathForTab(
	tab: keyof typeof statsLocationsByTab,
	siteIdOrSlug: SiteId | SiteSlug
): URLString {
	if ( ! tab ) {
		return getStatsDefaultSitePage( siteIdOrSlug );
	}

	if ( tab === 'insights' && ! siteIdOrSlug ) {
		// Insights only supports single-site - Link to an overview for now
		return getStatsDefaultSitePage();
	}

	const path = statsLocationsByTab[ tab ];

	if ( ! path ) {
		return getStatsDefaultSitePage( siteIdOrSlug );
	}

	if ( ! siteIdOrSlug ) {
		return untrailingslashit( path );
	}

	return untrailingslashit( path + siteIdOrSlug );
}

export function getMessagePathForJITM( path: URLString, siteFragment?: SiteSlug | SiteId ): string {
	let messagePath = sectionify( path, siteFragment ).replace( /^\/+/, '' );

	// simplify stats paths
	messagePath = messagePath.replace( /^(stats)\/\w+/, '$1' );

	return messagePath.replace( /\//g, '-' );
}

// TODO: Add status enum (see `client/my-sites/pages/main.jsx`).
/**
 * Post status in our routes mapped to valid API values
 * @param status  Status param from route
 * @returns        mapped status value
 */
export function mapPostStatus( status: string ): string {
	switch ( status ) {
		// Drafts
		case 'drafts':
			return 'draft,pending';
		// Posts scheduled in the future
		case 'scheduled':
			return 'future';
		// Trashed posts
		case 'trashed':
			return 'trash';
		default:
			return 'publish,private';
	}
}
