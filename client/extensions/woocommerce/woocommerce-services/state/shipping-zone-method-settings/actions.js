/**
 * Internal dependencies
 */

import * as api from '../../api';
import { setError } from 'woocommerce/state/sites/status/wc-api/actions';
import {
	WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_SETTINGS_REQUEST,
	WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_SETTINGS_REQUEST_SUCCESS,
} from 'woocommerce/woocommerce-services/state/action-types';
import {
	isShippingZoneMethodSettingsLoaded,
	isShippingZoneMethodSettingsLoading,
} from './selectors';

export const fetchShippingZoneMethodSettingsSuccess = ( siteId, instanceId, data ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_SETTINGS_REQUEST_SUCCESS,
		siteId,
		instanceId,
		data,
	};
};

export const fetchShippingZoneMethodSettings = ( siteId, methodId, instanceId ) => (
	dispatch,
	getState
) => {
	if (
		isShippingZoneMethodSettingsLoaded( getState(), instanceId, siteId ) ||
		isShippingZoneMethodSettingsLoading( getState(), instanceId, siteId )
	) {
		return;
	}

	const getAction = {
		type: WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_SETTINGS_REQUEST,
		instanceId,
		siteId,
	};

	dispatch( getAction );

	return api
		.get( siteId, api.url.serviceSettings( methodId, instanceId ) )
		.then( ( data ) =>
			dispatch( fetchShippingZoneMethodSettingsSuccess( siteId, instanceId, data ) )
		)
		.catch( ( err ) => dispatch( setError( siteId, getAction, err ) ) );
};
