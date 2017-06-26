/**
 * External dependencies
 */
import { forIn, isEmpty, sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { areShippingZonesLoaded } from 'woocommerce/state/sites/shipping-zones/selectors';
import { getRawShippingZoneLocations } from 'woocommerce/state/sites/shipping-zone-locations/selectors';
import { getShippingZonesEdits, getCurrentlyEditingShippingZone } from '../selectors';
import { getContinents, getCountries, getCountryName, getStates, hasStates } from 'woocommerce/state/sites/locations/selectors';
import { JOURNAL_ACTIONS } from './reducer';

/**
 * Computes a map of the continents that belong to a zone different than the one that's currently being edited.
 * That information will be used to mark them as "disabled" in the UI.
 * @param {Object} state Whole Redux state tree
 * @param {Number} siteId Site ID
 * @return {Object} A map with the form { continentCode => zoneId }. If a continent doesn't appear in the map, it means that
 * it doesn't belong to a zone.
 */
const getContinentsOwnedByOtherZone = ( state, siteId ) => {
	const continents = {};
	const currentZone = getCurrentlyEditingShippingZone( state, siteId );
	forIn( getRawShippingZoneLocations( state, siteId ), ( { continent }, zoneId ) => {
		if ( currentZone.id === Number( zoneId ) ) {
			return;
		}
		for ( const c of continent ) {
			continents[ c ] = Number( zoneId );
		}
	} );
	return continents;
};

/**
 * Computes a map of the countries that belong to a zone different than the one that's currently being edited.
 * That information will be used to mark them as "disabled" in the UI.
 * @param {Object} state Whole Redux state tree
 * @param {Number} siteId Site ID
 * @return {Object} A map with the form { countryCode => zoneId }. If a country doesn't appear in the map, it means that
 * it doesn't belong to a zone.
 */
const getCountriesOwnedByOtherZone = ( state, siteId ) => {
	const countries = {};
	const currentZone = getCurrentlyEditingShippingZone( state, siteId );
	forIn( getRawShippingZoneLocations( state, siteId ), ( { country, postcode }, zoneId ) => {
		if ( currentZone.id === Number( zoneId ) || ! isEmpty( postcode ) ) {
			return;
		}
		for ( const c of country ) {
			countries[ c ] = Number( zoneId );
		}
	} );
	return countries;
};

/**
 * Computes a map of the states that belong to a zone different than the one that's currently being edited.
 * That information will be used to mark them as "disabled" in the UI.
 * @param {Object} state Whole Redux state tree
 * @param {Number} siteId Site ID
 * @param {String} countryCode 2-letter ISO country code
 * @return {Object} A map with the form { stateCode: zoneId }. If a state doesn't appear in the map, it means that
 * it doesn't belong to a zone.
 */
const getStatesOwnedByOtherZone = ( state, siteId, countryCode ) => {
	const states = {};
	const currentZone = getCurrentlyEditingShippingZone( state, siteId );
	forIn( getRawShippingZoneLocations( state, siteId ), ( locations, zoneId ) => {
		if ( currentZone.id === Number( zoneId ) ) {
			return;
		}
		for ( const s of locations.state ) {
			const [ stateCountry, stateCode ] = s.split( ':' );
			if ( stateCountry === countryCode ) {
				states[ stateCode ] = Number( zoneId );
			}
		}
	} );
	return states;
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object} The list of locations for the shipping zone, including any edits made, in the form
 * { continent: [ ... ], country: [ ... ], state: [ ... ], postcode: [ ... ] }. On any failure, it will return null.
 */
export const getShippingZoneLocationsWithEdits = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! areShippingZonesLoaded( state, siteId ) ) {
		return null;
	}
	const zone = getCurrentlyEditingShippingZone( state, siteId );
	if ( ! zone ) {
		return null;
	}

	const locations = getRawShippingZoneLocations( state, siteId )[ zone.id ] || {
		continent: [],
		country: [],
		state: [],
		postcode: [],
	};

	const continents = new Set( locations.continent );
	const countries = new Set( locations.country );
	const states = new Set();
	locations.state.forEach( ( fullCode ) => {
		const [ countryCode, stateCode ] = fullCode.split( ':' );
		countries.add( countryCode );
		states.add( stateCode );
	} );

	const edits = getShippingZonesEdits( state, siteId ).currentlyEditingChanges.locations;
	if ( edits.pristine ) {
		return {
			continent: Array.from( continents ),
			country: Array.from( countries ),
			state: Array.from( states ),
			postcode: locations.postcode,
		};
	}

	const forbiddenCountries = new Set( Object.keys( getCountriesOwnedByOtherZone( state, siteId ) ) );
	edits.journal.forEach( ( { action, code } ) => {
		switch ( action ) {
			case JOURNAL_ACTIONS.ADD_CONTINENT:
				getCountries( state, code, siteId ).forEach( country => countries.delete( country.code ) );
				if ( countries.size ) {
					getCountries( state, code, siteId ).forEach( ( country ) => {
						if ( ! forbiddenCountries.has( country.code ) ) {
							countries.add( country.code );
						}
					} );
				} else {
					continents.add( code );
				}
				break;
			case JOURNAL_ACTIONS.REMOVE_CONTINENT:
				continents.delete( code );
				getCountries( state, code, siteId ).forEach( country => countries.delete( country.code ) );
				break;
			case JOURNAL_ACTIONS.ADD_COUNTRY:
				countries.add( code );
				continents.forEach( ( continentCode ) => {
					getCountries( state, continentCode, siteId ).forEach( ( country ) => {
						if ( ! forbiddenCountries.has( country.code ) ) {
							countries.add( country.code );
						}
					} );
				} );
				continents.clear();
				break;
			case JOURNAL_ACTIONS.REMOVE_COUNTRY:
				let insideSelectedContinent = false;
				for ( const continentCode of continents ) {
					if ( insideSelectedContinent ) {
						break;
					}
					for ( const country of getCountries( state, continentCode, siteId ) ) {
						if ( country.code === code ) {
							insideSelectedContinent = true;
							break;
						}
					}
				}
				if ( insideSelectedContinent ) {
					continents.forEach( ( continentCode ) => {
						getCountries( state, continentCode, siteId ).forEach( ( country ) => {
							if ( ! forbiddenCountries.has( country.code ) ) {
								countries.add( country.code );
							}
						} );
					} );
					continents.clear();
				}
				countries.delete( code );
				break;
		}
	} );

	if ( ! edits.states || edits.states.removeAll || ! isEmpty( edits.journal ) ) {
		states.clear();
	}
	if ( edits.states ) {
		edits.states.add.forEach( ( code ) => states.add( code ) );
		edits.states.remove.forEach( ( code ) => states.delete( code ) );
	}

	return {
		continent: Array.from( continents ),
		country: Array.from( countries ),
		state: Array.from( states ),
		postcode: null === edits.postcode ? [] : [ edits.postcode ],
	};
};

