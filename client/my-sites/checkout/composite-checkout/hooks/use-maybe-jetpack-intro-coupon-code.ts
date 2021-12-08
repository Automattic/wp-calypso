import {
	isJetpackProductSlug,
	isJetpackPlanSlug,
	isJetpackSearch,
} from '@automattic/calypso-products';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getJetpackSaleCoupon } from 'calypso/state/marketing/selectors';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

const JETPACK_SEARCH_INTRO_COUPON_CODE = 'FIRSTYEAR50';
const JETPACK_INTRO_COUPON_CODE = 'FRESHPACK';

const isYearlySearch = ( product: RequestCartProduct ) =>
	isJetpackSearch( product ) && ! product.product_slug.endsWith( '_monthly' );

// **NOTE**: This hook can be safely deleted when we no longer need to
// rely on auto-applied coupons for introductory new purchase pricing.
const useMaybeJetpackIntroCouponCode = (
	products: MinimalRequestCartProduct[],
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
		if ( jetpackProducts.some( ( product ) => product.extra?.purchaseType === 'renewal' ) ) {
			return undefined;
		}

		// Only apply FRESHPACK to monthly products if a sale is running
		if (
			jetpackSaleCoupon &&
			! jetpackProducts.some( ( product ) => product.product_slug.endsWith( '_monthly' ) )
		) {
			return undefined;
		}

		// 2021-12-08: Tiered products like Search don't currently support introductory offers,
		// so we simulate a 50%-off first year discount by auto-applying a coupon.
		// This only applies to new subscriptions with yearly billing terms.
		if ( jetpackProducts.some( isYearlySearch ) ) {
			return JETPACK_SEARCH_INTRO_COUPON_CODE;
		}

		return JETPACK_INTRO_COUPON_CODE;
	}, [ products, isCouponApplied, jetpackSaleCoupon ] );
};

export default useMaybeJetpackIntroCouponCode;
