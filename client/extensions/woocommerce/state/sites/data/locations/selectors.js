/**
 * External dependencies
 */

import { find, filter, flatMap, get, isArray, isEmpty, omit, sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSelectedSiteId } from 'state/ui/selectors';
import { LOADING, ERROR } from 'woocommerce/state/constants';

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} The locations tree, as retrieved from the server. It can also be the string "LOADING"
 * if the locations are currently being fetched, or a "falsy" value if that haven't been fetched at all.
 */
const getRawLocations = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'data', 'locations' ] );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the locations data tree has been successfully loaded from the server
 */
export const areLocationsLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	return isArray( getRawLocations( state, siteId ) );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the locations data tree is currently being retrieved from the server
 */
export const areLocationsLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	return LOADING === getRawLocations( state, siteId );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the locations data fetch has resulted in an error
 */
export const areLocationsErrored = ( state, siteId = getSelectedSiteId( state ) ) => {
	return ERROR === getRawLocations( state, siteId );
};

/**
 * Common "getDependants" logic for all the selectors that operate on a site's locations data.
 *
 * @param {number} numArgs Number of arguments the selector takes, excluding the Redux state tree and the site ID
 * @returns {Function} Function, as expected by the "createSelector" library
 */
const _getSelectorDependants = ( numArgs ) => ( state, ...args ) => {
	// First argument is always "state", last argument is always "siteId"
	const siteId = args[ numArgs ];
	const loaded = areLocationsLoaded( state, siteId );
	return [ loaded, loaded && getRawLocations( state, siteId ) ];
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} A list of continents, represented by { code, name } pairs. Sorted alphabetically by name.
 */
export const getContinents = createSelector( ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! areLocationsLoaded( state, siteId ) ) {
		return [];
	}
	const continents = getRawLocations( state, siteId ).map( ( continent ) =>
		omit( continent, 'countries' )
	);
	return sortBy( continents, 'name' );
}, _getSelectorDependants( 0 ) );

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} An array of all countries represented by { code, name, states } objects. Sorted alphabetically by name.
 */
export const getAllCountries = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! areLocationsLoaded( state, siteId ) ) {
		return [];
	}

	const allCountries = flatMap( getRawLocations( state, siteId ), 'countries' );
	return sortBy( allCountries, 'name' );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {string} continentCode 2-letter continent code
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} A list of countries in the given continent, represented by { code, name } pairs. Sorted alphabetically by name.
 */
export const getCountriesByContinent = createSelector(
	( state, continentCode, siteId = getSelectedSiteId( state ) ) => {
		if ( ! areLocationsLoaded( state, siteId ) ) {
			return [];
		}
		const continent = find( getRawLocations( state, siteId ), { code: continentCode } );
		if ( ! continent ) {
			return [];
		}
		const countries = continent.countries.map( ( country ) => omit( country, 'states' ) );
		return sortBy( countries, 'name' );
	},
	_getSelectorDependants( 1 )
);

/**
 * @param {object} state Whole Redux state tree
 * @param {string} countryCode 2-letter ISO country code
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {string} The country name. If it can't be found, it will default to returning the country ISO code.
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
	_getSelectorDependants( 1 )
);

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} A list of countries (codes) that have states
 */
export const getCountriesWithStates = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! areLocationsLoaded( state, siteId ) ) {
		return [];
	}

	const allCountries = getAllCountries( state, siteId );
	const countriesWithStates = filter( allCountries, ( country ) => {
		return ! isEmpty( country.states );
	} );

	return countriesWithStates.map( ( country ) => country.code ).sort();
};

/**
 * @param {object} state Whole Redux state tree
 * @param {string} countryCode 2-letter ISO country code
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} A list of states in the given country, represented by { code, name } pairs. Sorted alphabetically by name.
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
	_getSelectorDependants( 1 )
);

/**
 * @param {object} state Whole Redux state tree
 * @param {string} countryCode 2-letter ISO country code
 * @param {string} stateCode 2-letter code of the country's state
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {string} The readable name of the given state. It falls back to returning the state code if its name wasn't found
 */
export const getStateName = createSelector(
	( state, countryCode, stateCode, siteId = getSelectedSiteId( state ) ) => {
		if ( ! areLocationsLoaded( state, siteId ) ) {
			return stateCode;
		}
		const country = find( flatMap( getRawLocations( state, siteId ), 'countries' ), {
			code: countryCode,
		} );
		if ( ! country ) {
			return stateCode;
		}
		const stateData = find( country.states, { code: stateCode } );
		return stateData ? stateData.name : stateCode;
	},
	_getSelectorDependants( 2 )
);

/**
 * @param {object} state Whole Redux state tree
 * @param {string} countryCode code 2-letter ISO country code
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the country has a list of states or not. Note that even if the result is "false", that only
 * means WooCommerce doesn't have a list of states for the country, but the country may still have states (or provinces,
 * or a similar term).
 */
export const hasStates = ( state, countryCode, siteId = getSelectedSiteId( state ) ) => {
	return ! isEmpty( getStates( state, countryCode, siteId ) );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {object} Map with the pairs { countryCode: countryName } of all the countries in the world
 */
export const getAllCountryNames = createSelector(
	( state, siteId = getSelectedSiteId( state ) ) => {
		const countries = getAllCountries( state, siteId );
		const names = {};
		countries.forEach( ( { code, name } ) => ( names[ code ] = name ) );
		return names;
	},
	_getSelectorDependants( 0 )
);
