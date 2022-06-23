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
	product: ProductListItem;
}

/**
 * Computes a plan object and a related product object based on plan slug/constant
 */
export const planSlugToPlanProduct = (
	products: Record< string, ProductListItem >,
	planOrProductSlug: string
): PlanAndProduct => {
	const plan = getPlan( planOrProductSlug ) ?? getProductFromSlug( planOrProductSlug );
	// NOTE: while converting this to TypeScript, this next section showed up as
	// heavily broken. I had to heavily change these next lines because they
	// assume that `plan` is a string and it is very likely to be an object. I do
	// not know if I chose the correct strings or if something more fundamental
	// is wrong here but it's a little shocking that this ever worked at all.
	const constantObj = objectIsProduct( plan )
		? applyTestFiltersToProductsList( plan.product_slug )
		: applyTestFiltersToPlansList( plan, undefined );
	const product = products[ planOrProductSlug ];
	if ( ! product ) {
		throw new Error(
			`Could not convert "${ planOrProductSlug }" to product plan because it was not in the list of products provided.`
		);
	}
	return {
		planSlug: planOrProductSlug,
		plan: plan === planOrProductSlug ? null : constantObj,
		product,
	};
};
