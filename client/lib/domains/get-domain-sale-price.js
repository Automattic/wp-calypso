import { formatCurrency } from '@automattic/number-formatters';
import { getUnformattedDomainSalePrice } from './get-unformatted-domain-sale-price';

export function getDomainSalePrice( slug, productsList, currencyCode, stripZeros = false ) {
	let saleCost = getUnformattedDomainSalePrice( slug, productsList );

	if ( saleCost ) {
		saleCost = formatCurrency( saleCost, currencyCode, { stripZeros } );
	}

	return saleCost;
}
