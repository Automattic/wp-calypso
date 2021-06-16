/**
 * External dependencies
 */
import { useMemo } from 'react';

/**
 * Internal dependencies
 */
import { isJetpackProductSlug, isJetpackPlanSlug } from '@automattic/calypso-products';

/**
 * Type dependencies
 */
import type { RequestCartProduct } from '@automattic/shopping-cart';

const JETPACK_INTRO_COUPON_CODE = 'FRESHPACK';

// **NOTE**: This hook can be safely deleted when we no longer need to
// rely on auto-applied coupons for introductory new purchase pricing.
const useMaybeJetpackIntroCouponCode = (
	products: RequestCartProduct[],
	isCouponApplied: boolean
): string | undefined =>
	useMemo( () => {
		if ( isCouponApplied ) {
			return undefined;
		}
		const jetpackProducts = products.filter(
			( product ) =>
				isJetpackProductSlug( product.product_slug ) || isJetpackPlanSlug( product.product_slug )
		);

		// Only apply FRESHPACK if there's a Jetpack
		// product or plan present in the cart
		if ( jetpackProducts.length < 1 ) {
			return undefined;
		}

		// Only apply FRESHPACK for new purchases, not renewals.
		if ( jetpackProducts.some( ( product ) => product.extra.purchaseType === 'renewal' ) ) {
			return undefined;
		}

		return JETPACK_INTRO_COUPON_CODE;
	}, [ products, isCouponApplied ] );

export default useMaybeJetpackIntroCouponCode;
