import type { AppState } from 'calypso/types';
import 'calypso/state/marketing/init';

export interface JetpackSaleCoupon {
	discount: number;
	start_date: string;
	expiry_date: string;
	sale_title: string;
	sale_description: string;
	final_discount: number;
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
