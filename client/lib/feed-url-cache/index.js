import lruCache from 'lru-cache';

const cache = lruCache( 10 );

module.exports = {
	get: function( url ) {
		return cache.get( url );
	},
	set: function( url, id ) {
		cache.set( url, id );
	}
};
