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
