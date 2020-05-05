const defaultGetCacheKey = ( ...args ) => args.join();

const isFunction = ( fn ) => {
	return fn && typeof fn === 'function';
};

const isObject = ( o ) => {
	return o && typeof o === 'object';
};

/**
 * Returns a selector that caches values.
 *
 * @param  {Function} getDependents A Function describing the dependent(s) of the selector.
 *                                    Must return an array which gets passed as the first arg to the selector
 * @param  {Function} selector      A standard selector for calculating cached result
 * @param  {object}   options       Options bag with additional arguments
 * @param  {Function} options.getCacheKey
 *                                  Custom way to compute the cache key from the `args` list
 * @returns {Function}               Cached selector
 */
export default function treeSelect( getDependents, selector, options = {} ) {
	if ( process.env.NODE_ENV !== 'production' ) {
		if ( ! isFunction( getDependents ) || ! isFunction( selector ) ) {
			throw new TypeError(
				'treeSelect: invalid arguments passed, selector and getDependents must both be functions'
			);
		}
	}

	let cache = new WeakMap();

	const { getCacheKey = defaultGetCacheKey } = options;

	const cachedSelector = function ( state, ...args ) {
		const dependents = getDependents( state, ...args );

		if ( process.env.NODE_ENV !== 'production' ) {
			if ( getCacheKey === defaultGetCacheKey && args.some( isObject ) ) {
				throw new Error( 'Do not pass objects as arguments to a treeSelector' );
			}
		}

		// create a dependency tree for caching selector results.
		// this is beneficial over standard memoization techniques so that we can
		// garbage collect any values that are based on outdated dependents
		const leafCache = dependents.reduce( insertDependentKey, cache );

		const key = getCacheKey( ...args );
		if ( leafCache.has( key ) ) {
			return leafCache.get( key );
		}

		const value = selector( dependents, ...args );
		leafCache.set( key, value );
		return value;
	};

	cachedSelector.clearCache = () => {
		// WeakMap doesn't have `clear` method, so we need to recreate it
		cache = new WeakMap();
	};

	return cachedSelector;
}

/*
 * This object will be used as a WeakMap key if a dependency is a falsy value (null, undefined, ...)
 */
const NULLISH_KEY = {};

/*
 * First tries to get the value for the key.
 * If the key is not present, then inserts a new map and returns it
 *
 * Note: Inserts WeakMaps except for the last map which will be a regular Map.
 * The last map is a regular one because the the key for the last map is the string results of args.join().
 */
function insertDependentKey( map, key, currentIndex, arr ) {
	if ( key != null && Object( key ) !== key ) {
		throw new TypeError( 'key must be an object, `null`, or `undefined`' );
	}
	const weakMapKey = key || NULLISH_KEY;

	const existingMap = map.get( weakMapKey );
	if ( existingMap ) {
		return existingMap;
	}

	const newMap = currentIndex === arr.length - 1 ? new Map() : new WeakMap();
	map.set( weakMapKey, newMap );
	return newMap;
}
