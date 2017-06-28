/**
 * External dependencies
 */
import { every, forIn, isEmpty, sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { areShippingZonesLoaded } from 'woocommerce/state/sites/shipping-zones/selectors';
import { getRawShippingZoneLocations } from 'woocommerce/state/sites/shipping-zone-locations/selectors';
import { getShippingZonesEdits, getCurrentlyEditingShippingZone } from '../selectors';
import { getContinents, getCountries, getCountryName, getStates, hasStates } from 'woocommerce/state/sites/locations/selectors';
import { JOURNAL_ACTIONS } from './reducer';
import { mergeLocationEdits } from './helpers';

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
 * @param {Boolean} [overlayTemporalEdits] Whether to overlay the temporal location edits that are being made inside the modal (true),
 * or just use the committed edits.
 * @return {Object} The list of locations for the shipping zone, including any edits made, in the form
 * { continent: [ ... ], country: [ ... ], state: [ ... ], postcode: [ ... ] }. On any failure, it will return null.
 */
export const getShippingZoneLocationsWithEdits = ( state, siteId = getSelectedSiteId( state ), overlayTemporalEdits = true ) => {
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
	// Extract the country/state pair from the raw states (they are in the format "Country:State")
	const states = new Set();
	locations.state.forEach( ( fullCode ) => {
		const [ countryCode, stateCode ] = fullCode.split( ':' );
		countries.add( countryCode );
		states.add( stateCode );
	} );

	const { temporaryChanges, ...committedEdits } = getShippingZonesEdits( state, siteId ).currentlyEditingChanges.locations;
	const edits = overlayTemporalEdits ? mergeLocationEdits( committedEdits, temporaryChanges ) : committedEdits;
	if ( edits.pristine ) {
		return {
			continent: Array.from( continents ),
			country: Array.from( countries ),
			state: Array.from( states ),
			postcode: locations.postcode,
		};
	}

	const forbiddenCountries = new Set( Object.keys( getCountriesOwnedByOtherZone( state, siteId ) ) );
	// Play the journal entries in order, from oldest to newest
	edits.journal.forEach( ( { action, code } ) => {
		switch ( action ) {
			case JOURNAL_ACTIONS.ADD_CONTINENT:
				// When selecting a whole continent, remove all its countries from the selection
				getCountries( state, code, siteId ).forEach( country => countries.delete( country.code ) );
				if ( countries.size ) {
					// If the zone has countries selected, then instead of selecting the continent we select all its countries
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
				forbiddenCountries.forEach( countryCode => {
					countries.delete( countryCode );
				} );
				countries.add( code );
				// If the zone has continents selected, then we need to replace them with their respective countries
				continents.forEach( ( continentCode ) => {
					getCountries( state, continentCode, siteId ).forEach( ( country ) => {
						if ( ! forbiddenCountries.has( country.code ) ) {
							countries.add( country.code );
						}
					} );
				} );
				// This is a "countries" zone now, remove all the continents
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
				// If the user unselected a country that was inside a selected continent, replace the continent for its countries
				if ( insideSelectedContinent ) {
					continents.forEach( ( continentCode ) => {
						getCountries( state, continentCode, siteId ).forEach( ( country ) => {
							if ( ! forbiddenCountries.has( country.code ) ) {
								countries.add( country.code );
							}
						} );
					} );
					// This is a "countries" zone now, remove all the continents
					continents.clear();
				}
				countries.delete( code );
				break;
		}
	} );

	// If there are journal entries, then the user selected/unselected countries&continents, so the original states must be purged
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

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Boolean} Whether the "Edit Locations" modal is opened or not.
 */
export const isEditLocationsModalOpen = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! areShippingZonesLoaded( state, siteId ) || ! getCurrentlyEditingShippingZone( state, siteId ) ) {
		return false;
	}
	return Boolean( getShippingZonesEdits( state, siteId ).currentlyEditingChanges.locations.temporaryChanges );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Boolean} Whether the locations can be filtered (by state or postcode) or not. They can be filtered if there
 * is only one country selected (and no continents).
 */
export const canLocationsBeFiltered = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! isEditLocationsModalOpen( state, siteId ) ) {
		return false;
	}
	const locations = getShippingZoneLocationsWithEdits( state, siteId );
	return locations && isEmpty( locations.continent ) && 1 === locations.country.length;
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Number|undefined} The Zone ID that is the "owner" of the currently selected country, or "false-y" if the
 * currently selected country isn't owned by any other zone. If this returns a Zone ID, then the user shouldn't be able
 * to filter by "whole country", only by states / postcode.
 */
export const getCurrentSelectedCountryZoneOwner = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! canLocationsBeFiltered( state, siteId ) ) {
		return null;
	}
	const locations = getShippingZoneLocationsWithEdits( state, siteId );
	return getCountriesOwnedByOtherZone( state, siteId )[ locations.country[ 0 ] ];
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Boolean} Whether the locations currently being edited can be filtered by state. This will happen when there
 * is only one country selected and it has a list of available states.
 */
