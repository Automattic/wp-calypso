/**
 * Internal dependencies
 */
import ProductsGridAlt from './products-grid-alt';
import ProductsGridAlt2 from './products-grid-alt-2';
import ProductsGridI5 from './products-grid-i5';
import ProductsGridSpp from './products-grid-spp';
import JetpackFAQ from 'calypso/my-sites/plans-features-main/jetpack-faq';
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
	V1 = 'v1',
	V2 = 'v2',
	I5 = 'i5',
	SPP = 'spp',
}

/**
 * Getters
 */

export function getGridComponent(): React.FC< ProductsGridProps > | undefined {
	return {
		[ Iterations.V1 ]: ProductsGridAlt,
		[ Iterations.V2 ]: ProductsGridAlt2,
		[ Iterations.I5 ]: ProductsGridI5,
		[ Iterations.SPP ]: ProductsGridSpp,
	}[ getIteration() as Iterations ];
}

export function getFaqComponent(): React.FC | undefined {
	return {
		[ Iterations.V1 ]: JetpackFAQ,
		[ Iterations.V2 ]: JetpackFAQ,
		[ Iterations.I5 ]: JetpackFAQi5,
		[ Iterations.SPP ]: JetpackFAQi5,
	}[ getIteration() as Iterations ];
}

/**
 * Checks
 */

export function showFilterBarInSelector(): boolean {
	return [ Iterations.V1, Iterations.V2 ].includes( getIteration() as Iterations );
}
