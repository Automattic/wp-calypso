
/**
 * External dependencies
 */

var sum = require( 'lodash/math/sum' ),
	isEqual = require( 'lodash/lang/isEqual' ),
	debug = require( 'debug' )( 'calypso:posts:post-counts-store' );

/**
 * Internal dependencies
 */
var emitter = require( 'lib/mixins/emitter' ),
	PostListStore = require( './post-list-store-factory' )(),
	PostsStore = require( './posts-store' ),
	sites = require( 'lib/sites-list' )(),
	postUtils = require( 'lib/posts/utils' ),
	Dispatcher = require( 'dispatcher' );

var _counts = {},
	PostCountsStore;

/**
 * Get a normalized numberic siteId
 * @param {String|Integer} id - A site id (numeric site ID, site.slug, or API $site path fragment
 * @return {Integer} - normalized numeric site id
 */
function getSiteId( id ) {
	var site, siteId;

	id = id || PostListStore.getSiteID();

	site = sites.getSite( id );

	if ( site ) {
		siteId = site.ID;
	}

	return siteId;
}

/**
 * PostCountsStore
 */
PostCountsStore = {

	/**
	 * Return statuses of current site
	 *
	 * @param {String|Number} [id] - site_ID
	 * @param {Boolean} [scope] - `all` or `mine`
	 * @return {Object} statuses
	 */
	get: function( id, scope ) {
		var statuses, siteId;

		siteId = getSiteId( id );

		if ( ! siteId ) {
			return null;
		}

		scope = scope || 'all';

		statuses = _counts[ siteId ] ? _counts[ siteId ][ scope ] : null;

		debug( '[%s][%s] statuses: %o', siteId, scope, statuses );
		return statuses;
	},

	getTotalCount: function( id, scope ) {
		var statuses, total, siteId;

		scope = scope || 'all';
		siteId = getSiteId( id );

		if ( ! siteId ) {
			return null;
		}

		statuses = _counts[ siteId ] ? _counts[ siteId ][ scope ] : null;
		total = 0;

		if ( statuses ) {
			total = sum( statuses );
		}

		debug( '[%s][%s] total: %o ', siteId, scope, total );

		return total;
	}
};

emitter( PostCountsStore );

PostCountsStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;
	var data = action.data;

	Dispatcher.waitFor( [ PostsStore.dispatchToken ] );

	switch ( action.type ) {
		case 'RECEIVE_UPDATED_POSTS':
		case 'RECEIVE_POSTS_PAGE':
			if ( data && data.meta && data.meta.data && data.meta.data.counts ) {
				setPostCounts( data.meta.data.counts );
			}
			break;

		case 'RECEIVE_POST_COUNTS':
			if ( data && data.counts && action.siteId ) {
				setPostCounts( data, action.siteId );
			}
			break;

		case 'RECEIVE_UPDATED_POST':
			if ( action.post && ! postUtils.isPage( action.post ) ) {
				updateCountsWhenPostChanges( action.post, action.original );
			}
			break;
		case 'RECEIVE_POST_BEING_EDITED':
			if ( action.post && ! postUtils.isPage( action.post ) ) {
				if ( action.original ) {
					updateCountsWhenPostChanges( action.post, action.original );
				} else if ( action.isNew ) {
					updateCountsOnNewPost( action.post );
				}
			}
			break;
	}
} );

/**
 * Store post counts
 *
 * @param {Object} counts - post counts
 * @param {String|Number} siteID - identifier for the site
 * @return {void}
 */
function setPostCounts( counts, siteID ) {
	var siteId = getSiteId( siteID );

	if ( isEqual( counts, _counts[ siteId ] ) ) {
		return debug( 'No changes' );
	}

	_counts[ siteId ] = counts.counts;
	debug( '[%s] update statuses: %o', siteId || 'All my sites', counts.counts );
	PostCountsStore.emit( 'change' );
}

/**
 * Update post counts when a post is edited
 *
 * @param {Object} post - current post state
 * @param {Object} original - previous post state
 * @return {void}
 */
function updateCountsWhenPostChanges( post, original ) {
	var siteId;

	if ( ! post || ! original ) {
		return debug( 'Post states are not defined' );
	}

	siteId = post.site_ID;

	if ( ! siteId ) {
		return debug( 'No site ID defined' );
	}

	debug( 'comparing `%s` == `%s`', post.status, original.status );
	if ( post.status === original.status ) {
		debug( '[%s] %o post has not changed its status', post.site_ID, post.ID );
		return;
	}

	changeCounts( post, original, PostCountsStore.get( siteId, 'all' ) );
	changeCounts( post, original, PostCountsStore.get( siteId, 'mine' ) );

	PostCountsStore.emit( 'change' );
}

/*
 * Update post counts when a post is created
 *
 * @param {Object} post - current post state
 */
function updateCountsOnNewPost( post ) {
	var siteId = post.site_ID;

	if ( ! siteId ) {
		return debug( 'No site ID defined' );
	}

	changeCounts( post, null, PostCountsStore.get( siteId, 'all' ) );
	changeCounts( post, null, PostCountsStore.get( siteId, 'mine' ) );

	PostCountsStore.emit( 'change' );
}

/**
 * Modify statuses depending on the changes of the given post
 *
 * @param {Object} post - current post state
 * @param {Object} original - previous post state
 * @param {Object} counts - current counts
 * @return {void}
 */
function changeCounts( post, original, counts ) {
	if ( ! post || ! counts ) {
		return;
	}

	if ( 'undefined' === typeof counts[ post.status ] ) {
		debug( 'Add new post status `%s`', post.status );
		counts[ post.status ] = 0;
	}

	counts[ post.status ]++;
	debug( '%s status incremented to %o', post.status, counts[ post.status ] );

	if ( original ) {
		counts[ original.status ]--;
		debug( '%s status decremented to %o', original.status, counts[ original.status ] );
	}
}

/**
 * Expose module
 */
module.exports = PostCountsStore;
