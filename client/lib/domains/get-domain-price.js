/**
 * External dependencies
 */
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { getUnformattedDomainPrice } from './get-unformatted-domain-price';

export function getDomainPrice( slug, productsList, currencyCode, stripZeros = false ) {
	let price = getUnformattedDomainPrice( slug, productsList );

	if ( price ) {
		price = formatCurrency( price, currencyCode, { stripZeros } );
	}

	return price;
}
