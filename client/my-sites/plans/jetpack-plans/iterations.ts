/**
 * Internal dependencies
 */
import { getUrlParts } from '@automattic/calypso-url';

/**
 * Iterations
 */

export enum Iterations {}

const iterationNames: string[] = Object.values( Iterations );

/**
 * Getters
 */

/**
 * Gets the name of the current CRO iteration.
 *
 * **NOTE:** Avoid using this externally; instead, opt for either
 * `getForCurrentCROIteration` or `doForCurrentCROIteration`.
 *
 * @see Iterations
 * @see getForCurrentCROIteration
 * @see doForCurrentCROIteration
 */
const getCurrentCROIterationName = (): Iterations | null => {
	// If we see a query parameter, obey that,
	// regardless of any active A/B test value
	if ( typeof window !== 'undefined' ) {
		const iterationQuery = getUrlParts( window.location.href ).searchParams?.get(
			'cloud-pricing-page'
		);

		if ( iterationQuery && iterationNames.includes( iterationQuery ) ) {
			return iterationQuery as Iterations;
		}
	}

	return null;
};

type IterationValueFunction< T > = ( key: Iterations | null ) => T | undefined;
type IterationValueMap< T > = Partial< { [ key in Iterations ]: T } >;

/**
 * Returns a value based on the current CRO test iteration,
 * or undefined if no matching value could be found.
 *
 * @param valueGetter {IterationValueMap|IterationValueFunction} Either a map
 * from Iterations to return values, or a function that accepts the current Iteration as an argument.
 *
 * @see getCurrentCROIterationName
 */
export const getForCurrentCROIteration = < T >(
	valueGetter?: IterationValueMap< T > | IterationValueFunction< T >
): T | undefined => {
	if ( ! valueGetter ) {
		return undefined;
	}

	const iteration = getCurrentCROIterationName();

	if ( typeof valueGetter === 'function' ) {
		return valueGetter( iteration );
	}

	if ( iteration && typeof valueGetter === 'object' ) {
		return valueGetter[ iteration ];
	}

	return undefined;
};

/**
 * Resolves the current CRO iteration and passes that information to a given
 * function.
 *
 * @param fn The function to execute.
 */
export const doForCurrentCROIteration = ( fn: ( key: Iterations | null ) => void ): void =>
	fn( getCurrentCROIterationName() );
