/** @format */

/**
 * External dependencies
 */
import { noop, snakeCase, each } from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { DOMAIN_CONTACT_GAPPS_VALIDATE_REQUEST } from 'state/action-types';
import { receiveDomainContactValidation } from 'state/domains/management/actions';

/**
 * @module state/data-layer/wpcom/me/google-apps/validate
 */

/**
 * Posts a request to /me/google-apps/validate to validate gapps contact details
 *
 * @param {Object} action Redux action
 * @returns {Object} WordPress.com API HTTP Request action object
 */
export const fetchGAppsValidation = action => {
	const contactInformation = {};
	each( action.contactInformation, ( value, key ) => {
		contactInformation[ snakeCase( key ) ] = value;
	} );
	return 	http(
		{
			apiVersion: '1.1',
			method: 'POST',
			path: '/me/google-apps/validate',
			body: {
				contact_information: contactInformation,
			},
		},
		action
	);
};

/**
 * Dispatches returned google app contact validation messages
 *
 * @param {Object} action Redux action
 * @param {Array} data raw data from /me/google-appsn/validate
 * @returns {Object} Redux action
 */
export const addGAppsContactValidation = ( action, data ) => receiveDomainContactValidation( data );

export const dispatchPlansRequest = dispatchRequestEx( {
	fetch: fetchGAppsValidation,
	onSuccess: addGAppsContactValidation,
	onError: noop,
} );

export default {
	[ DOMAIN_CONTACT_GAPPS_VALIDATE_REQUEST ]: [ dispatchPlansRequest ],
};
