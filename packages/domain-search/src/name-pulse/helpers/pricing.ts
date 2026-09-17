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
 * Only `sale_cost` is a bare number, so a sale needs a known currency to render.
 */
export const hasSalePrice = ( {
	sale_cost: saleCost,
	currency_code: currencyCode,
}: NamePulseDomainResult ) => typeof saleCost === 'number' && !! currencyCode;

export const getResultPrices = ( {
	cost,
	raw_price: rawPrice,
	sale_cost: saleCost,
	currency_code: currencyCode,
}: NamePulseDomainResult ) => {
	const yearlyPrice =
		typeof rawPrice === 'number' && currencyCode ? formatPrice( rawPrice, currencyCode ) : cost;

	if ( ! yearlyPrice ) {
		return undefined;
	}

	const salePrice =
		typeof saleCost === 'number' && currencyCode
			? formatPrice( saleCost, currencyCode )
			: undefined;

	return { yearlyPrice, salePrice };
};
