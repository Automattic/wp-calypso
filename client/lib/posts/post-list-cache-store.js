/**
 * External dependencies
 */
var intersection = require( 'lodash/array/intersection' );

/**
 * Internal dependencies
 */
var sites = require( 'lib/sites-list' )(),
	Dispatcher = require( 'dispatcher' );

var _cache = {},
	TTL_IN_MS = 5 * 60 * 1000; // five minutes

function isStale( list ) {
	var now = new Date().getTime(),
		timeSaved = list.timeSaved;
	return ( now - timeSaved ) > TTL_IN_MS;
}

function getCacheKey( options ) {
	var cacheKey = '',
		keys = Object.keys( options ).sort();

	keys.forEach( function( key ) {
		if ( cacheKey.length ) {
			cacheKey += ':';
		}

		cacheKey += key + '-' + options[ key ];
	} );

	return cacheKey;
}

function get( query ) {
	var key = getCacheKey( query );

	if ( _cache[ key ] && ! isStale( _cache[ key ] ) && ! _cache[ key ].dirty ) {
		return _cache[ key ].list;
	}

	// We assume that when a consumer attempts to access a dirty key that we can safely delete it
	// because the consumer will get new data to freshen the cache
	if ( _cache[ key ] && _cache[ key ].dirty ) {
		delete _cache[ key ];
	}
}

function set( list ) {
	var key = getCacheKey( list.query );

	// To make sure that a list marked dirty is reset the next time
	// it is retrieved we skip updating entries that are dirty
	if ( ! _cache[ key ] || ! _cache[ key ].dirty ) {
		_cache[ key ] = {
			timeStored: new Date().getTime(),
			list: list,
			dirty: false
		};
	}
}

function markDirty( post, oldStatus ) {
	var site = sites.getSite( post.site_ID ),
		affectedSites = [ site.slug, site.ID, false ],
		affectedStatuses = [ post.status, oldStatus ],
		listStatuses, key, entry, list;

	for( key in _cache ) {
		if ( !_cache.hasOwnProperty( key ) ) {
			continue;
		}
		entry = _cache[ key ];

		list = entry.list;

		if ( list.query.type !== post.type ) {
			continue;
		}

		if ( -1 === affectedSites.indexOf( list.query.siteID ) ) {
			continue;
		}

		listStatuses = list.query.status.split( ',' ); // some statuses are grouped

		if ( intersection( listStatuses, affectedStatuses ).length === 0 ) {
			continue;
		}

		entry.dirty = true;
	}

}

var PostsListCache = {
	get: get
};

PostsListCache.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action,
		PostListStore = require( './post-list-store-factory' )();

	Dispatcher.waitFor( [ PostListStore.dispatchToken ] );

	switch( action.type ) {
		case 'FETCH_NEXT_POSTS_PAGE':
			set( PostListStore.get() );
			break;
		case 'RECEIVE_POSTS_PAGE':
			set( PostListStore.get() );
			break;

		case 'RECEIVE_UPDATED_POSTS':
			set( PostListStore.get() );
			break;

		case 'RECEIVE_UPDATED_POST':
		case 'RECEIVE_POST_BEING_EDITED':
			if ( action.post ) {
				markDirty( action.post, action.original ? action.original.status : null );
				set( PostListStore.get() );
			}
			break;
	}

} );

module.exports = PostsListCache;
