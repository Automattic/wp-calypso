/** @format */

/**
 * Internal dependencies
 */

import { put } from 'woocommerce/state/data-layer/request/actions';
import { savePaymentMethodSuccess } from 'woocommerce/state/sites/payment-methods/actions';
import { WOOCOMMERCE_PAYMENT_METHOD_UPDATE } from 'woocommerce/state/action-types';

export default {
	[ WOOCOMMERCE_PAYMENT_METHOD_UPDATE ]: [
		/**
		 * Issues a PUT request to payment_gateways/${ method.id }
		 * @param {Object} store - Redux store
		 * @param {Object} action - and action with the following fields: siteId, method, successAction, failureAction
		 */
		( store, action ) => {
			const { siteId, method, successAction, failureAction } = action;

			const settings = {
				enabled: method.enabled ? 'yes' : 'no',
			};

			Object.keys( method.settings ).map( settingKey => {
				settings[ settingKey ] = method.settings[ settingKey ].value;
			} );

			// Temporary Fix. See https://github.com/woocommerce/woocommerce-gateway-stripe/issues/459
			// The API default when no choice has been chosen previously is a string 'default'
			// If that gets passed back to the API, the entire request fails.
			if ( 'stripe' === method.id ) {
				settings.payment_request_button_theme = 'dark';
			}

			const payload = {
				settings,
				description: method.description,
			};

			/**
			 * A callback issued after a successful request
			 * @param {Function} dispatch - dispatch function
			 * @param {Function} getState - getState function
			 * @param {Object} data - data returned by the server
			 */
			const updatedAction = ( dispatch, getState, { data } ) => {
				dispatch( savePaymentMethodSuccess( siteId, data, action ) );
				dispatch( successAction );
			};

			store.dispatch(
				put( siteId, `payment_gateways/${ method.id }`, payload, updatedAction, failureAction )
			);
		},
	],
};
