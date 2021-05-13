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
		const includesJetpackItems = products
			.map( ( p ) => p.product_slug )
			.some( ( slug ) => isJetpackProductSlug( slug ) || isJetpackPlanSlug( slug ) );

		// Only apply FRESHPACK if there's a Jetpack
		// product or plan present in the cart
		if ( ! includesJetpackItems ) {
			return undefined;
		}

		return JETPACK_INTRO_COUPON_CODE;
	}, [ products, isCouponApplied ] );

export default useMaybeJetpackIntroCouponCode;
