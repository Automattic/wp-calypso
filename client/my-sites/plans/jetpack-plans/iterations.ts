/**
 * Internal dependencies
 */
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

/**
 * Getters
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
