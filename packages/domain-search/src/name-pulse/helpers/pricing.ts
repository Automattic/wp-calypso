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

const formatPrice = ( amount: number, currencyCode: string ) =>
	formatCurrency( amount, currencyCode, { stripZeros: true } );

/**
 * Only `sale_cost` is a bare number, so a sale needs a known currency to render;
 * without one the server-formatted `cost` stands in for the yearly price.
 */
export const getDisplayPrices = ( {
	cost,
	raw_price: rawPrice,
	sale_cost: saleCost,
	currency_code: currencyCode,
}: NamePulsePricing ): { yearlyPrice?: string; salePrice?: string } => ( {
	yearlyPrice:
		typeof rawPrice === 'number' && currencyCode ? formatPrice( rawPrice, currencyCode ) : cost,
	salePrice:
		typeof saleCost === 'number' && currencyCode
			? formatPrice( saleCost, currencyCode )
			: undefined,
} );
