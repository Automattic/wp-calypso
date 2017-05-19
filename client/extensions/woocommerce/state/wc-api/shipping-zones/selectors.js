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

export const areShippingZonesLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	return isArray( getRawShippingZones( state, siteId ) );
};

export const areShippingZonesLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	return LOADING === getRawShippingZones( state, siteId );
};
