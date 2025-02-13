import { isDIFMProduct, PLAN_100_YEARS } from '@automattic/calypso-products';
import { ResponseCartProduct } from '@automattic/shopping-cart';

export function useProductsWithPremiumSupport( products: ResponseCartProduct[] ) {
	let hasDIFMProduct = false;
	let has100YPlan = false;

	for ( const product of products ) {
		if ( isDIFMProduct( product ) ) {
			hasDIFMProduct = true;
		}
		if ( product?.product_slug === PLAN_100_YEARS || product?.extra?.is_hundred_year_domain ) {
			has100YPlan = true;
		}
	}

	const initialMessage = hasDIFMProduct
		? 'User is purchasing DIFM plan.'
		: 'User is purchasing 100 year plan.';

	const hasPremiumSupport = hasDIFMProduct || has100YPlan;

	return {
		initialMessage,
		hasPremiumSupport,
	};
}
