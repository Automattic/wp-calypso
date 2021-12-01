import { isJetpackProductSlug, isJetpackPlanSlug } from '@automattic/calypso-products';
import { useMemo } from 'react';
import type { RequestCartProduct } from '@automattic/shopping-cart';

const JETPACK_INTRO_COUPON_CODE = 'FIRSTYEAR50';

// **NOTE**: This hook can be safely deleted when we no longer need to
// rely on auto-applied coupons for introductory new purchase pricing.
const useMaybeJetpackIntroCouponCode = (
	products: RequestCartProduct[],
	isCouponApplied: boolean
): string | undefined => {
	return useMemo( () => {
		if ( isCouponApplied ) {
			return undefined;
		}
		const jetpackProducts = products.filter(
			( product ) =>
				isJetpackProductSlug( product.product_slug ) || isJetpackPlanSlug( product.product_slug )
		);

		// Only apply JETPACK_INTRO_COUPON_CODE if there's a Jetpack
		// product or plan present in the cart
		if ( jetpackProducts.length < 1 ) {
			return undefined;
		}

		// Only apply JETPACK_INTRO_COUPON_CODE for new purchases, not renewals.
		if ( jetpackProducts.some( ( product ) => product.extra.purchaseType === 'renewal' ) ) {
			return undefined;
		}

		// never apply JETPACK_INTRO_COUPON_CODE to monthly products
		if ( jetpackProducts.some( ( product ) => product.product_slug.endsWith( '_monthly' ) ) ) {
			return undefined;
		}

		return JETPACK_INTRO_COUPON_CODE;
	}, [ products, isCouponApplied ] );
};

export default useMaybeJetpackIntroCouponCode;
