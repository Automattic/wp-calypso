/**
 * External Dependencies
 */
import LRU from 'lru';

/**
 * Internal Dependencies
 */

const cache = new LRU( 10 );
const specialCache = {};

function isSpecialStream( id ) {
	return /^following|a8c|likes/.test( id );
}

module.exports = {
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
	}
};
