/** @format */

/**
 * External dependencies
 */
import { isPlainObject, noop, snakeCase } from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { DOMAIN_CONTACT_INFORMATION_VALIDATE_REQUEST } from 'state/action-types';
import { receiveDomainContactValidation } from 'state/domains/management/actions';

/**
 * @module state/data-layer/wpcom/me/domain-contact-information/validate
 */

/**
 * Posts a request to /me/domain-contact-information/validate to validate domain contact details
 *
 * @param {Object} action Redux action
 * @returns {Object} WordPress.com API HTTP Request action object
 */

// TODO: this is temp: normalize the data for the contact details check here
// but it's a util in: data = mapKeysRecursively( data, snakeCase ). See: client/lib/wpcom-undocumented/lib/undocumented.js

function mapKeysRecursively( object, fn ) {
	return Object.keys( object ).reduce( function( mapped, key ) {
		var value = object[ key ];
		if ( isPlainObject( value ) ) {
			value = mapKeysRecursively( value, fn );
		}

		mapped[ fn( key ) ] = value;
		return mapped;
	}, {} );
}

export const fetchDomainContactValidation = action => {
	const body = mapKeysRecursively( {
		contactInformation: action.contactInformation,
		domainNames: action.domainNames,
	}, snakeCase );

	return 	http(
		{
			apiVersion: '1.1',
			method: 'POST',
			path: '/me/domain-contact-information/validate',
			body,
		},
		action
	);
}


/**
 * Dispatches returned domain contact validation messages
 *
 * @param {Object} action Redux action
 * @param {Array} data raw data from /me/domain-contact-information/validate
 * @returns {Object} Redux action
 */
export const addDomainContactValidation = ( action, data ) => receiveDomainContactValidation( data );

export const dispatchPlansRequest = dispatchRequestEx( {
	fetch: fetchDomainContactValidation,
	onSuccess: addDomainContactValidation,
	onError: noop,
} );

export default {
	[ DOMAIN_CONTACT_INFORMATION_VALIDATE_REQUEST ]: [ dispatchPlansRequest ],
};
