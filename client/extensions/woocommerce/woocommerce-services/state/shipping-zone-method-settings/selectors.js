/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { LOADING } from 'woocommerce/state/constants';

const getAllShippingZoneMethodSettingsLoadState = (
	state,
	siteId = getSelectedSiteId( state )
) => {
	return get(
		state,
		[ 'extensions', 'woocommerce', 'woocommerceServices', siteId, 'shippingZoneMethodSettings' ],
		{}
	);
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {String} instanceId Shipping method instance ID
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the settings for the giving shipping zone method have been successfully loaded from the server
 */
export const isShippingZoneMethodSettingsLoaded = (
	state,
	instanceId,
	siteId = getSelectedSiteId( state )
) => {
	return true === getAllShippingZoneMethodSettingsLoadState( state, siteId )[ instanceId ];
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {String} instanceId Shipping method instance ID
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the shipping zone method settings currently being retrieved from the server
 */
export const isShippingZoneMethodSettingsLoading = (
	state,
	instanceId,
	siteId = getSelectedSiteId( state )
) => {
	return LOADING === getAllShippingZoneMethodSettingsLoadState( state, siteId )[ instanceId ];
};
