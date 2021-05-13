/**
 * External dependencies
 */
import { URL as URLString, SiteSlug, SiteId } from 'calypso/types';

/**
 * Internal Dependencies
 */
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

	// There are 2 URL positions where we should look for the site fragment:
	// last (most sections) and second-to-last (post ID is last in editor)

	// Avoid confusing the receipt ID for the site ID in domain-only checkouts.
	if ( 0 === basePath.indexOf( '/checkout/thank-you/no-site/' ) ) {
		return false;
	}

	// In some paths, the site fragment could also be in third position.
	// e.g. /me/purchases/example.wordpress.com/foo/bar
	if (
		0 === basePath.indexOf( '/me/purchases/' ) ||
		0 === basePath.indexOf( '/checkout/thank-you/' )
	) {
		const piece = pieces[ 3 ]; // 0 is the empty string before the first `/`
		if ( piece && -1 !== piece.indexOf( '.' ) ) {
			return piece;
		}
		const numericPiece = parseInt( piece, 10 );
		if ( Number.isSafeInteger( numericPiece ) ) {
			return numericPiece;
		}
	}

	// Check last and second-to-last piece for site slug
	for ( let i = 2; i > 0; i-- ) {
		const piece = pieces[ pieces.length - i ];
		if ( piece && -1 !== piece.indexOf( '.' ) ) {
			return piece;
		}
	}

	// Check last and second-to-last piece for numeric site ID
	for ( let i = 2; i > 0; i-- ) {
		const piece = pieces[ pieces.length - i ];
		// We can't just do parseInt because some strings look like numbers, eg: '404-hello'
		const isNumber = /^\d+$/.test( piece );
		const intPiece = parseInt( piece, 10 );
		if ( isNumber && Number.isSafeInteger( intPiece ) ) {
			return intPiece;
		}
	}

	// No site fragment here
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
 *
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

export function externalRedirect( url: URLString ) {
	window.location.href = url;
}
