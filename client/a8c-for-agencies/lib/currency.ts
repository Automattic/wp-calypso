import { formatNumberCompact, getCurrencyObject } from '@automattic/number-formatters';

/**
 * Formats a currency amount in compact form (e.g., $1M instead of $1,000,000)
 * @param amount - The numeric amount to format
 * @param currencyCode - The currency code (defaults to 'USD')
 * @returns Formatted currency string in compact form
 * @example
 * formatCurrencyCompact(1000000, 'USD') // Returns "$1M"
 * formatCurrencyCompact(500000, 'USD') // Returns "$500k"
 * formatCurrencyCompact(1000000, 'EUR') // Returns "1M €" (depending on locale)
 */
export const formatCurrencyCompact = ( amount: number, currencyCode = 'USD' ) => {
	const currencyObject = getCurrencyObject( amount, currencyCode );
	const formattedAmount =
		currencyObject.symbolPosition === 'before'
			? `${ currencyObject.symbol }${ formatNumberCompact( amount ) }`
			: `${ formatNumberCompact( amount ) }${ currencyObject.symbol }`;

	return formattedAmount;
};
