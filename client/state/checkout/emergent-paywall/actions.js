/** @format */

/**
 * Internal dependencies
 */

import { EMERGENT_PAYWALL_RECEIVE, EMERGENT_PAYWALL_REQUEST } from 'state/action-types';

/**
 * Returns an action object to signal the request of the emergent paywall iframe configuration.
 * @param {object} cart Current cart object. See: client/lib/cart/store/index.
 * @param {string} countryCode User's country code
 * @returns {Object} action object
 */
export const requestEmergentPaywallConfiguration = ( cart, countryCode ) => ( {
	type: EMERGENT_PAYWALL_REQUEST,
	cart,
	countryCode,
} );

/**
 * Returns an action object to signal the arrival of emergent paywall iframe configuration.
 *
 * @param  {Object} data Properties for emergent paywall iframe
 * @return {Object} action object
 */
export const emergentPaywallConfigurationReceive = data => ( {
	type: EMERGENT_PAYWALL_RECEIVE,
	...data,
} );
