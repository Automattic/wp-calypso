/**
 * Internal dependencies
 */

/**
 * Type dependencies
 */
import type { IterationGetter, IterationConfig, IterationValueGetter } from './types';

const getExtendedIteration = < T extends string >(
	i: T,
	config: IterationConfig< T >
): T | undefined => config[ i ].extends;

export const createIterationValueGetter = < T extends string >(
	iterationGetter: IterationGetter< T >,
	config: IterationConfig< T >
): IterationValueGetter< T > => {
	const i = iterationGetter();

	return ( o ) => o[ i ] ?? o[ getExtendedIteration< T >( i, config ) as T ] ?? undefined;
};
