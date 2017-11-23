/** @format */

/**
 * External dependencies
 */
import { castArray, isObject, forEach, fill } from 'lodash';

/**
 * A map that starts out Weak and if a primitive value is ever added to it
 * then it converts into a strong map.
 */
export class LazyWeakMap {
	map = new WeakMap();
	isWeak = true;

	clear() {
		if ( this.isWeak ) {
			this.map = new WeakMap();
		} else {
			this.map.clear();
		}
		return this;
	}

	set( k, v ) {
		if ( this.isWeak && ! isObject( k ) ) {
			this.isWeak = false;
			const oldMap = this.map;
			this.map = new Map( oldMap.entries );
		}
		this.map.set( k, v );
		return this;
	}

	delete( k ) {
		return this.map.delete( k );
	}
	get( k ) {
		return this.map.get( k );
	}
	has( k ) {
		return this.map.has( k );
	}
}

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
	const memo = new LazyWeakMap();

	if ( Array.isArray( getDependants ) ) {
		getDependants = makeSelectorFromArray( getDependants );
	}

	const memoizedSelector = function( state, ...args ) {
		const cacheKey = getCacheKey( state, ...args );
		const currentDependants = castArray( getDependants( state, ...args ) );

		// create a map of maps based on dependents in order to cache selector results.
		// ideally each map is a WeakMap but we fallback to a regular Map if a key woul be a non-object
		// the reason this charade is beneficial over standard memoization techniques is that now we can
		// garbage collect any values that are based on outdated dependents so the memory usage
		// should never balloon
		let currMemo = memo;
		forEach( currentDependants, dependent => {
			if ( ! currMemo.has( dependent ) ) {
				currMemo.set( dependent, new LazyWeakMap() );
			}
			currMemo = currMemo.get( dependent );
		} );

		if ( ! currMemo.has( cacheKey ) ) {
			// call the selector with all of the dependents as args so it can use the fruits of
			// the cpu cycles used during dependent calculation
			const emptySelectorArgs = fill(
				new Array( Math.max( arity( selector ) - args.length, 0 ) ),
				undefined
			);
			currMemo.set(
				cacheKey,
				selector( state, ...[ ...args, ...emptySelectorArgs, ...currentDependants ] )
			);
		}

		return currMemo.get( cacheKey );
	};

	memoizedSelector.cache = memo;
	return memoizedSelector;
}

export function arity( fn ) {
	const arityRegex = /arguments\[(\d+)\]/g;

	const namedParametersCount = fn.length;
	const fnString = fn.toString();
	let maxParamAccessed = 0;

	let match = arityRegex.exec( fnString );
	while ( match ) {
		if ( match ) {
			maxParamAccessed = Math.max( maxParamAccessed, match[ 1 ] + 1 );
		}
		match = arityRegex.exec( fnString );
	}
	return Math.max( namedParametersCount, maxParamAccessed );
}
