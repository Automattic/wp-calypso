import { formatCurrency } from '@automattic/format-currency';

export function getDisplayPrices( prices: ( number | null )[], currencyCode: string ) {
	/**
	 * Prices are represented in smallest units for a currency, and not as prices that
	 * are actually displayed. Ex. $20 is the integer 2000, and not 20. To determine if
	 * the display price is too long, we convert the integer to a display string.
	 */
	return prices.map( ( price ) => {
		return price
			? formatCurrency( price, currencyCode, {
					stripZeros: true,
					isSmallestUnit: true,
			  } )
			: '';
	} );
}
