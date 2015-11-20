/**
 * External dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	store = require( 'store' );

/**
 * Internal dependencies
 */
var Emitter = require( 'lib/mixins/emitter' ),
	actions = require( './actions' ),
	constants = require( './constants' ),
	validStats = [
		'totalViews'
	],
	_bySite = {};

function localStorageKey( stat, siteId, postId ) {
	return 'PostStatsStore_' + stat + '_' + siteId + '_' + postId;
}

function isStale( timeStampInMs ) {
	var now = new Date().getTime(),

	// Add some fuzziness so these don't all expire at once
	rand = Math.random() * constants.TTL_FUZZ_IN_SECONDS - constants.TTL_FUZZ_IN_SECONDS / 2;

	return rand + ( now - timeStampInMs ) / 1000 > constants.TTL_IN_SECONDS;
}

function getCachedItem( stat, siteId, postId ) {
	var key,
		cachedRecord;

	if ( validStats.indexOf( stat ) === -1 ) {
		return false;
	}

	if ( _bySite[ siteId ] && _bySite[ siteId ][ postId ] && _bySite[ siteId ][ postId ][ stat ] ) {
		// Item is in memory
		return _bySite[ siteId ][ postId ][ stat ];
	}

	// fall back to localStorage
	key = localStorageKey( stat, siteId, postId );
	cachedRecord = store.get( key );

	if ( ! cachedRecord ) {
		// Item is neither in memory or in localStorage
		return;
	}

	// Promote from localStorage to memory
	_bySite[ siteId ] = _bySite[ siteId ] || {};
	_bySite[ siteId ][ postId ] = _bySite[ siteId ][ postId ] || {};
	_bySite[ siteId ][ postId ][ stat ] = cachedRecord;

	return cachedRecord;
}

function setItem( stat, siteId, postId, data ) {

	if ( validStats.indexOf( stat ) === -1 ) {
		return;
	}

	// Save in-memory
	_bySite[ siteId ] = _bySite[ siteId ] || {};
	_bySite[ siteId ][ postId ] = _bySite[ siteId ][ postId ] || {};
	_bySite[ siteId ][ postId ][ stat ] = data;

	// Also, save on disk so views have an immediate value to show next load
	return store.set(
		localStorageKey( stat, siteId, postId ),
		data
	);
}

var postStatsStore = {
	getItem: function( stat, siteId, postId ) {
		var cachedRecord;

		if ( validStats.indexOf( stat ) === -1 ) {
			return false;
		}

		cachedRecord = getCachedItem( stat, siteId, postId );
		if ( ! cachedRecord || typeof cachedRecord[ stat ] === 'undefined' || ! cachedRecord.updatedAt ) {
			actions.fetchTotalViews( siteId, postId );
			return false;
		}

		if ( isStale( cachedRecord.updatedAt ) ) {
			actions.fetchTotalViews( siteId, postId );
		}

		return cachedRecord[stat];
	}
};

Emitter( postStatsStore );
postStatsStore.setMaxListeners( 100 );

postStatsStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	switch( action.type ) {
		case constants.RECEIVE_TOTAL_POST_VIEWS:
			if ( ! action.error && action.data && ! isNaN( action.data.views ) ) {
				setItem( 'totalViews', action.siteId, action.postId, {
					totalViews: action.data.views,
					updatedAt: new Date().getTime()
				} );
				this.emit( 'change' );
			}
			break;
		default:
	}

	return true;
}.bind( postStatsStore ) );

module.exports = postStatsStore;
