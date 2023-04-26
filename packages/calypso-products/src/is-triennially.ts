import { PLAN_TRIENNIAL_PERIOD } from './constants';

export function isTriennially( product: { bill_period: string } ): boolean {
	return parseInt( product.bill_period, 10 ) === PLAN_TRIENNIAL_PERIOD;
}
