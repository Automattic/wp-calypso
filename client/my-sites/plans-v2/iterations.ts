/**
 * Internal dependencies
 */
import ProductsGridAlt from './products-grid-alt';
import ProductsGridAlt2 from './products-grid-alt-2';
import ProductsGridI5 from './products-grid-i5';
import SelectorPage from './selector';
import SelectorPageAlt from './selector-alt';
import { getJetpackCROActiveVersion } from 'calypso/my-sites/plans-v2/abtest';

/**
 * Type dependencies
 */
import type { SelectorPageProps, ProductsGridProps } from './types';

/**
 * Iterations
 */

enum Iterations {
	V1 = 'v1',
	V2 = 'v2',
	I5 = 'i5',
}

const iteration = getJetpackCROActiveVersion() as Iterations;

/**
 * Getters
 */

export function getSelectorComponent(): React.FC< SelectorPageProps > {
	return (
		{
			[ Iterations.V1 ]: SelectorPageAlt,
			[ Iterations.V2 ]: SelectorPageAlt,
			[ Iterations.I5 ]: SelectorPageAlt,
		}[ iteration ] || SelectorPage
	);
}

export function getGridComponent(): React.FC< ProductsGridProps > | undefined {
	return {
		[ Iterations.V1 ]: ProductsGridAlt,
		[ Iterations.V2 ]: ProductsGridAlt2,
		[ Iterations.I5 ]: ProductsGridI5,
	}[ iteration ];
}

/**
 * Checks
 */

export function showFilterBarInSelector(): boolean {
	return [ Iterations.V1, Iterations.V2 ].includes( iteration );
}
