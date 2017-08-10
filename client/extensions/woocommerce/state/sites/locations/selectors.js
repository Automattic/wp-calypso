/** @format */
/**
 * External dependencies
 */
import { find, flatMap, get, isArray, isEmpty, omit, sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSelectedSiteId } from 'state/ui/selectors';
import { LOADING } from 'woocommerce/state/constants';

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Array} The locations tree, as retrieved from the server. It can also be the string "LOADING"
 * if the locations are currently being fetched, or a "falsy" value if that haven't been fetched at all.
 */
const getRawLocations = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'locations' ] );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the locations data tree has been successfully loaded from the server
 */
export const areLocationsLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	return isArray( getRawLocations( state, siteId ) );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the locations data tree is currently being retrieved from the server
 */
export const areLocationsLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	return LOADING === getRawLocations( state, siteId );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Array} A list of continents, represented by { code, name } pairs. Sorted alphabetically by name.
 */
export const getContinents = createSelector(
	( state, siteId = getSelectedSiteId( state ) ) => {
		if ( ! areLocationsLoaded( state, siteId ) ) {
			return [];
		}
		const continents = getRawLocations( state, siteId ).map( continent =>
			omit( continent, 'countries' )
		);
		return sortBy( continents, 'name' );
	},
	( state, siteId = getSelectedSiteId( state ) ) => {
		const loaded = areLocationsLoaded( state, siteId );
		return [ loaded, loaded && getRawLocations( state, siteId ) ];
	}
);

/**
 * @param {Object} state Whole Redux state tree
 * @param {String} continentCode 2-letter continent code
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Array} A list of countries in the given country, represented by { code, name } pairs. Sorted alphabetically by name.
 */
export const getCountries = createSelector(
	( state, continentCode, siteId = getSelectedSiteId( state ) ) => {
		if ( ! areLocationsLoaded( state, siteId ) ) {
			return [];
		}
		const continent = find( getRawLocations( state, siteId ), { code: continentCode } );
		if ( ! continent ) {
			return [];
		}
		const countries = continent.countries.map( country => omit( country, 'states' ) );
		return sortBy( countries, 'name' );
	},
	( state, continentCode, siteId = getSelectedSiteId( state ) ) => {
		const loaded = areLocationsLoaded( state, siteId );
		return [ loaded, loaded && getRawLocations( state, siteId ) ];
	}
);

/**
 * @param {Object} state Whole Redux state tree
 * @param {String} countryCode 2-letter ISO country code
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {String} The country name. If it can't be found, it will default to returning the country ISO code.
 */
export const getCountryName = createSelector(
	( state, countryCode, siteId = getSelectedSiteId( state ) ) => {
		if ( ! areLocationsLoaded( state, siteId ) ) {
			return countryCode;
		}
		const country = find( flatMap( getRawLocations( state, siteId ), 'countries' ), {
			code: countryCode,
		} );
		if ( ! country ) {
			return countryCode;
		}
		return country.name;
	},
	( state, countryCode, siteId = getSelectedSiteId( state ) ) => {
		const loaded = areLocationsLoaded( state, siteId );
		return [ loaded, loaded && getRawLocations( state, siteId ) ];
	}
);

/**
 * @param {Object} state Whole Redux state tree
 * @param {String} countryCode 2-letter ISO country code
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Array} A list of states in the given country, represented by { code, name } pairs. Sorted alphabetically by name.
 */
export const getStates = createSelector(
	( state, countryCode, siteId = getSelectedSiteId( state ) ) => {
		if ( ! areLocationsLoaded( state, siteId ) ) {
			return [];
		}
		const country = find( flatMap( getRawLocations( state, siteId ), 'countries' ), {
			code: countryCode,
		} );
		if ( ! country ) {
			return [];
		}
		return sortBy( country.states, 'name' );
	},
	( state, countryCode, siteId = getSelectedSiteId( state ) ) => {
		const loaded = areLocationsLoaded( state, siteId );
		return [ loaded, loaded && getRawLocations( state, siteId ) ];
	}
);

/**
 * @param {Object} state Whole Redux state tree
 * @param {String} countryCode code 2-letter ISO country code
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the country has a list of states or not. Note that even if the result is "false", that only
 * means WooCommerce doesn't have a list of states for the country, but the country may still have states (or provinces,
 * or a similar term).
 */
export const hasStates = ( state, countryCode, siteId = getSelectedSiteId( state ) ) => {
	return ! isEmpty( getStates( state, countryCode, siteId ) );
};
