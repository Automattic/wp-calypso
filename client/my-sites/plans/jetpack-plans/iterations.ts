/**
 * Internal dependencies
 */
import { abtest } from 'calypso/lib/abtest';
import { getUrlParts } from 'calypso/lib/url/url-parts';
import ProductsGridI5 from './i5/products-grid-i5';
import ProductsGridSpp from './spp/products-grid-spp';
import JetpackFAQi5 from 'calypso/my-sites/plans-features-main/jetpack-faq-i5';
import { getJetpackCROActiveVersion as getIteration } from 'calypso/my-sites/plans/jetpack-plans/abtest';

/**
 * Type dependencies
 */
import type { ProductsGridProps } from './types';

/**
 * Iterations
 */

export enum Iterations {
	I5 = 'i5',
	SPP = 'spp',
}
const iterationNames: string[] = Object.values( Iterations );

/**
 * Getters
 */

/**
 * Gets the name of the current CRO iteration.
 *
 * **NOTE:** Avoid using this if you can; instead, opt for either `getForCurrentCROIteration` or `doForCurrentCROIteration`.
 *
 * **IMPORTANT:** This function calls `abtest`, so only use it in places where
 * it's okay for the `jetpackSimplifyPricingPage` test to begin,
 * or in places you know it's already begun.
 *
 * @see Iterations
 * @see getForCurrentCROIteration
 * @see doForCurrentCROIteration
 */
export const getCurrentCROIterationName = (): Iterations => {
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

	// Otherwise, check for the assigned A/B test value
	const variant = abtest( 'jetpackSimplifyPricingPage' );

	switch ( variant ) {
		case 'test':
			return Iterations.SPP;
		case 'control':
		default:
			return Iterations.I5;
	}
};

type IterationValueFunction< T > = ( key: Iterations ) => T | undefined;
type IterationValueMap< T > = Partial< { [ key in Iterations ]: T } >;

/**
 * Returns a value based on the current CRO test iteration,
 * or undefined if no matching value could be found.
 *
 * **IMPORTANT:** This function calls `abtest`, so only use it in places where
 * it's okay for the `jetpackSimplifyPricingPage` test to begin,
 * or in places you know it's already begun.
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

	if ( typeof valueGetter === 'object' ) {
		return valueGetter[ iteration ];
	}

	return undefined;
};

/**
 * Resolves the current CRO iteration and passes that information to a given
 * function.
 *
 * **IMPORTANT:** This function calls `abtest`, so only use it in places where
 * it's okay for the `jetpackSimplifyPricingPage` test to begin,
 * or in places you know it's already begun.
 *
 * @param fn The function to execute.
 */
export const doForCurrentCROIteration = ( fn: ( key: Iterations ) => void ): void =>
	fn( getCurrentCROIterationName() );

/**
 * Component getters
 */

export function getGridComponent(): React.FC< ProductsGridProps > | undefined {
	return {
		[ Iterations.I5 ]: ProductsGridI5,
		[ Iterations.SPP ]: ProductsGridSpp,
	}[ getIteration() as Iterations ];
}

export function getFaqComponent(): React.FC | undefined {
	return {
		[ Iterations.I5 ]: JetpackFAQi5,
		[ Iterations.SPP ]: JetpackFAQi5,
	}[ getIteration() as Iterations ];
}
