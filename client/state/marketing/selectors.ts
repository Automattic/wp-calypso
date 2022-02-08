import {
	JETPACK_PRODUCTS_BY_TERM,
	JETPACK_RESET_PLANS_BY_TERM,
	PRODUCT_JETPACK_SEARCH,
} from '@automattic/calypso-products';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import type { AppState } from 'calypso/types';
import 'calypso/state/marketing/init';

export interface JetpackSaleCoupon {
	discount: number;
	start_date: string;
	expiry_date: string;
	sale_title: string;
	final_discount: number;
}

export function isTreatmentPlansReorderTest( state: AppState ): boolean {
	return 'treatment' === getCurrentUser( state )?.meta?.plans_reorder_abtest_variation;
}

export function getJetpackSaleCoupon( state: AppState ): JetpackSaleCoupon | null {
	return state?.marketing?.jetpackSaleCoupon?.coupon;
}

export function getHasRequestedJetpackSaleCoupon( state: AppState ): boolean {
	return state?.marketing?.jetpackSaleCoupon?.isRequesting === false;
}

export function getIsRequestingJetpackSaleCoupon( state: AppState ): boolean {
	return state?.marketing?.jetpackSaleCoupon?.isRequesting === true;
}

export function getJetpackSaleCouponDiscountRatio( state: AppState ): number {
	const discount = getJetpackSaleCoupon( state )?.discount || 0;
	return discount / 100;
}

export function getFullJetpackSaleCouponDiscountRatio( state: AppState ): number {
	const discount = getJetpackSaleCoupon( state )?.final_discount || 0;
	return discount / 100;
}

interface DiscountMap {
	[ productSlug: string ]: number;
}

export function getJetpackCouponDiscountMap( state: AppState ): DiscountMap {
	// discountedPricePercentage is 1 - discountPercentage.
	const discountedPricePercentage =
		( 100 - ( getJetpackSaleCoupon( state )?.discount || 0 ) ) / 100;
	const discountMap: DiscountMap = {};

	//  outside of sales ( when the discountedPricePercentage is 100% or full price ) there is no need to build this object
	if ( discountedPricePercentage < 1 ) {
		[ ...JETPACK_RESET_PLANS_BY_TERM, ...JETPACK_PRODUCTS_BY_TERM ].forEach( ( { yearly } ) => {
			// search requires special discount support since it does not have an introductory offer
			if ( yearly !== PRODUCT_JETPACK_SEARCH ) {
				discountMap[ yearly ] = discountedPricePercentage;
			}
		} );
	}

	return discountMap;
}
