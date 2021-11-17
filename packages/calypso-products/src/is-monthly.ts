import { JETPACK_MONTHLY_PLANS, PLAN_MONTHLY_PERIOD, WPCOM_MONTHLY_PLANS } from './constants';

export function isMonthlyProduct( product: { bill_period: string } ): boolean {
	return parseInt( product.bill_period, 10 ) === PLAN_MONTHLY_PERIOD;
}

export function isMonthly( plan: string ): boolean {
	return (
		( WPCOM_MONTHLY_PLANS as ReadonlyArray< string > ).includes( plan ) ||
		( JETPACK_MONTHLY_PLANS as ReadonlyArray< string > ).includes( plan )
	);
}