export const canLocationsBeFilteredByState = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! canLocationsBeFiltered( state, siteId ) ) {
		return false;
	}

	const locations = getShippingZoneLocationsWithEdits( state, siteId );
	return locations && hasStates( state, locations.country[ 0 ], siteId );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Boolean} Whether the "Filter by postcode range" option is selected.
 */
export const areLocationsFilteredByPostcode = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! canLocationsBeFiltered( state, siteId ) ) {
		return false;
	}
	const zone = getCurrentlyEditingShippingZone( state, siteId );
	const locations = getRawShippingZoneLocations( state, siteId )[ zone.id ];
	const { temporaryChanges, ...committedEdits } = getShippingZonesEdits( state, siteId ).currentlyEditingChanges.locations;
	const edits = mergeLocationEdits( committedEdits, temporaryChanges );

	if ( edits.pristine ) {
		return ! isEmpty( locations.postcode );
	}
	if ( null !== edits.postcode ) {
		return true;
	}
	return ! canLocationsBeFilteredByState( state, siteId ) && Boolean( getCurrentSelectedCountryZoneOwner( state, siteId ) );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Boolean} Whether the "Filter by state" option is selected.
 */
export const areLocationsFilteredByState = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! canLocationsBeFiltered( state, siteId ) || ! canLocationsBeFilteredByState( state, siteId ) ) {
		return false;
	}
	const zone = getCurrentlyEditingShippingZone( state, siteId );
	const locations = getRawShippingZoneLocations( state, siteId )[ zone.id ];
	const { temporaryChanges, ...committedEdits } = getShippingZonesEdits( state, siteId ).currentlyEditingChanges.locations;
	const edits = mergeLocationEdits( committedEdits, temporaryChanges );

	if ( edits.pristine ) {
		return ! isEmpty( locations.state );
	}
	if ( null !== edits.states ) {
		return true;
	}
	return ! areLocationsFilteredByPostcode( state, siteId ) && Boolean( getCurrentSelectedCountryZoneOwner( state, siteId ) );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Boolean} Whether the "Ship to the whole country" option is selected.
 */
export const areLocationsUnfiltered = ( state, siteId = getSelectedSiteId( state ) ) => {
	return canLocationsBeFiltered( state, siteId ) &&
		! getCurrentSelectedCountryZoneOwner( state, siteId ) &&
		! areLocationsFilteredByState( state, siteId ) &&
		! areLocationsFilteredByPostcode( state, siteId );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Array} The list of locations currently configured for the zone. This doesn't include temporary edits,
 * since it's made to be used for the UI outside of the modal. Each element of the list will have these properties:
 * - type: 'continent|country|state'
 * - code: Continent code, country code or state code, depending on the type
 * - name: Name of the location to be displayed
 * Additionally, if the "type" is "country", it will have an optional field:
 * - postcodeFilter: String, postcode range applied, if any.
 * And if the "type" is "state":
 * - countryName: Name of the country that this state is part of.
 * - countryCode: Code of the ecountry that this state is part of.
 */
export const getCurrentlyEditingShippingZoneLocationsList = ( state, siteId = getSelectedSiteId( state ) ) => {
	const locations = getShippingZoneLocationsWithEdits( state, siteId, false );
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

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Array} The list of continents and countries for this zone, ready to be rendered in the UI. This includes
 * temporary edits, as it's made to be used inside the modal UI. Each element will have these properties:
 * - type: 'continent|country'
 * - code: Continent code or country code
 * - name: Name of the location to be displayed
 * - selected: Boolean, whether this location should be markef as "selected"
 * - disabled: Boolean, whether this location should be marked as "disabled". The user shouldn't be able to toggle a disabled element.
 * - ownerZoneId: The Zone ID that is the "owner" of this location, or undefined if no other zone includes this location.
 */
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

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Array} The list of states for this zone, ready to be rendered in the UI. This includes
 * temporary edits, as it's made to be used inside the modal UI. Each element will have these properties:
 * - code: State code
 * - name: State name
 * - selected: Boolean, whether this location should be markef as "selected"
 * - disabled: Boolean, whether this location should be marked as "disabled". The user shouldn't be able to toggle a disabled element.
 * - ownerZoneId: The Zone ID that is the "owner" of this state, or undefined if no other zone includes this state.
 */
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

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Boolean} Whether the locations for the shipping zone currently being edited are valid. This includes
 * temporary edits, as it's designed to be used for enabling / disabling the "Save Changes" button.
 */
export const areCurrentlyEditingShippingZoneLocationsValid = ( state, siteId = getSelectedSiteId( state ) ) => {
	const locations = getShippingZoneLocationsWithEdits( state, siteId );
	if ( ! locations ) {
		return false;
	}
	if ( every( locations, isEmpty ) ) {
		return false;
	}
	if ( areLocationsFilteredByPostcode( state, siteId ) && ! locations.postcode[ 0 ] ) {
		return false;
	}
	if ( areLocationsFilteredByState( state, siteId ) && isEmpty( locations.state ) ) {
		return false;
	}
	return true;
};
