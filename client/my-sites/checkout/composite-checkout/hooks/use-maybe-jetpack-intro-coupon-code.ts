import { isJetpackProductSlug, isJetpackPlanSlug } from '@automattic/calypso-products';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getJetpackSaleCoupon } from 'calypso/state/marketing/selectors';
import type { RequestCartProduct } from '@automattic/shopping-cart';

const JETPACK_INTRO_COUPON_CODE = 'FRESHPACK';

// **NOTE**: This hook can be safely deleted when we no longer need to
// rely on auto-applied coupons for introductory new purchase pricing.
const useMaybeJetpackIntroCouponCode = (
	products: RequestCartProduct[],
	isCouponApplied: boolean
): string | undefined => {
	const jetpackSaleCoupon = useSelector( getJetpackSaleCoupon );
	return useMemo( () => {
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

		// Only apply FRESHPACK to monthly products if a sale is running
		if (
			jetpackSaleCoupon &&
			! jetpackProducts.some( ( product ) => product.product_slug.endsWith( '_monthly' ) )
		) {
			return undefined;
		}

		return JETPACK_INTRO_COUPON_CODE;
	}, [ products, isCouponApplied, jetpackSaleCoupon ] );
};

export default useMaybeJetpackIntroCouponCode;
