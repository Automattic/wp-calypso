/**
 * Internal dependencies
 */
import { getProductsOrderVariation } from '../ab-tests/products-order';

/**
 * Type dependencies
 */
import type { JetpackProductSlug } from 'calypso/lib/products-values/types';
import type { JetpackPlanSlugs } from 'calypso/lib/plans/types';

const PRODUCT_POSITION_IN_GRID: Record< string, number > = getProductsOrderVariation();

export const getProductPosition = ( slug: JetpackPlanSlugs | JetpackProductSlug ): number =>
	PRODUCT_POSITION_IN_GRID[ slug ] ?? 100;
