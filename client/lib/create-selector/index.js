/**
 * External dependencies
 */
import { memoize, includes } from 'lodash';
import isShallowEqual from '@wordpress/is-shallow-equal';

/**
 * Internal dependencies
 */
import warn from 'lib/warn';

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
 * @type    {Function}
 * @param   {object}    state Current state object
 * @returns {(Array|*)}       Value(s) to be shallow compared
 */
const DEFAULT_GET_DEPENDANTS = ( state ) => state;

/**
 * At runtime, assigns a function which returns a cache key for the memoized
 * selector function, given a state object and a variable set of arguments. In
 * development mode, this warns when the memoized selector is passed a complex
 * object argument, as these cannot be depended upon as reliable cache keys.
 *
 * @type {Function} Function returning cache key for memoized selector
 */
const DEFAULT_GET_CACHE_KEY = ( () => {
	if ( 'production' === process.env.NODE_ENV ) {
		return ( state, ...args ) => args.join();
	}

	return ( state, ...args ) => {
		const hasInvalidArg = args.some( ( arg ) => {
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
 * @param   {Function[]} dependants Array of getDependants
 * @returns {Function}              Function mapping getDependants results
 */
const makeSelectorFromArray = ( dependants ) => ( state, ...args ) =>
	dependants.map( ( dependant ) => dependant( state, ...args ) );

/**
 * Returns a memoized state selector for use with the global application state.
 *
 * @param  {Function}            selector      Function calculating cached result
 * @param  {Function|Function[]} getDependants Function(s) describing dependent
 *                                             state, or an array of dependent
 *                                             state selectors
 * @param   {Function}            getCacheKey   Function generating cache key
 * @returns {Function}                          Memoized selector
 */
export default function createSelector(
	selector,
	getDependants = DEFAULT_GET_DEPENDANTS,
	getCacheKey = DEFAULT_GET_CACHE_KEY
) {
	const memoizedSelector = memoize( selector, getCacheKey );
	let lastDependants;

	if ( Array.isArray( getDependants ) ) {
		getDependants = makeSelectorFromArray( getDependants );
	}

	return Object.assign(
		function ( state, ...args ) {
			let currentDependants = getDependants( state, ...args );
			if ( ! Array.isArray( currentDependants ) ) {
				currentDependants = [ currentDependants ];
			}

			if ( lastDependants && ! isShallowEqual( currentDependants, lastDependants ) ) {
				memoizedSelector.cache.clear();
			}

			lastDependants = currentDependants;

			return memoizedSelector( state, ...args );
		},
		{ memoizedSelector }
	);
}
