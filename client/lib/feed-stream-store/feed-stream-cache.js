/** @format */

/**
 * External dependencies
 */

import LRU from 'lru';

/**
 * Internal Dependencies
 */

let cache = new LRU( 10 );
let specialCache = {};

function isSpecialStream( id ) {
	return /^following|a8c|likes|conversations/.test( id );
}

export default {
	get: function( id ) {
		if ( isSpecialStream( id ) ) {
			return specialCache[ id ];
		}
		return cache.get( id );
	},
	set: function( id, store ) {
		if ( isSpecialStream( id ) ) {
			specialCache[ id ] = store;
		} else {
			cache.set( id, store );
		}
	},
	clear: function() {
		specialCache = {};
		cache = new LRU( 10 );
	},
};
