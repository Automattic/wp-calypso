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
	shippingZoneUpdated,
	shippingZoneDeleted,
} from 'woocommerce/state/sites/shipping-zones/actions';
import {
	WOOCOMMERCE_SHIPPING_ZONE_CREATE,
	WOOCOMMERCE_SHIPPING_ZONE_DELETE,
	WOOCOMMERCE_SHIPPING_ZONE_UPDATE,
} from 'woocommerce/state/action-types';

export default {
	[ WOOCOMMERCE_SHIPPING_ZONE_CREATE ]: [
		( store, action ) => {
			const { siteId, zone, successAction, failureAction } = action;
			const apiZone = omit( zone, 'id' );

			const updatedAction = ( dispatch, getState, { data } ) => {
				dispatch( shippingZoneUpdated( siteId, data, action ) );

				const props = { sentData: zone, receivedData: data };
				dispatchWithProps( dispatch, getState, successAction, props );
			};

			store.dispatch( post( siteId, 'shipping/zones', apiZone, updatedAction, failureAction ) );
		},
	],

	[ WOOCOMMERCE_SHIPPING_ZONE_UPDATE ]: [
		( store, action ) => {
			const { siteId, zone, successAction, failureAction } = action;

			const updatedAction = ( dispatch, getState, { data } ) => {
				dispatch( shippingZoneUpdated( siteId, data, action ) );

				const props = { sentData: zone, receivedData: data };
				dispatchWithProps( dispatch, getState, successAction, props );
			};

			store.dispatch(
				put( siteId, 'shipping/zones/' + zone.id, omit( zone, 'id' ), updatedAction, failureAction )
			);
		},
	],

	[ WOOCOMMERCE_SHIPPING_ZONE_DELETE ]: [
		( store, action ) => {
			const { siteId, zone, successAction, failureAction } = action;

			const deletedAction = ( dispatch, getState, { data } ) => {
				dispatch( shippingZoneDeleted( siteId, action ) );

				const props = { sentData: zone, receivedData: data };
				dispatchWithProps( dispatch, getState, successAction, props );
			};

			store.dispatch(
				del( siteId, 'shipping/zones/' + zone.id + '?force=true', deletedAction, failureAction )
			);
		},
	],
};
