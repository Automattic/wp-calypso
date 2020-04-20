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
		 *
		 * @param {object} store - Redux store
		 * @param {object} action - and action with the following fields: siteId, method, successAction, failureAction
		 */
		( store, action ) => {
			const { siteId, method, successAction, failureAction } = action;

			const payload = {};
			const settings = {};
			Object.keys( method.settings ).map( ( settingKey ) => {
				if ( 'enabled' === settingKey ) {
					payload.enabled = method.settings.enabled;
					return;
				}

				if ( 'title' === settingKey ) {
					payload.title = method.settings.title.value;
					return;
				}

				if ( 'description' === settingKey ) {
					payload.description = method.settings.description.value;
					return;
				}

				settings[ settingKey ] = method.settings[ settingKey ].value;
			} );

			payload.settings = settings;

			/**
			 * A callback issued after a successful request
			 *
			 * @param {Function} dispatch - dispatch function
			 * @param {Function} getState - getState function
			 * @param {object} data - data returned by the server
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
