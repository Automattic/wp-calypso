import { isWpComMonthlyPlan } from '@automattic/calypso-products';
import { SitePlanData } from 'calypso/my-sites/checkout/src/hooks/product-variants';
import { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

/**
 * Get the preferred product slug from the products list.
 * @param products list of products
 * @returns string
 */
export function getPreferredBillingCycleProductSlug(
	products: Array< ProductListItem >,
	currentPlan?: SitePlanData | any
): string {
	if ( products.length === 0 ) {
		throw new Error( 'No products available' );
	}
	let preferredBillingCycle = 'month';

	if ( currentPlan && ! isWpComMonthlyPlan( currentPlan.productSlug ) ) {
		preferredBillingCycle = 'year';
	}

	const preferredProduct = products.find(
		( product ) => product.product_term === preferredBillingCycle
	);
	return preferredProduct?.product_slug ?? products[ 0 ].product_slug;
}
