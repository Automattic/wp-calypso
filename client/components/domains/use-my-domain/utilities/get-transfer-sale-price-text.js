import { createElement, createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { formatCurrency } from 'i18n-calypso';
import { isDomainBundledWithPlan, isNextDomainFree } from 'calypso/lib/cart-values/cart-items';
import { getDomainProductSlug, getDomainTransferSalePrice } from 'calypso/lib/domains';
import { domainAvailability } from 'calypso/lib/domains/constants';

export function getTransferSalePriceText( {
	cart,
	currencyCode,
	domain,
	productsList,
	availability,
} ) {
	let domainProductSalePrice = null;

	if (
		availability?.status === domainAvailability.TRANSFERRABLE_PREMIUM &&
		availability?.is_price_limit_exceeded !== true &&
		availability?.sale_cost
	) {
		domainProductSalePrice = formatCurrency( availability?.sale_cost, availability?.currency_code );
	} else {
		const productSlug = getDomainProductSlug( domain );
		domainProductSalePrice = getDomainTransferSalePrice( productSlug, productsList, currencyCode );
	}

	if (
		! domainProductSalePrice ||
		isNextDomainFree( cart ) ||
		isDomainBundledWithPlan( cart, domain )
	) {
		return;
	}

	return createInterpolateElement(
		/* translators: %s is the cost of the domain transfer formatted in the user's currency. */
		sprintf( __( '%s <small>for the first year</small>' ), domainProductSalePrice ),
		{ small: createElement( 'small' ) }
	);
}
