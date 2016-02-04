/**
 * External dependencies
 */
import Immutable from 'immutable';
import superagent from 'superagent';

/**
 * Internal dependencies
 */
import config from 'config';

class Cache {
	constructor( maxSize = 5 ) {
		this.cache = new Immutable.Map();
		this.maxSize = maxSize;
	}
	add( fn, args, result ) {
		console.log( 'cache: add', fn, args, result );
		if ( this.cache.size >= this.maxSize ) {
			console.log( 'clearing' );
			this.cache = this.cache.clear();
		}

		const key = this.key( fn, args );
		this.cache = this.cache.setIn( key, result );
	}
	get( fn, args ) {
		const key = this.key( fn, args );
		return this.cache.getIn( key );
	}
	has( fn, args ) {
		const key = this.key( fn, args );
		console.log( 'cache: has', fn, args, this.cache.hasIn( key ) );
		return this.cache.hasIn( key );
	}
	key( fn, args ) {
		return [ fn, JSON.stringify( args ) ]
	}
}

/*
 * memo does memoization. I'm choosing this approach over the known
 * `memoize(fn)(...args)` approach in order to have more control over _where_
 * the cache lives.
 *
 * Memoization is the reason why we introduced `selector` in `makeServerRoute`.
 */
export default function makeMemo() {
	const _cache = new Cache();

	return function memo( fn, ...args ) {
		let result = {};
		try {
			if ( _cache.has( fn, args ) ) {
				return _cache.get( fn, args );
			}

			const startTime = Date.now();
			result = fn( ...args );
			const rtsTimeMs = Date.now() - startTime;

			_cache.add( fn, args, result );

			if ( rtsTimeMs > 15 ) {
				bumpStat( 'calypso-ssr',
						'loggedout-design-over-15ms-rendertostring' );
			}

			bumpStat( 'calypso-ssr', 'loggedout-design-cache-miss' );
		} catch ( ex ) {
			if ( config( 'env' ) === 'development' ) {
				throw ex;
			}
		}
		return result;
	};
}

function bumpStat( group, name ) {
	const url = `http://pixel.wp.com/g.gif?v=wpcom-no-pv&x_${ group }=${ name }&t=${ Math.random() }`;

	if ( config( 'env' ) === 'production' ) {
		superagent.get( url ).end();
	}
}
