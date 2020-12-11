/**
 * Internal dependencies
 */
import * as i6 from './i6';
import * as i7 from './i7';
import config from 'calypso/config';
import { createIterationValueGetter } from 'calypso/lib/iterations/utils';

/**
 * Type dependencies
 */
import type { ProductsGridProps, SelectorProduct, Duration } from './types';
import type { IterationConfig } from 'calypso/lib/iterations/types';

/**
 * Iterations
 */

enum ITERATIONS {
	I6 = 'i6',
	I7 = 'i7',
}

const namespace = 'pricing-page-iteration';
const iterationConfig: IterationConfig< ITERATIONS > = {
	[ ITERATIONS.I6 ]: {},
	[ ITERATIONS.I7 ]: { extends: ITERATIONS.I6 },
};

/**
 * Utils
 */

const iterationGetter = (): ITERATIONS => config( namespace );
const getIterationValue = createIterationValueGetter( iterationGetter, iterationConfig );

/**
 * Value getters
 */

export const getGridIteration = (): React.FC< ProductsGridProps > | undefined =>
	getIterationValue< React.FC< ProductsGridProps > >( {
		[ ITERATIONS.I6 ]: i6.ProductsGrid,
	} );

export const getButtonLabelIteration = (): React.FC | undefined =>
	getIterationValue< React.FC >( {
		[ ITERATIONS.I6 ]: i6.ButtonLabel,
		[ ITERATIONS.I7 ]: i7.ButtonLabel,
	} );

type GetPlansToDisplayArgs = Array< { duration: Duration; currentPlanSlug: string | null } >;

export const getPlansToDisplayIteration = (
	...args: GetPlansToDisplayArgs
): SelectorProduct[] | undefined => {
	const fn = getIterationValue< ( ...args: GetPlansToDisplayArgs ) => SelectorProduct[] >( {
		[ ITERATIONS.I6 ]: i6.getPlansToDisplay,
	} );

	if ( fn ) {
		return fn( ...args );
	}
};
