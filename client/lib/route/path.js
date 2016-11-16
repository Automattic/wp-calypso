/** @ssr-ready **/

/**
 * External dependencies
 */
import includes from 'lodash/includes';

/**
 * Internal Dependencies
 */
const trailingslashit = require( './trailingslashit' ),
	untrailingslashit = require( './untrailingslashit' );

/**
 * Module variables
 */
const statsLocationsByTab = {
	day: '/stats/day/',
	week: '/stats/week/',
	month: '/stats/month/',
	year: '/stats/year/',
	insights: '/stats/insights/'
};

function getSiteFragment( path ) {
	const basePath = path.split( '?' )[ 0 ];
	const pieces = basePath.split( '/' );

	// There are 2 URL positions where we should look for the site fragment:
	// last (most sections) and second-to-last (post ID is last in editor)
	// Check last and second-to-last piece for site slug
	const last_piece = pieces[ pieces.length - 1 ];
	if ( last_piece && -1 !== last_piece.indexOf( '.' ) ) {
		return last_piece;
	}
	// People section can have usernames in the url that have dots in the name.
	// So we can just ignore the second to last part
	const second_to_last_piece = pieces[ 1 ] === 'people' ? '' : pieces[ pieces.length - 2 ];
	if ( second_to_last_piece && -1 !== second_to_last_piece.indexOf( '.' ) ) {
		return second_to_last_piece;
	}

	// Check last and second-to-last piece for numeric site ID
	const second_to_last_piece_int = parseInt( second_to_last_piece, 10 );
	if ( Number.isSafeInteger( second_to_last_piece_int ) ) {
		return second_to_last_piece_int;
	}

	const last_piece_int = parseInt( last_piece, 10 );
	if ( Number.isSafeInteger( last_piece_int ) ) {
		return last_piece_int;
	}

	// No site fragment here
	return false;
}

function addSiteFragment( path, site ) {
	const pieces = sectionify( path ).split( '/' );

	if ( includes( [ 'post', 'page', 'edit' ], pieces[ 1 ] ) ) {
		// Editor-style URL; insert the site as either the 2nd or 3rd piece of
		// the URL ( '/post/:site' or '/edit/:cpt/:site' )
		const sitePos = ( 'edit' === pieces[ 1 ] ? 3 : 2 );
		pieces.splice( sitePos, 0, site );
	} else {
		// Somewhere else in Calypso; add /:site onto the end
		pieces.push( site );
	}

	return pieces.join( '/' );
}

function sectionify( path ) {
	let basePath = path.split( '?' )[ 0 ];
	const site = getSiteFragment( basePath );

	if ( site ) {
		basePath = trailingslashit( basePath ).replace( '/' + site + '/', '/' );
	}
	return untrailingslashit( basePath );
}

function getStatsDefaultSitePage( slug ) {
	const path = '/stats/insights/';

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
		case 'drafts' :
			return 'draft,pending';
		// Posts scheduled in the future
		case 'scheduled' :
			return 'future';
		// Trashed posts
		case 'trashed' :
			return 'trash';
		default :
			return 'publish,private';
	}
}

function externalRedirect( url ) {
	window.location = url;
}

module.exports = {
	getSiteFragment: getSiteFragment,
	addSiteFragment: addSiteFragment,
	getStatsDefaultSitePage: getStatsDefaultSitePage,
	getStatsPathForTab: getStatsPathForTab,
	sectionify: sectionify,
	mapPostStatus: mapPostStatus,
	externalRedirect: externalRedirect
};
