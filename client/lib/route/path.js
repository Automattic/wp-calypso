/** @format */

/**
 * External dependencies
 */

import { includes } from 'lodash';

/**
 * Internal Dependencies
 */
import trailingslashit from './trailingslashit';
import untrailingslashit from './untrailingslashit';

/**
 * Module variables
 */
const statsLocationsByTab = {
	day: '/stats/day/',
	week: '/stats/week/',
	month: '/stats/month/',
	year: '/stats/year/',
	insights: '/stats/insights/',
};

function getSiteFragment( path ) {
	const basePath = path.split( '?' )[ 0 ];
	const pieces = basePath.split( '/' );

	// There are 2 URL positions where we should look for the site fragment:
	// last (most sections) and second-to-last (post ID is last in editor)

	// Check last and second-to-last piece for site slug
	for ( let i = 2; i > 0; i-- ) {
		const piece = pieces[ pieces.length - i ];
		if ( piece && -1 !== piece.indexOf( '.' ) ) {
			return piece;
		}
	}

	// Check last and second-to-last piece for numeric site ID
	for ( let i = 2; i > 0; i-- ) {
		const piece = parseInt( pieces[ pieces.length - i ], 10 );
		if ( Number.isSafeInteger( piece ) ) {
			return piece;
		}
	}

	// No site fragment here
	return false;
}

function addSiteFragment( path, site ) {
	const pieces = sectionify( path ).split( '/' );

	if ( includes( [ 'post', 'page', 'edit' ], pieces[ 1 ] ) ) {
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

function sectionifyWithRoutes( path, routes ) {
	const routeParams = {};
	if ( ! routes || ! Array.isArray( routes ) ) {
		return {
			routePath: sectionify( path, routes ),
			routeParams,
		};
	}

	let routePath = path.split( '?' )[ 0 ];
	for ( const route of routes ) {
		if ( route.match( routePath, routeParams ) ) {
			routePath = route.path;
			break;
		}
	}

	return {
		routePath: untrailingslashit( routePath ),
		routeParams,
	};
}

function sectionify( path, siteFragment ) {
	let basePath = path.split( '?' )[ 0 ];

	// Sometimes the caller knows better than `getSiteFragment` what the `siteFragment` is.
	// For example, when the `:site` parameter is not the last or second-last part of the route
	// and is retrieved from `context.params.site`. In that case, it can pass the `siteFragment`
	// explicitly as the second parameter. We call `getSiteFragment` only as a fallback.
	if ( ! siteFragment ) {
		siteFragment = getSiteFragment( basePath );
	}

	if ( siteFragment ) {
		basePath = trailingslashit( basePath ).replace( '/' + siteFragment + '/', '/' );
	}
	return untrailingslashit( basePath );
}

function getStatsDefaultSitePage( slug ) {
	const path = '/stats/day/';

	if ( slug ) {
		return path + slug;
	}

	return untrailingslashit( path );
}

function getStatsPathForTab( tab, siteIdOrSlug ) {
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

/**
 * Post status in our routes mapped to valid API values
 * @param  {string} status  Status param from route
 * @return {string}         mapped status value
 */
function mapPostStatus( status ) {
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

function externalRedirect( url ) {
	window.location = url;
}

export default {
	getSiteFragment: getSiteFragment,
	addSiteFragment: addSiteFragment,
	getStatsDefaultSitePage: getStatsDefaultSitePage,
	getStatsPathForTab: getStatsPathForTab,
	sectionify: sectionify,
	sectionifyWithRoutes: sectionifyWithRoutes,
	mapPostStatus: mapPostStatus,
	externalRedirect: externalRedirect,
};
