import {
	isAddOn,
	isPlan,
	isDomainTransfer,
	isDomainProduct,
	isDotComPlan,
	isGoogleWorkspace,
	isGSuiteOrExtraLicenseProductSlug,
	isTitanMail,
	isJetpackProductSlug,
	isMonthlyProduct,
	isYearly,
	isBiennially,
	isTriennially,
} from '@automattic/calypso-products';
import { isWpComProductRenewal as isRenewal } from './is-wpcom-product-renewal';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

/**
 * Get Partner Coupon
 *
 * This method uses some of the same detection logic as partnerCouponRedirects in
 * the Connection controller, and future improvements should probably unify the two
 * code bases to "generic utility functions".
 */
export function getPartnerCoupon( {
	coupon,
	products,
}: {
	coupon: string;
	products?: ResponseCartProduct[];
} ): boolean {
	const isAllowed =
		products &&
		products.some( ( product: ResponseCartProduct ) => !! isAllowedPartnerProduct( product ) );
	const isPartnerCoupon = coupon.startsWith( 'IONOS_' );

	return ( isAllowed && isPartnerCoupon ) || false;
}

function isAllowedPartnerProduct( product: ResponseCartProduct ): boolean {
	const isRenewalItem = isRenewal( product );
	const { meta, product_name: productName, product_slug: productSlug } = product;

	if ( isDotComPlan( product ) && isRenewalItem ) {
		return true;
	}

	if ( isPlan( product ) || isJetpackProductSlug( productSlug ) ) {
		return true;
	}

	if ( isGoogleWorkspace( product ) || isGSuiteOrExtraLicenseProductSlug( productSlug ) ) {
		return true;
	}

	if ( isTitanMail( product ) ) {
		return true;
	}

	if ( meta && ( isDomainProduct( product ) || isDomainTransfer( product ) ) ) {
		if ( ! isRenewalItem ) {
			if ( productName ) {
				return true;
			}
			return false;
		}

		if ( productName ) {
			return true;
		}
	}

	if ( isAddOn( product ) && ! isRenewalItem ) {
		return true;
	}

	if ( isRenewalItem ) {
		return true;
	}

	if ( isMonthlyProduct( product ) ) {
		return true;
	}

	if ( isYearly( product ) ) {
		return true;
	}

	if ( isBiennially( product ) ) {
		return true;
	}

	if ( isTriennially( product ) ) {
		return true;
	}

	return false;
}