export const canLocationsBeFiltered = ( state, siteId = getSelectedSiteId( state ) ) => {
	const locations = getShippingZoneLocationsWithEdits( state, siteId );
	return locations && isEmpty( locations.continent ) && 1 === locations.country.length;
};

export const getCurrentSelectedCountryZoneOwner = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! canLocationsBeFiltered( state, siteId ) ) {
		return null;
	}
	const locations = getShippingZoneLocationsWithEdits( state, siteId );
	return getCountriesOwnedByOtherZone( state, siteId )[ locations.country[ 0 ] ];
};

export const canLocationsBeFilteredByState = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! canLocationsBeFiltered( state, siteId ) ) {
		return false;
	}

	const locations = getShippingZoneLocationsWithEdits( state, siteId );
	return locations && hasStates( state, locations.country[ 0 ], siteId );
};

export const areLocationsFilteredByPostcode = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! canLocationsBeFiltered( state, siteId ) ) {
		return false;
	}
	const zone = getCurrentlyEditingShippingZone( state, siteId );
	const locations = getRawShippingZoneLocations( state, siteId )[ zone.id ];
	const edits = getShippingZonesEdits( state, siteId ).currentlyEditingChanges.locations;

	if ( edits.pristine ) {
		return ! isEmpty( locations.postcode );
	}
	if ( null !== edits.postcode ) {
		return true;
	}
	return ! canLocationsBeFilteredByState( state, siteId ) && Boolean( getCurrentSelectedCountryZoneOwner( state, siteId ) );
};

