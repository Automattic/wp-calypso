/** @format */

/**
 * Internal dependencies
 */

import { dispatchWithProps } from 'client/extensions/woocommerce/state/helpers';
import { put } from 'client/extensions/woocommerce/state/data-layer/request/actions';
import { shippingZoneLocationsUpdated } from 'client/extensions/woocommerce/state/sites/shipping-zone-locations/actions';
import { WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_UPDATE } from 'client/extensions/woocommerce/state/action-types';

export default {
	[ WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_UPDATE ]: [
		( store, action ) => {
			const { siteId, zoneId, locations, successAction, failureAction } = action;

			const updatedAction = ( dispatch, getState, { data } ) => {
				dispatch( shippingZoneLocationsUpdated( siteId, data, action ) );

				const props = { sentData: locations, receivedData: data };
				dispatchWithProps( dispatch, getState, successAction, props );
			};

			const parsedLocations = [];
			Object.keys( locations ).forEach( type => {
				locations[ type ].forEach( code => {
					parsedLocations.push( { type, code } );
				} );
			} );

			store.dispatch(
				put(
					siteId,
					'shipping/zones/' + zoneId + '/locations',
					parsedLocations,
					updatedAction,
					failureAction
				)
			);
		},
	],
};
