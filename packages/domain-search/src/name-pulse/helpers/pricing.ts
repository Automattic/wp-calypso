import { formatCurrency } from '@automattic/number-formatters';
import type { NamePulseDomainResult } from './types';

export type NamePulsePricing = Pick<
	NamePulseDomainResult,
	'cost' | 'raw_price' | 'sale_cost' | 'currency_code' | 'is_premium'
>;

export const pickPricing = ( entry: NamePulsePricing ): NamePulsePricing => ( {
	cost: entry.cost,
	raw_price: entry.raw_price,
	sale_cost: entry.sale_cost,
	currency_code: entry.currency_code,
	is_premium: !! entry.is_premium,
} );

export const formatNamePulsePrice = ( amount: number, currencyCode: string ) =>
	formatCurrency( amount, currencyCode, { stripZeros: true } );

/**
 * Only `sale_cost` is a bare number, so a sale needs a known currency to render.
 */
export const getNamePulseSalePrice = ( {
	sale_cost: saleCost,
	currency_code: currencyCode,
}: Pick< NamePulsePricing, 'sale_cost' | 'currency_code' > ) =>
	typeof saleCost === 'number' && currencyCode
		? formatNamePulsePrice( saleCost, currencyCode )
		: undefined;
