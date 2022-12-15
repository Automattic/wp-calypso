import { getTermDuration } from '@automattic/calypso-products';
import { get } from 'lodash';
import { computeFullAndMonthlyPricesForPlan } from './compute-full-and-monthly-prices-for-plan';
import { getProductsList } from './get-products-list';
import { planSlugToPlanProduct } from './plan-slug-to-plan-product';
import type { ProductListItem } from './get-products-list';
import type { TestFilteredPlan, PlanAndProduct } from './plan-slug-to-plan-product';
import type { AvailableProductVariant } from 'calypso/my-sites/checkout/composite-checkout/hooks/product-variants';
import type { AppState } from 'calypso/types';

interface NonNullablePlanAndProduct extends PlanAndProduct {
	plan: TestFilteredPlan;
	product: ProductListItem;
}

/**
 * Turns a list of plan slugs into a list of plan objects, corresponding
 * products, and their full and monthly prices
 */
export const computeProductsWithPrices = (
	state: AppState,
	siteId: number | undefined,
	planSlugs: string[],
	currentQuantity: number | null
): AvailableProductVariant[] => {
	const products = getProductsList( state );

	const planAndProducts = planSlugs.map( ( plan ) => planSlugToPlanProduct( products, plan ) );
	const filteredPlanAndProducts = planAndProducts.filter( hasAvailablePlan );
	const constructedVariants = filteredPlanAndProducts.map( ( availablePlanProduct ) => ( {
		...availablePlanProduct,
		...computeFullAndMonthlyPricesForPlan(
			state,
			siteId,
			availablePlanProduct.plan,
			currentQuantity
		),
	} ) );
	const filteredConstructedVariants = constructedVariants.filter( hasAvailablePrice );

	return filteredConstructedVariants.sort( ( a, b ) => {
		const durationA = getTermDuration( ( a.plan as TestFilteredPlan ).term );
		const durationB = getTermDuration( ( b.plan as TestFilteredPlan ).term );
		if ( durationA === undefined || durationB === undefined ) {
			return 0;
		}
		return durationA - durationB;
	} );
};

function hasAvailablePlan( planProduct: PlanAndProduct ): planProduct is NonNullablePlanAndProduct {
	return !! (
		planProduct.plan &&
		planProduct.product &&
		get( planProduct, [ 'product', 'available' ] )
	);
}

interface PartialProductVariant {
	priceFull: number | null;
	priceFinal: number | null;
	introductoryOfferPrice: number | null;
	plan: TestFilteredPlan;
	product: ProductListItem;
	planSlug: string;
}

function hasAvailablePrice(
	availablePlanProduct: PartialProductVariant
): availablePlanProduct is AvailableProductVariant {
	return Boolean( availablePlanProduct.priceFull );
}
