/**
 * Internal dependencies
 */
import ProductsGridAlt from './products-grid-alt';
import ProductsGridAlt2 from './products-grid-alt-2';
import ProductsGridI5 from './products-grid-i5';

import SelectorPageAlt from './selector-alt';
import { getJetpackCROActiveVersion as getIteration } from 'calypso/my-sites/plans-v2/abtest';

/**
 * Type dependencies
 */
import type { SelectorPageProps, ProductsGridProps } from './types';

/**
 * Iterations
 */

export enum Iterations {
	V1 = 'v1',
	V2 = 'v2',
	I5 = 'i5',
}

/**
 * Getters
 */

export function getSelectorComponent(): React.FC< SelectorPageProps > | undefined {
	return {
		[ Iterations.V1 ]: SelectorPageAlt,
		[ Iterations.V2 ]: SelectorPageAlt,
		[ Iterations.I5 ]: SelectorPageAlt,
	}[ getIteration() as Iterations ];
}

export function getGridComponent(): React.FC< ProductsGridProps > | undefined {
	return {
		[ Iterations.V1 ]: ProductsGridAlt,
		[ Iterations.V2 ]: ProductsGridAlt2,
		[ Iterations.I5 ]: ProductsGridI5,
	}[ getIteration() as Iterations ];
}

/**
 * Checks
 */

export function showFilterBarInSelector(): boolean {
	return [ Iterations.V1, Iterations.V2 ].includes( getIteration() as Iterations );
}

/**
 * Jetpack CRM
 */
export function getJetpackCrmPrice(): number | undefined {
	return {
		[ Iterations.V1 ]: undefined,
		[ Iterations.V2 ]: 17,
		[ Iterations.I5 ]: 17,
	}[ getIteration() as Iterations ];
}

export function getJetpackCrmCurrency(): string | undefined {
	return {
		[ Iterations.V1 ]: undefined,
		[ Iterations.V2 ]: 'USD',
		[ Iterations.I5 ]: 'USD',
	}[ getIteration() as Iterations ];
}
