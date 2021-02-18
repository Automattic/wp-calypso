/**
 * External dependencies
 */

import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchWithProps } from 'woocommerce/state/helpers';
import { post, put, del } from 'woocommerce/state/data-layer/request/actions';
import {
	shippingZoneMethodUpdated,
	shippingZoneMethodDeleted,
} from 'woocommerce/state/sites/shipping-zone-methods/actions';
import {
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_CREATE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_DELETE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATE,
} from 'woocommerce/state/action-types';

export default {
	[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_CREATE ]: [
		( store, action ) => {
			const { siteId, zoneId, methodId, methodType, order, successAction, failureAction } = action;
			const payload = { method_id: methodType, order };

			const updatedAction = ( dispatch, getState, { data } ) => {
				dispatch( shippingZoneMethodUpdated( siteId, data, action ) );

				const props = { sentData: { id: methodId, ...payload }, receivedData: data };
				dispatchWithProps( dispatch, getState, successAction, props );
			};

			store.dispatch(
				post(
					siteId,
					'shipping/zones/' + zoneId + '/methods',
					payload,
					updatedAction,
					failureAction
				)
			);
		},
	],

	[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATE ]: [
		( store, action ) => {
			const { siteId, zoneId, methodId, method, successAction, failureAction } = action;
			const payload = {
				enabled: method.enabled,
				settings: omit( method, 'enabled' ),
			};

			const updatedAction = ( dispatch, getState, { data } ) => {
				dispatch( shippingZoneMethodUpdated( siteId, data, action ) );

				const props = { sentData: method, receivedData: data };
				dispatchWithProps( dispatch, getState, successAction, props );
			};

			store.dispatch(
				put(
					siteId,
					'shipping/zones/' + zoneId + '/methods/' + methodId,
					payload,
					updatedAction,
					failureAction
				)
			);
		},
	],

	[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_DELETE ]: [
		( store, action ) => {
			const { siteId, zoneId, methodId, successAction, failureAction } = action;

			const deletedAction = ( dispatch, getState, { data } ) => {
				dispatch( shippingZoneMethodDeleted( siteId, action ) );

				const props = { sentData: methodId, receivedData: data };
				dispatchWithProps( dispatch, getState, successAction, props );
			};

			const url = 'shipping/zones/' + zoneId + '/methods/' + methodId + '?force=true';
			store.dispatch( del( siteId, url, deletedAction, failureAction ) );
		},
	],
};
