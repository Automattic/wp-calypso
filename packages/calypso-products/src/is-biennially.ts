import { PLAN_BIENNIAL_PERIOD } from './constants';

export function isBiennially( product: { bill_period: string } ): boolean {
	return parseInt( product.bill_period, 10 ) === PLAN_BIENNIAL_PERIOD;
}
