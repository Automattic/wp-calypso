import { PLAN_ANNUAL_PERIOD } from './constants';

export function isYearly( product: { bill_period: string } ): boolean {
	return parseInt( product.bill_period, 10 ) === PLAN_ANNUAL_PERIOD;
}
