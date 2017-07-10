/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_PAYMENT_METHOD_UPDATE,
} from 'woocommerce/state/action-types';
/**
 * Internal dependencies
 */
import { savePaymentMethodSuccess } from 'woocommerce/state/sites/payment-methods/actions';
import { dispatchWithProps } from 'woocommerce/state/helpers';
import { put } from 'woocommerce/state/data-layer/request/actions';

export default {
	[ WOOCOMMERCE_PAYMENT_METHOD_UPDATE ]: [
		( store, action ) => {
			const { siteId, method, successAction, failureAction } = action;

			const settings = {
				enabled: method.enabled ? 'yes' : 'no',
			};

			Object.keys( method.settings ).map( ( settingKey ) => {
				settings[ settingKey ] = method.settings[ settingKey ].value;
			} );

			const payload = {
				settings,
			};

			const updatedAction = ( dispatch, getState, { data } ) => {
				dispatch( savePaymentMethodSuccess( siteId, data, action ) );

				const props = { sentData: method.settings, receivedData: data };
				dispatchWithProps( dispatch, getState, successAction, props );
			};

			store.dispatch( put( siteId, `payment_gateways/${ method.id }`, payload, updatedAction, failureAction ) );
		},
	],
};
