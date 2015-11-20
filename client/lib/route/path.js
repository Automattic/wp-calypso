/**
 * Internal Dependencies
 */
var trailingslashit = require( './trailingslashit' ),
	untrailingslashit = require( './untrailingslashit' ),
	abtest = require( 'lib/abtest' ).abtest,
	config = require( 'config' );

/**
 * Module variables
 */
var statsLocationsByTab = {
	day: '/stats/day/',
	week: '/stats/week/',
	month: '/stats/month/',
	year: '/stats/year/',
	insights: '/stats/insights/'
};

function getSiteFragment( path ) {
	var basePath = path.split( '?' )[0],
		pieces = basePath.split( '/' ),
		siteOldStyle = pieces[ pieces.length - 1 ],
		siteNewStyle = pieces[2] || '';

	if ( siteNewStyle.indexOf( '.' ) >= 0 ) {
		// This is a new-style URL like /:section/:site[/:filter/...]
		return siteNewStyle;
	} else if ( siteOldStyle.indexOf( '.' ) >= 0 ) {
		// This is an old-style URL like /:section/:filter/:site
		return siteOldStyle;
	} else if ( siteNewStyle && ! isNaN( siteNewStyle ) ) {
		// Allow numeric site IDs in /:section/:site[/:filter/...]
		return parseInt( siteNewStyle, 10 );
	} else if ( siteOldStyle && ! isNaN( siteOldStyle ) ) {
		// Allow numeric site IDs in /:section/:filter/:site
		return parseInt( siteOldStyle, 10 );
	} else {
		// No site fragment here
		return false;
	}
}

function addSiteFragment( path, site ) {
	var pieces = sectionify( path ).split( '/' );

	if ( pieces[1] === 'post' || pieces[1] === 'page' ) {
		// New-style URL; change /:section[/:filter/...] into /:section/:site/[:filter/...]
		pieces.splice( 2, 0, site );
	} else {
		// Old-style URL; add /:site onto the end
		pieces.push( site );
	}

	return pieces.join( '/' );
}

function sectionify( path ) {
	var basePath = path.split( '?' )[0],
		site = getSiteFragment( basePath );

	if ( site ) {
		basePath = trailingslashit( basePath ).replace( '/' + site + '/', '/' );
	}
	return untrailingslashit( basePath );
}

function getStatsDefaultSitePage( slug ) {
	var path;

	if ( config.isEnabled( 'manage/stats/insights' ) && 'insights' === abtest( 'statsDefaultFilter' ) ) {
		path = '/stats/insights/';
	} else {
		path = '/stats/day/';
	}

	if ( slug ) {
		return path + slug;
	}

	return untrailingslashit( path );
}

function getStatsPathForTab( tab, siteIdOrSlug ) {
	var path;

	if ( ! tab ) {
		return getStatsDefaultSitePage( siteIdOrSlug );
	}

	if ( tab === 'insights' && ! siteIdOrSlug ) {
		// Insights only supports single-site - Link to an overview for now
		return getStatsDefaultSitePage();
	}

	path = statsLocationsByTab[ tab ];

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

module.exports = {
	getSiteFragment: getSiteFragment,
	addSiteFragment: addSiteFragment,
	getStatsDefaultSitePage: getStatsDefaultSitePage,
	getStatsPathForTab: getStatsPathForTab,
	sectionify: sectionify,
	mapPostStatus: mapPostStatus
};
