/**
 * @format
 */

/**
 * External Dependencies
 */
import { noop } from 'lodash';

/**
 * Internal Dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { EMERGENT_PAYWALL_REQUEST } from 'state/action-types';
import { emergentPaywallConfigurationReceive } from 'state/checkout/emergent-paywall/actions';

/**
 * Dispatches a request to fetch a new emergent paywall iframe configuration
 *
 * @param   {Object} action Redux action
 * @returns {Object} http action
 */
export function fetchEmergentPaywallConfiguration( action ) {
	return http(
		{
			method: 'POST',
			apiVersion: '1.1',
			path: '/me/emergent-paywall-configuration',
			body: {
				cart: action.cart,
				country: action.countryCode,
			},
		},
		action
	);
}

/**
 * Dispatches an action with the updated emergent paywall iframe configuration
 *
 * @param   {Object} action Redux action
 * @param   {Object} data Object containing configuration for emergent paywall iframe
 * @returns {Object} Action object
 */
export const updateEmergentPaywallConfiguration = ( action, data ) =>
	emergentPaywallConfigurationReceive( data );

export default {
	[ EMERGENT_PAYWALL_REQUEST ]: [
		dispatchRequestEx( {
			fetch: fetchEmergentPaywallConfiguration,
			onSuccess: updateEmergentPaywallConfiguration,
			onError: noop,
		} ),
	],
};
