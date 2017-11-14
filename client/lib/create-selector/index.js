/** @format */

/**
 * External dependencies
 */

import { memoize } from 'lodash';
import shallowEqual from 'react-pure-render/shallowEqual';
import LRU from 'lru';

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
	getCacheKey = DEFAULT_GET_CACHE_KEY,
	options = { lruCacheSize: 100 }
) {
	const memoizedSelector = memoize( selector, getCacheKey );
	const dependentsPerKey = new LRU( { max: options.lruCacheSize } );

	if ( Array.isArray( getDependants ) ) {
		getDependants = makeSelectorFromArray( getDependants );
	}

	return Object.assign(
		function( state, ...args ) {
			const cacheKey = getCacheKey( state, ...args );
			let currentDependants = getDependants( state, ...args );
			if ( ! Array.isArray( currentDependants ) ) {
				currentDependants = [ currentDependants ];
			}

			let prevDependents;
			// @TODO: I've uncovered a bug in lru. this should not be necessary.
			// willl resolve this with the package maintainer.
			// see very similar: https://github.com/chriso/lru/issues/19
			try {
				prevDependents = dependentsPerKey.get( cacheKey );
			} catch ( e ) {
				prevDependents = false;
			}

			if ( prevDependents && ! shallowEqual( currentDependants, prevDependents ) ) {
				memoizedSelector.cache.delete( cacheKey );
			}
			try {
				dependentsPerKey.set( cacheKey, currentDependants );
			} catch ( e ) {}

			return memoizedSelector( state, ...args );
		},
		{ memoizedSelector }
	);
}
