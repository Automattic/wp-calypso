import { __, sprintf } from '@wordpress/i18n';
import { formatCurrency } from 'i18n-calypso';
import {
	isDomainBundledWithPlan,
	isDomainMappingFree,
	isNextDomainFree,
} from 'calypso/lib/cart-values/cart-items';

export function getMappingPriceText( { cart, currencyCode, domain, productsList, selectedSite } ) {
	let mappingProductPrice;

	if (
		isDomainMappingFree( selectedSite ) ||
		isNextDomainFree( cart ) ||
		isDomainBundledWithPlan( cart, domain )
	) {
		return null;
	}

	const price = productsList?.domain_map?.cost;
	if ( price ) {
		mappingProductPrice = formatCurrency( price, currencyCode );
		/* translators: %s - the cost of the domain mapping formatted in the user's currency */
		mappingProductPrice = sprintf( __( '%s/year' ), mappingProductPrice );
	}

	return mappingProductPrice;
}
