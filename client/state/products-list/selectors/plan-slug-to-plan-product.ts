import {
	applyTestFiltersToPlansList,
	applyTestFiltersToProductsList,
	getPlan,
	getProductFromSlug,
	objectIsProduct,
} from '@automattic/calypso-products';
import type { ProductListItem } from './get-products-list';

export type TestFilteredPlan =
	| ReturnType< typeof applyTestFiltersToPlansList >
	| ReturnType< typeof applyTestFiltersToProductsList >;
export interface PlanAndProduct {
	planSlug: string;
	plan: TestFilteredPlan | null;
	product: ProductListItem | undefined;
}

/**
 * Computes a plan object and a related product object based on plan slug/constant
 */
export const planSlugToPlanProduct = (
	products: Record< string, ProductListItem >,
	planOrProductSlug: string
): PlanAndProduct => {
	const plan = getPlan( planOrProductSlug ) ?? getProductFromSlug( planOrProductSlug );
	const constantObj = objectIsProduct( plan )
		? applyTestFiltersToProductsList( plan.product_slug )
		: applyTestFiltersToPlansList( plan, undefined );
	const product = products[ planOrProductSlug ];
	return {
		planSlug: planOrProductSlug,
		plan: plan === planOrProductSlug ? null : constantObj,
		product,
	};
};
