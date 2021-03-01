/**
 * External dependencies
 */
import { isEmpty, find, values } from 'lodash';

/**
 * Internal dependencies
 */
import { hasDomainRegistration, getDomainRegistrations } from 'calypso/lib/cart-values/cart-items';
import { isDomainRegistration } from 'calypso/lib/products-values/is-domain-registration';

/**
 * Depending on the current step in checkout, the user's domain can be found in
 * either the cart or the receipt.
 *
 * @param {import('calypso/my-sites/checkout/composite-checkout/types/wpcom-store-state').TransactionResponse} [receipt] - The receipt for the transaction
 * @param {import('@automattic/shopping-cart').ResponseCart} cart - The cart for the transaction
 *
 * @returns {string|null} the name of the first domain for the transaction.
 */
export function getDomainNameFromReceiptOrCart( receipt, cart ) {
	let domainRegistration;

	if ( receipt && ! isEmpty( receipt.purchases ) ) {
		domainRegistration = find( values( receipt.purchases ), isDomainRegistration );
	}

	if ( hasDomainRegistration( cart ) ) {
		domainRegistration = getDomainRegistrations( cart )[ 0 ];
	}

	if ( domainRegistration ) {
		return domainRegistration.meta;
	}

	return null;
}
