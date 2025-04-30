import { formatCurrency } from '@automattic/number-formatters';
import { getUnformattedDomainPrice } from './get-unformatted-domain-price';

export function getDomainPrice( slug, productsList, currencyCode, stripZeros = false ) {
	let price = getUnformattedDomainPrice( slug, productsList );

	if ( typeof price === 'number' ) {
		price = formatCurrency( price, currencyCode, { stripZeros } );
	}

	return price;
}
