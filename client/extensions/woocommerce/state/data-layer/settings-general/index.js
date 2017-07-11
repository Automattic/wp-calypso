/**
 * Internal dependencies
 */
import { put } from 'woocommerce/state/data-layer/request/actions';
import { saveCurrencySuccess } from 'woocommerce/state/sites/settings/general/actions';
import { WOOCOMMERCE_CURRENCY_UPDATE } from 'woocommerce/state/action-types';

export default {
	[ WOOCOMMERCE_CURRENCY_UPDATE ]: [
		/**
		 * Issues a PUT request to settings/general/woocommerce_currency
		 * @param {Object} store - Redux store
		 * @param {Object} action - and action with the following fields: siteId, currency, successAction, failureAction
		 */
		( store, action ) => {
			const { siteId, currency, successAction, failureAction } = action;

			const payload = {
				value: currency,
			};

			/**
			 * A callback issued after a successful request
			 * @param {Function} dispatch - dispatch function
			 * @param {Function} getState - getState function
			 * @param {Object} data - data returned by the server
			 */
			const updatedAction = ( dispatch, getState, { data } ) => {
				dispatch( saveCurrencySuccess( siteId, data, action ) );
				dispatch( successAction );
			};

			store.dispatch( put( siteId, 'settings/general/woocommerce_currency', payload, updatedAction, failureAction ) );
		},
	],
};
