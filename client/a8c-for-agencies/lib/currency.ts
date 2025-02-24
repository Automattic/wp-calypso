import { getCurrencyObject } from '@automattic/format-currency';
import { numberFormatCompact } from 'i18n-calypso';

export const formatCurrencyCompact = ( amount: number, currencyCode = 'USD' ) => {
	const currencyObject = getCurrencyObject( amount, currencyCode );
	const formattedAmount =
		currencyObject.symbolPosition === 'before'
			? `${ currencyObject.symbol }${ numberFormatCompact( amount ) }`
			: `${ numberFormatCompact( amount ) }${ currencyObject.symbol }`;

	return formattedAmount;
};
