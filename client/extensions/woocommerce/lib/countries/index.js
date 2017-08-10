/** @format */
/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import CA from './CA';
import US from './US';

// Note: We are not using the other state name resources in calypso
// since 1) they do not include Canadian provinces and 2) we will
// want to decorate these objects further in a subsequent PR
// with things like origin vs destination based tax booleans

// IMPORTANT: If you add a country to this list, you must also add it
// to ../../my-sites/sidebar/sidebar.jsx in the allowedCountryCodes

export const getCountries = () => {
	return [ US(), CA() ];
};

export const getCountryData = country => {
	const countryData = find( getCountries(), { code: country } );
	if ( ! countryData ) {
		return null;
	}
	return countryData;
};

export const getStateData = ( country, state ) => {
	const countryData = getCountryData( country );
	if ( ! countryData ) {
		return null;
	}
	const stateData = find( countryData.states, { code: state } );
	if ( ! stateData ) {
		return null;
	}

	return stateData;
};
