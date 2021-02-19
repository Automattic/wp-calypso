/**
 * External dependencies
 */

import { get, isEmpty, isObject } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { LOADING } from 'woocommerce/state/constants';

export const getRawShippingZoneLocations = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'shippingZoneLocations' ] );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} zoneId Shipping Zone ID to check
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the locations for the given zone have been successfully loaded from the server
 */
export const areShippingZoneLocationsLoaded = (
	state,
	zoneId,
	siteId = getSelectedSiteId( state )
) => {
	const rawLocations = getRawShippingZoneLocations( state, siteId );
	return rawLocations && isObject( rawLocations[ zoneId ] );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} zoneId Shipping Zone ID to check
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the locations for the given zone are currently being retrieved from the server
 */
export const areShippingZoneLocationsLoading = (
	state,
	zoneId,
	siteId = getSelectedSiteId( state )
) => {
	const rawLocations = getRawShippingZoneLocations( state, siteId );
	return rawLocations && LOADING === getRawShippingZoneLocations( state, siteId )[ zoneId ];
};

/**
 * Checks if the shipping zones configuration is valid for being edited in Calypso. If the user only has ever
 * used the Calypso interface, this method will always return true. If he has done some configuration
 * in WP-Admin (which doesn't have as many restrictions), then it could be that he configured the zones in a way
 * that can't be reliably represented in Calypso, and as such the UI must forbid him to add new zones or edit
 * existing zones locations.
 *
 * @param {object} appState Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the shipping zones have valid locations to be edited in Calypso
 */
export const areShippingZonesLocationsValid = (
	appState,
	siteId = getSelectedSiteId( appState )
) => {
	const continentsSet = new Set();
	const countriesSet = new Set();
	const statesSet = new Set();
	const allLocations = getRawShippingZoneLocations( appState, siteId );
	for ( const zoneId of Object.keys( allLocations ) ) {
		if ( ! areShippingZoneLocationsLoaded( appState, zoneId, siteId ) ) {
			continue;
		}
		// The "Locations not covered by your other zones" zone is always valid, it doesn't have any locations
		if ( 0 === Number( zoneId ) ) {
			continue;
		}

		const { continent, country, state, postcode } = allLocations[ zoneId ];
		if ( ! isEmpty( continent ) ) {
			// If the zone has one or more continents, then it must *not* have any other type of location
			if ( ! isEmpty( country ) || ! isEmpty( state ) || ! isEmpty( postcode ) ) {
				return false;
			}
			for ( const c of continent ) {
				// 2 zones can't have the same continent
				if ( continentsSet.has( c ) ) {
					return false;
				}
				continentsSet.add( c );
			}
		} else if ( ! isEmpty( country ) ) {
			// If the zone has one or more countries, then it must *not* have any states too
			if ( ! isEmpty( state ) ) {
				return false;
			}
			if ( ! isEmpty( postcode ) ) {
				// Single country + postcode is allowed
				// Only 1 postcode range is allowed in a zone
				if ( 1 < country.length || 1 < postcode.length ) {
					return false;
				}
			} else {
				// Whole country, or multiple countries
				for ( const c of country ) {
					// 2 zones can't have the same country
					if ( countriesSet.has( c ) ) {
						return false;
					}
					countriesSet.add( c );
				}
			}
		} else if ( ! isEmpty( state ) ) {
			// If the zone has one or more states, then it must *not* have any other type of location
			if ( ! isEmpty( postcode ) ) {
				return false;
			}
			let countryCode;
			for ( const s of state ) {
				if ( countryCode ) {
					// States are represented like "CountryCode:StateCode".
					// Check that the zone doesn't have states from multiple countries.
					if ( s.split( ':' )[ 0 ] !== countryCode ) {
						return false;
					}
				} else {
					countryCode = s.split( ':' )[ 0 ];
				}
				// 2 zones can't have the same state
				if ( statesSet.has( s ) ) {
					return false;
				}
				statesSet.add( s );
			}
		} else if ( ! isEmpty( postcode ) ) {
			// A postcode without a country is not valid
			return false;
		}
	}

	return true;
};
