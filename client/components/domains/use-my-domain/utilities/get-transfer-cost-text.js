import { createElement, createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { formatCurrency } from 'i18n-calypso';
import { isDomainBundledWithPlan, isNextDomainFree } from 'calypso/lib/cart-values/cart-items';
import { domainAvailability } from 'calypso/lib/domains/constants';

export function getTransferCostText( { cart, domain, availability } ) {
	let domainProductSalePrice = null;

	if (
		availability?.status === domainAvailability.TRANSFERRABLE_PREMIUM &&
		availability?.is_price_limit_exceeded !== true &&
		availability?.raw_price
	) {
		domainProductSalePrice = formatCurrency( availability?.raw_price, availability?.currency_code );
	}

	if (
		! domainProductSalePrice ||
		isNextDomainFree( cart ) ||
		isDomainBundledWithPlan( cart, domain )
	) {
		return;
	}

	return createInterpolateElement(
		sprintf(
			/* translators: %s is the cost of the domain transfer formatted in the user's currency. */
			__( '%s <small>will renew the domain for an additional year</small>' ),
			domainProductSalePrice
		),
		{ small: createElement( 'small' ) }
	);
}
