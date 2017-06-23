/**
 * External dependencies
 */
import { forIn, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { areShippingZonesLoaded } from 'woocommerce/state/sites/shipping-zones/selectors';
import { getRawShippingZoneLocations } from 'woocommerce/state/sites/shipping-zone-locations/selectors';
import { getShippingZonesEdits, getCurrentlyEditingShippingZone } from '../selectors';
import { getContinents, getCountries, getStates, hasStates } from 'woocommerce/state/sites/locations/selectors';
import { JOURNAL_ACTIONS } from './reducer';

const getContinentsOwnedByOtherZone = ( state, siteId ) => {
	const continents = {};
	const currentZone = getCurrentlyEditingShippingZone( state, siteId );
	forIn( getRawShippingZoneLocations( state, siteId ), ( { continent }, zoneId ) => {
		if ( currentZone.id === zoneId ) {
			return;
		}
		for ( const c of continent ) {
			continents[ c ] = zoneId;
		}
	} );
	return continents;
};

const getCountriesOwnedByOtherZone = ( state, siteId ) => {
	const countries = {};
	const currentZone = getCurrentlyEditingShippingZone( state, siteId );
	forIn( getRawShippingZoneLocations( state, siteId ), ( { country, postcode }, zoneId ) => {
		if ( currentZone.id === zoneId || ! isEmpty( postcode ) ) {
			return;
		}
		for ( const c of country ) {
			countries[ c ] = zoneId;
		}
	} );
	return countries;
};

const getStatesOwnedByOtherZone = ( state, siteId, countryCode ) => {
	const states = {};
	const currentZone = getCurrentlyEditingShippingZone( state, siteId );
	forIn( getRawShippingZoneLocations( state, siteId ), ( locations, zoneId ) => {
		if ( currentZone.id === zoneId ) {
			return;
		}
		for ( const s of locations.state ) {
			const [ stateCountry, stateCode ] = s.split( ':' );
			if ( stateCountry === countryCode ) {
				states[ stateCode ] = zoneId;
			}
		}
	} );
	return states;
};

const getShippingZoneLocationsWithEdits = ( state, siteId ) => {
	if ( ! areShippingZonesLoaded( state, siteId ) ) {
		return null;
	}
	const zone = getCurrentlyEditingShippingZone( state, siteId );
	if ( ! zone ) {
		return null;
	}
	const locations = getRawShippingZoneLocations( state, siteId )[ zone.id ];
	const edits = getShippingZonesEdits( state, siteId ).currentlyEditingChanges.locations;
	if ( edits.pristine ) {
		return locations;
	}

	const forbiddenCountries = new Set( Object.keys( getCountriesOwnedByOtherZone( state, siteId ) ) );
	const continents = new Set( locations.continent );
	const countries = new Set( locations.country );
	edits.journal.forEach( ( { action, code } ) => {
		switch ( action ) {
			case JOURNAL_ACTIONS.ADD_CONTINENT:
				continents.add( code );
				getCountries( code ).forEach( country => countries.remove( country.code ) );
				break;
			case JOURNAL_ACTIONS.REMOVE_CONTINENT:
				continents.remove( code );
				getCountries( code ).forEach( country => countries.remove( country.code ) );
				break;
			case JOURNAL_ACTIONS.ADD_COUNTRY:
				countries.add( code );
				continents.forEach( ( continentCode ) => {
					getCountries( continentCode ).forEach( ( country ) => {
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
					for ( const country of getCountries( continentCode ) ) {
						if ( country.code === code ) {
							insideSelectedContinent = true;
							break;
						}
					}
				}
				if ( insideSelectedContinent ) {
					continents.forEach( ( continentCode ) => {
						getCountries( continentCode ).forEach( ( country ) => {
							if ( ! forbiddenCountries.has( country.code ) ) {
								countries.add( country.code );
							}
						} );
					} );
				}
				countries.remove( code );
				break;
		}
	} );

	let statesArr = [];
	if ( edits.states && ! edits.states.removeAll && isEmpty( edits.journal ) ) {
		statesArr = locations.state.map( ( fullCode ) => fullCode.split( ':' )[ 1 ] );
	}
	const states = new Set( statesArr );
	if ( edits.states ) {
		edits.states.add.forEach( ( code ) => states.add( code ) );
		edits.states.remove.forEach( ( code ) => states.remove( code ) );
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
	return ! canLocationsBeFilteredByState( state, siteId ) && getCurrentSelectedCountryZoneOwner( state, siteId );
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
	return ! areLocationsFilteredByPostcode( state, siteId ) && getCurrentSelectedCountryZoneOwner( state, siteId );
};

export const areLocationsUnfiltered = ( state, siteId = getSelectedSiteId( state ) ) => {
	return canLocationsBeFiltered( state, siteId ) &&
		! getCurrentSelectedCountryZoneOwner( state, siteId ) &&
		! areLocationsFilteredByState( state, siteId ) &&
		! areLocationsFilteredByPostcode( state, siteId );
};

export const getCurrentlyEditingShippingZoneCountries = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! areLocationsFilteredByState( state, siteId ) ) {
		return [];
	}
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
