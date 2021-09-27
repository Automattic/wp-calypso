import { getCurrentUser } from 'calypso/state/current-user/selectors';
import type { AppState } from 'calypso/types';
import 'calypso/state/marketing/init';

export interface JetpackSaleCoupon {
	discount: number;
	start_date: string;
	expiry_date: string;
}

export function isTreatmentPlansReorderTest( state: AppState ): boolean {
	return 'treatment' === getCurrentUser( state )?.meta.plans_reorder_abtest_variation;
}

export function getJetpackSaleCoupon( state: AppState ): JetpackSaleCoupon | null {
	return state?.marketing?.jetpackSaleCoupon;
}

export function getJetpackSaleCouponDiscountRatio( state: AppState ): number {
	const discount = getJetpackSaleCoupon( state )?.discount || 0;
	return discount / 100;
}
