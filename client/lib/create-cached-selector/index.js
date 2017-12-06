/** @format */

/**
 * External dependencies
 */
import { isObject, forEach, some, isFunction } from 'lodash';

/**
 * Internal dependencies
 */
import warn from 'lib/warn';

/*
 * A map that is Weak with objects but Strong with primitives
 */
export class MixedMap {
	weakMap = new WeakMap();
	map = new Map();

	constructor( init ) {
		forEach( init, ( [ key, val ] ) => {
			this.mapForKey( key ).set( key, val );
		} );
	}

	mapForKey = key => ( isObject( key ) ? this.weakMap : this.map );

	clear() {
		this.weakMap = new WeakMap();
		this.map.clear();
	}

	set( k, v ) {
		this.mapForKey( k ).set( k, v );
		return this;
	}

	delete( k ) {
		return this.mapForKey( k ).delete( k );
	}

	get( k ) {
		return this.mapForKey( k ).get( k );
	}

	has( k ) {
		return this.mapForKey( k ).has( k );
	}
}

/**
 * Returns a selector that caches values.
 *
 * @param  {Function} selector      A standard selector for calculating cached result
 * @param  {Function} getDependents A Function describing the dependent(s) of the selector.
 *                                    Must return an object which gets used as the first arg of the selector
 * @return {Function}               Cached selector
 */
export default function createCachedSelector( selector, getDependents ) {
	if ( ! isFunction( selector ) || ! isFunction( getDependents ) ) {
		throw new TypeError(
			'createCachedSelector: invalid arguments passed, selector and getDependents must both be functions'
		);
	}

	const cache = new MixedMap();

	const cachedSelector = function( state, ...args ) {
		const dependents = getDependents( state, ...args );
		const sortedDependentsArray = Object.keys( dependents )
			.sort()
			.map( key => dependents[ key ] );

		if ( process.env.NODE_ENV !== 'production' ) {
			if ( some( args, isObject ) ) {
				warn( 'Do not pass complex objects as arguments to a cachedSelector' );
			}
		}

		// create a dependency tree for caching selector results.
		// this is beneficial over standard memoization techniques so that we can
		// garbage collect any values that are based on outdated dependents
		let currCache = cache;
		forEach( sortedDependentsArray, dependent => {
			if ( ! currCache.has( dependent ) ) {
				currCache.set( dependent, new MixedMap() );
			}
			currCache = currCache.get( dependent );
		} );

		const key = args.join();
		if ( ! currCache.has( key ) ) {
			currCache.set( key, selector( dependents, ...args ) );
		}

		return currCache.get( key );
	};

	return cachedSelector;
}
