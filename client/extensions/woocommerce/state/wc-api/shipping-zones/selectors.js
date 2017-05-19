/**
 * External dependencies
 */
import { get, isArray } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { LOADING } from './reducer';

const getRawShippingZones = ( state, siteId ) => get( state, [ 'extensions', 'woocommerce', 'wcApi', siteId, 'shippingZones' ] );

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the shipping zones list has been successfully loaded from the server
 */
export const areShippingZonesLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	return isArray( getRawShippingZones( state, siteId ) );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the shipping zones list is currently being retrieved from the server
 */
export const areShippingZonesLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	return LOADING === getRawShippingZones( state, siteId );
};
