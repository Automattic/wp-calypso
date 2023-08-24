import { PLAN_CENTENNIAL_PERIOD } from './constants';

export function isCentennially( product: { bill_period: string } ): boolean {
	return parseInt( product.bill_period, 10 ) === PLAN_CENTENNIAL_PERIOD;
}
