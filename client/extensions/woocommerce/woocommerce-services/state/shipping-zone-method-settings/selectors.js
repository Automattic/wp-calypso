/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
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
 * @param {object} state Whole Redux state tree
 * @param {string} instanceId Shipping method instance ID
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the settings for the giving shipping zone method have been successfully loaded from the server
 */
export const isShippingZoneMethodSettingsLoaded = (
	state,
	instanceId,
	siteId = getSelectedSiteId( state )
) => {
	return true === getAllShippingZoneMethodSettingsLoadState( state, siteId )[ instanceId ];
};

/**
 * @param {object} state Whole Redux state tree
 * @param {string} instanceId Shipping method instance ID
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the shipping zone method settings currently being retrieved from the server
 */
export const isShippingZoneMethodSettingsLoading = (
	state,
	instanceId,
	siteId = getSelectedSiteId( state )
) => {
	return LOADING === getAllShippingZoneMethodSettingsLoadState( state, siteId )[ instanceId ];
};
