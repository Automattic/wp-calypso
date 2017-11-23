/** @format */

/**
 * External dependencies
 */
import { castArray, isObject, forEach, first } from 'lodash';

/**
 * Constants
 */

/**
 * Defines acceptable argument types for a memoized selector when using the
 * default cache key generating function.
 *
 * @type {Array}
 */
const VALID_ARG_TYPES = [ 'number', 'boolean', 'string' ];

/**
 * Default behavior for determining whether current state differs from previous
 * state, which is the basis upon which memoize cache is cleared. Should return
 * a value or array of values to be shallowly compared for strict equality.
 *
 * @type   {Function}
 * @param  {Object}    state Current state object
 * @return {(Array|*)}       Value(s) to be shallow compared
 */
const DEFAULT_GET_DEPENDANTS = state => state;

/**
 * At runtime, assigns a function which returns a cache key for the memoized
 * selector function, given a state object and a variable set of arguments. In
 * development mode, this warns when the memoized selector is passed a complex
 * object argument, as these cannot be depended upon as reliable cache keys.
 *
 * @type {Function} Function returning cache key for memoized selector
 */
const DEFAULT_GET_CACHE_KEY = ( () => {
	let warn, includes;
	if ( 'production' !== process.env.NODE_ENV ) {
		// Webpack can optimize bundles if it can detect that a block will
		// never be reached. Since `NODE_ENV` is defined using DefinePlugin,
		// these debugging modules will be excluded from the production build.
		warn = require( 'lib/warn' );
		includes = require( 'lodash/includes' );
	} else {
		return ( state, ...args ) => args.join();
	}

	return ( state, ...args ) => {
		const hasInvalidArg = args.some( arg => {
			return arg && ! includes( VALID_ARG_TYPES, typeof arg );
		} );

		if ( hasInvalidArg ) {
			warn( 'Do not pass complex objects as arguments for a memoized selector' );
		}

		return args.join();
	};
} )();

/**
 * Given an array of getDependants functions, returns a single function which,
 * when called, returns an array of mapped results from those functions.
 *
 * @param  {Function[]} dependants Array of getDependants
 * @return {Function}              Function mapping getDependants results
 */
const makeSelectorFromArray = dependants => ( state, ...args ) =>
	dependants.map( dependant => dependant( state, ...args ) );

/**
 * Returns a memoized state selector for use with the global application state.
 *
 * @param  {Function}            selector      Function calculating cached result
 * @param  {Function|Function[]} getDependants Function(s) describing dependent
 *                                             state, or an array of dependent
 *                                             state selectors
 * @param  {Function}            getCacheKey   Function generating cache key
 * @return {Function}                          Memoized selector
 */
export default function createSelector(
	selector,
	getDependants = DEFAULT_GET_DEPENDANTS,
	getCacheKey = DEFAULT_GET_CACHE_KEY
) {
	let memo;

	if ( Array.isArray( getDependants ) ) {
		getDependants = makeSelectorFromArray( getDependants );
	}

	const memoizedSelector = function( state, ...args ) {
		const cacheKey = getCacheKey( state, ...args );
		const currentDependants = castArray( getDependants( state, ...args ) );

		// create a map of maps based on dependents in order to cache selector results.
		// ideally each map is a WeakMap but we fallback to a regular Map if the next key would be a primitive.
		// the reason this is beneficial over just using a cacheKey in a regular map, is that now we can
		// garbage collect any values that are based on dependents that no longer exist so the memory usage
		// should never balloon
		//
		// note: the last key is always undefined and therefore becomes a regular Map
		// this is useful because cacheKey is the last key and always is a String
		memo = memo || createMap( first( currentDependants ) ); // we need to wait to create the first memo map because we don't know if it will be object or not
		let currMemo = memo;
		forEach( currentDependants, ( dependent, i ) => {
			if ( ! currMemo.has( dependent ) ) {
				const nextKey = currentDependants[ i + 1 ];
				currMemo.set( dependent, createMap( nextKey ) );
			}
			currMemo = currMemo.get( dependent );
		} );

		if ( ! currMemo.has( cacheKey ) ) {
			// call the selector with all of the dependents as args so it can use the fruits of
			// the cpu cycles used during dependent calculation
			currMemo.set( cacheKey, selector( state, ...[ ...args, ...currentDependants ] ) );
		}

		memoizedSelector.cache = memo;
		return currMemo.get( cacheKey );
	};
	memoizedSelector.clearCache = () => {
		memo = new WeakMap();
		memoizedSelector.cache = memo;
	};
	return memoizedSelector;
}

/*
 * Maybe makes a WeakMap, maybe makes a Map.
 * All depends on what you want to put in it
 */
function createMap( potentialKey ) {
	if ( isObject( potentialKey ) ) {
		return new WeakMap();
	}
	return new Map();
}
