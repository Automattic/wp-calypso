/**
 * Internal dependencies
 */
import { PLAN_ANNUAL_PERIOD } from 'calypso/lib/plans/constants';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isYearly( rawProduct: FormattedProduct | CamelCaseProduct ): boolean {
	const product = formatProduct( rawProduct );
	const billPeriodString = String( product.bill_period ?? '' );
	return parseInt( billPeriodString, 10 ) === PLAN_ANNUAL_PERIOD;
}
