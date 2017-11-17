/** @format */

/**
 * External dependencies
 */
import { drop, isEmpty, join, find, split, values } from 'lodash';

/**
 * Internal dependencies
 */
import { type as domainTypes, transferStatus } from './constants';
import { cartItems } from 'lib/cart-values';
import { isDomainRegistration } from 'lib/products-values';

function getDomainType( domainFromApi ) {
	if ( domainFromApi.type === 'redirect' ) {
		return domainTypes.SITE_REDIRECT;
	}

	if ( domainFromApi.type === 'transfer' ) {
		return domainTypes.TRANSFER;
	}

	if ( domainFromApi.wpcom_domain ) {
		return domainTypes.WPCOM;
	}

	if ( domainFromApi.has_registration ) {
		return domainTypes.REGISTERED;
	}

	return domainTypes.MAPPED;
}

function getTransferStatus( domainFromApi ) {
	if ( domainFromApi.transfer_status === 'pending_owner' ) {
		return transferStatus.PENDING_OWNER;
	}

	if ( domainFromApi.transfer_status === 'pending_registry' ) {
		return transferStatus.PENDING_REGISTRY;
	}

	if ( domainFromApi.transfer_status === 'cancelled' ) {
		return transferStatus.CANCELLED;
	}

	if ( domainFromApi.transfer_status === 'completed' ) {
		return transferStatus.COMPLETED;
	}

	return null;
}

/**
 * Depending on the current step in checkout, the user's domain can be found in
 * either the cart or the receipt.
 *
 * @param {?Object} receipt - The receipt for the transaction
 * @param {?Object} cart - The cart for the transaction
 *
 * @return {?String} the name of the first domain for the transaction.
 */
function getDomainNameFromReceiptOrCart( receipt, cart ) {
	let domainRegistration;

	if ( receipt && ! isEmpty( receipt.purchases ) ) {
		domainRegistration = find( values( receipt.purchases ), isDomainRegistration );
	}

	if ( cartItems.hasDomainRegistration( cart ) ) {
		domainRegistration = cartItems.getDomainRegistrations( cart )[ 0 ];
	}

	if ( domainRegistration ) {
		return domainRegistration.meta;
	}

	return null;
}

function parseDomainAgainstTldList( domainFragment, tldList ) {
	if ( ! domainFragment ) {
		return '';
	}

	if ( tldList[ domainFragment ] !== undefined ) {
		return domainFragment;
	}

	const parts = split( domainFragment, '.' );
	const suffix = join( drop( parts ), '.' );

	return parseDomainAgainstTldList( suffix, tldList );
}

export {
	getDomainNameFromReceiptOrCart,
	getDomainType,
	getTransferStatus,
	parseDomainAgainstTldList,
};