export const areLocationsFilteredByState = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! canLocationsBeFiltered( state, siteId ) || ! canLocationsBeFilteredByState( state, siteId ) ) {
		return false;
	}
	const zone = getCurrentlyEditingShippingZone( state, siteId );
	const locations = getRawShippingZoneLocations( state, siteId )[ zone.id ];
	const edits = getShippingZonesEdits( state, siteId ).currentlyEditingChanges.locations;

	if ( edits.pristine ) {
		return ! isEmpty( locations.state );
	}
	if ( null !== edits.states ) {
		return true;
	}
	return ! areLocationsFilteredByPostcode( state, siteId ) && Boolean( getCurrentSelectedCountryZoneOwner( state, siteId ) );
};

export const areLocationsUnfiltered = ( state, siteId = getSelectedSiteId( state ) ) => {
	return canLocationsBeFiltered( state, siteId ) &&
		! getCurrentSelectedCountryZoneOwner( state, siteId ) &&
		! areLocationsFilteredByState( state, siteId ) &&
		! areLocationsFilteredByPostcode( state, siteId );
};

export const getCurrentlyEditingShippingZoneLocationsList = ( state, siteId = getSelectedSiteId( state ) ) => {
	const locations = getShippingZoneLocationsWithEdits( state, siteId );
	if ( ! locations ) {
		return [];
	}

	const selectedContinents = new Set( locations.continent );
	if ( selectedContinents.size ) {
		return getContinents( state, siteId )
			.filter( ( { code } ) => selectedContinents.has( code ) )
			.map( ( { code, name } ) => ( {
				type: 'continent',
				code,
				name,
			} ) );
	}

	const selectedStates = new Set( locations.state );
	if ( selectedStates.size ) {
		const countryCode = locations.country[ 0 ];
		const countryName = getCountryName( state, countryCode, siteId );
		return getStates( state, countryCode, siteId )
			.filter( ( { code } ) => selectedStates.has( code ) )
			.map( ( { code, name } ) => ( {
				type: 'state',
				code,
				name,
				countryName,
				countryCode
			} ) );
	}

	return sortBy( locations.country.map( code => ( {
		type: 'country',
		code,
		name: getCountryName( state, code, siteId ),
		postcodeFilter: locations.postcode[ 0 ],
	} ) ), 'name' );
};

export const getCurrentlyEditingShippingZoneCountries = ( state, siteId = getSelectedSiteId( state ) ) => {
	const locations = getShippingZoneLocationsWithEdits( state, siteId );
	if ( ! locations ) {
		return [];
	}
	const selectedContinents = new Set( locations.continent );
	const selectedCountries = new Set( locations.country );
	const forbiddenContinents = getContinentsOwnedByOtherZone( state, siteId );
	const forbiddenCountries = getCountriesOwnedByOtherZone( state, siteId );
	const locationsList = [];
	const allowSelectingForbiddenCountries = 0 === selectedContinents.size && 0 === selectedCountries.size;

	getContinents( state, siteId ).forEach( ( { code: continentCode, name: continentName } ) => {
		const continentSelected = selectedContinents.has( continentCode );
		locationsList.push( {
			code: continentCode,
			name: continentName,
			selected: continentSelected,
			disabled: Boolean( forbiddenContinents[ continentCode ] ),
			ownerZoneId: forbiddenContinents[ continentCode ],
			type: 'continent',
		} );
		getCountries( state, continentCode, siteId ).forEach( ( { code: countryCode, name: countryName } ) => {
			locationsList.push( {
				code: countryCode,
				name: countryName,
				selected: continentSelected || selectedCountries.has( countryCode ),
				disabled: ! allowSelectingForbiddenCountries && Boolean( forbiddenCountries[ countryCode ] ),
				ownerZoneId: forbiddenCountries[ countryCode ],
				type: 'country',
			} );
		} );
	} );
	return locationsList;
};

export const getCurrentlyEditingShippingZoneStates = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! areLocationsFilteredByState( state, siteId ) ) {
		return [];
	}
	const locations = getShippingZoneLocationsWithEdits( state, siteId );
	if ( ! locations ) {
		return [];
	}
	const countryCode = locations.country[ 0 ];
	const selectedStates = new Set( locations.state );
	const forbiddenStates = getStatesOwnedByOtherZone( state, siteId, countryCode );

	return getStates( state, countryCode, siteId ).map( ( { code, name } ) => ( {
		code,
		name,
		selected: selectedStates.has( code ),
		disabled: Boolean( forbiddenStates[ code ] ),
		ownerZoneId: forbiddenStates[ code ],
	} ) );
};
