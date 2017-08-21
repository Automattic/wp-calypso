/**
 * External dependencies
 */
import {
	castArray,
	isEmpty,
	find,
	kebabCase,
	map,
	values,
} from 'lodash';

/**
 * Internal dependencies
 */
import { type as domainTypes } from './constants';
import { cartItems } from 'lib/cart-values';
import { isDomainRegistration } from 'lib/products-values';

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

/**
 * Fix mis-alignment names for one or more whois contact fields used on the
 * front and back ends.
 *
 * @param  {String|[String]} wpcomFieldNames - The wpcom name for a whois field.
 * @return {String} The corresponding calypso field name(s).
 */
function calypsoifyWhoisFieldNames( wpcomFieldNames ) {
	const explicitConversions = {
		country: 'country-code',
		org_name: 'organization',
	};

	return map(
		castArray( wpcomFieldNames ),
		name => explicitConversions[ name ] || kebabCase( name )
	);
}

export {
	getDomainNameFromReceiptOrCart,
	getDomainType,
	calypsoifyWhoisFieldNames,
};
