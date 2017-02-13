/**
 * External dependencies
 */
import { isEmpty, map, values } from 'lodash';

/**
 * Internal dependencies
 */
import { type as domainTypes } from './constants';
import { cartItems } from 'lib/cart-values';

function getDomainType( domainFromApi ) {
	if ( domainFromApi.type === 'redirect' ) {
		return domainTypes.SITE_REDIRECT;
	}

	if ( domainFromApi.wpcom_domain ) {
		return domainTypes.WPCOM;
	}

	if ( domainFromApi.has_registration ) {
		return domainTypes.REGISTERED;
	}

	return domainTypes.MAPPED;
}

function getDomainNameFromReceiptOrCart( receipt, cart ) {
	if ( receipt && isEmpty( receipt.failed_purchases ) ) {
		return map( values( receipt.purchases )[ 0 ], 'meta' )[ 0 ];
	}

	if ( cartItems.hasDomainRegistration( cart ) ) {
		return cartItems.getDomainRegistrations( cart )[ 0 ].meta;
	}

	return null;
}

export {
	getDomainNameFromReceiptOrCart,
	getDomainType
};
