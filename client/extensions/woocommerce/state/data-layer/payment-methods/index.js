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

			// Temporary Fix.
			// If blank values get passed back to the API (see https://github.com/Automattic/wp-calypso/pull/21618#issuecomment-358844061)
			// the API call will fail. We can remove this hack when we stop the payment method saving code from passing up all fields, and
			// only pass edited fields. See https://github.com/Automattic/wp-calypso/issues/21670
			if ( 'stripe' === method.id ) {
				if ( ! settings.payment_request_button_theme ) {
					settings.payment_request_button_theme = 'dark';
				}

				if ( ! settings.payment_request_button_type ) {
					settings.payment_request_button_type = 'buy';
				}

				if ( ! settings.payment_request_button_height ) {
					settings.payment_request_button_height = '44';
				}
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
