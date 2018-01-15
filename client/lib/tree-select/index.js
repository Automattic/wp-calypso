/** @format */

/**
 * External dependencies
 */
import { isObject, some, isFunction } from 'lodash';

/**
 * Returns a selector that caches values.
 *
 * @param  {Function} getDependents A Function describing the dependent(s) of the selector.
 *                                    Must return an array which gets passed as the first arg to the selector
 * @param  {Function} selector      A standard selector for calculating cached result
 * @return {Function}               Cached selector
 */
export default function treeSelect( getDependents, selector ) {
	if ( process.env.NODE_ENV !== 'production' ) {
		if ( ! isFunction( getDependents ) || ! isFunction( selector ) ) {
			throw new TypeError(
				'treeSelect: invalid arguments passed, selector and getDependents must both be functions'
			);
		}
	}

	const cache = new WeakMap();

	return function( state, ...args ) {
		const dependents = getDependents( state, ...args );

		if ( process.env.NODE_ENV !== 'production' ) {
			if ( some( args, isObject ) ) {
				throw new Error( 'Do not pass objects as arguments to a treeSelector' );
			}
		}

		// create a dependency tree for caching selector results.
		// this is beneficial over standard memoization techniques so that we can
		// garbage collect any values that are based on outdated dependents
		const leafCache = dependents.reduce( insertDependentKey, cache );

		const key = args.join();
		if ( leafCache.has( key ) ) {
			return leafCache.get( key );
		}

		const value = selector( dependents, ...args );
		leafCache.set( key, value );
		return value;
	};
}

/*
 * First tries to get the value for the key.
 * If the key is not present, then inserts a new map and returns it
 *
 * Note: Inserts WeakMaps except for the last map which will be a regular Map.
 * The last map is a regular one because the the key for the last map is the string results of args.join().
 */
function insertDependentKey( map, key, currentIndex, arr ) {
	if ( map.has( key ) ) {
		return map.get( key );
	}

	const newMap = currentIndex === arr.length - 1 ? new Map() : new WeakMap();
	map.set( key, newMap );
	return newMap;
}
