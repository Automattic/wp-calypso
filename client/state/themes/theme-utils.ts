import { isWpComMonthlyPlan } from '@automattic/calypso-products';

interface ProductWithBillingCycle {
	product_slug: string;
	product_term?: string;
}

export function getPreferredBillingCycleProductSlug(
	products: Array< ProductWithBillingCycle >,
	currentPlanSlug?: string
): string {
	if ( products.length === 0 ) {
		throw new Error( 'No products available' );
	}
	let preferredBillingCycle = 'month';

	if ( currentPlanSlug && ! isWpComMonthlyPlan( currentPlanSlug ) ) {
		preferredBillingCycle = 'year';
	}

	const preferredProduct = products.find(
		( product ) => product.product_term === preferredBillingCycle
	);
	return preferredProduct?.product_slug ?? products[ 0 ].product_slug;
}
