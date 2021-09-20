import { isJetpackProductSlug, isJetpackPlanSlug } from '@automattic/calypso-products';
import { useMemo } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import type { RequestCartProduct } from '@automattic/shopping-cart';
import type { JetpackSaleCoupon } from 'calypso/state/marketing/selectors';

const JETPACK_INTRO_COUPON_CODE = 'FRESHPACK';

// **NOTE**: This hook can be safely deleted when we no longer need to
// rely on auto-applied coupons for introductory new purchase pricing.
const useMaybeJetpackIntroCouponCode = (
	products: RequestCartProduct[],
	isCouponApplied: boolean,
	jetpackSaleCoupon: JetpackSaleCoupon | null
): string | undefined => {
	const moment = useLocalizedMoment();

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

		if ( jetpackSaleCoupon && moment.utc( jetpackSaleCoupon.expiry_date ) > moment.utc() ) {
			return jetpackSaleCoupon.code;
		}

		return JETPACK_INTRO_COUPON_CODE;
	}, [ products, isCouponApplied, jetpackSaleCoupon ] );
};

export default useMaybeJetpackIntroCouponCode;
