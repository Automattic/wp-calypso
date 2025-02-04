import isShallowEqual from '@wordpress/is-shallow-equal';
import warn from '@wordpress/warning';
import { memoize } from 'lodash';

/**
 * Constants
 */

/**
 * Defines acceptable argument types for a memoized selector when using the
 * default cache key generating function.
 */
const VALID_ARG_TYPES = [ 'number', 'boolean', 'string' ] as string[];

type Dependant< TState, TProps extends any[], TDependency > = (
	state: TState,
	...props: TProps
) => TDependency;

/**
 * Default behavior for determining whether current state differs from previous
 * state, which is the basis upon which memoize cache is cleared. Should return
 * a value or array of values to be shallowly compared for strict equality.
 * @param state Current state object
 * @returns Value(s) to be shallow compared
 */
const DEFAULT_GET_DEPENDANTS: Dependant< any, any, any > = < TState >( state: TState ): TState =>
	state;

/**
 * At runtime, assigns a function which returns a cache key for the memoized
 * selector function, given a state object and a variable set of arguments. In
 * development mode, this warns when the memoized selector is passed a complex
 * object argument, as these cannot be depended upon as reliable cache keys.
 */
const DEFAULT_GET_CACHE_KEY = ( () => {
	if ( 'production' === process.env.NODE_ENV ) {
		return ( _: unknown, ...args: unknown[] ) => args.join();
	}

	return ( _: unknown, ...args: unknown[] ) => {
		const hasInvalidArg = args.some( ( arg ) => {
			return arg && ! VALID_ARG_TYPES.includes( typeof arg );
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
 * @param dependants Array of getDependants
 * @returns Function mapping getDependants results
 */
const makeSelectorFromArray =
	< TState, TProps extends any[] >( dependants: ( ( state: TState, ...args: TProps ) => any )[] ) =>
	( state: TState, ...args: TProps ) =>
		dependants.map( ( dependant ) => dependant( state, ...args ) );

/**
 * Returns a memoized state selector for use with the global application state.
 * @param selector      Function calculating cached result
 * @param getDependants Function(s) describing dependent
 *                                             state, or an array of dependent
 *                                             state selectors
 * @param getCacheKey   Function generating cache key
 * @returns Memoized selector
 */
export default function createSelector<
	TState,
	TProps extends any[],
	// Note: TDepProps is only necessary because TS will attempt to infer TProps
	// from getDependants instead of selector, which causes issues when getDependants
	// only uses state, not props.
	// See https://github.com/Automattic/wp-calypso/pull/74540#issuecomment-1650834391
	TDepProps extends TProps,
	TDerivedState,
>(
	selector: ( state: TState, ...props: TProps ) => TDerivedState,
	getDependants:
		| Dependant< TState, TDepProps, any >
		| Dependant< TState, TDepProps, any >[] = DEFAULT_GET_DEPENDANTS,
	getCacheKey: ( state: TState, ...props: TProps ) => string = DEFAULT_GET_CACHE_KEY
): ( state: TState, ...props: TProps ) => TDerivedState {
	const memoizedSelector = memoize( selector, getCacheKey );
	let lastDependants: any[];

	const getDependantsFn =
		typeof getDependants === 'function' ? getDependants : makeSelectorFromArray( getDependants );

	return Object.assign(
		function ( state: TState, ...args: TProps ) {
			let currentDependants = getDependantsFn( state, ...( args as TDepProps ) );
			if ( ! Array.isArray( currentDependants ) ) {
				currentDependants = [ currentDependants ];
			}

			if ( lastDependants && ! isShallowEqual( currentDependants, lastDependants ) ) {
				memoizedSelector.cache.clear?.();
			}

			lastDependants = currentDependants;

			return memoizedSelector( state, ...args );
		},
		{ memoizedSelector }
	);
}
