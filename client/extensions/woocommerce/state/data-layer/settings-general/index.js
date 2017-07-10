/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_CURRENCY_UPDATE,
} from 'woocommerce/state/action-types';
/**
 * Internal dependencies
 */
import { saveCurrencySuccess } from 'woocommerce/state/sites/settings/general/actions';
import { dispatchWithProps } from 'woocommerce/state/helpers';
import { put } from 'woocommerce/state/data-layer/request/actions';

export default {
	[ WOOCOMMERCE_CURRENCY_UPDATE ]: [
		( store, action ) => {
			const { siteId, currency, successAction, failureAction } = action;

			const payload = {
				value: currency,
			};

			const updatedAction = ( dispatch, getState, { data } ) => {
				dispatch( saveCurrencySuccess( siteId, data, action ) );

				const props = { sentData: currency, receivedData: data };
				dispatchWithProps( dispatch, getState, successAction, props );
			};

			store.dispatch( put( siteId, 'settings/general/woocommerce_currency', payload, updatedAction, failureAction ) );
		},
	],
};
