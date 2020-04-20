/**
 * External dependencies
 */

import { every, forIn, isEmpty, isObject, orderBy } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	areShippingZonesLoaded,
	getAPIShippingZones,
} from 'woocommerce/state/sites/shipping-zones/selectors';
import { getRawShippingZoneLocations } from 'woocommerce/state/sites/shipping-zone-locations/selectors';
import { getShippingZonesEdits, getCurrentlyEditingShippingZone } from '../selectors';
import {
	getContinents,
	getCountriesByContinent,
	getCountryName,
	getStates,
	hasStates,
} from 'woocommerce/state/sites/data/locations/selectors';
import { JOURNAL_ACTIONS } from './reducer';
import { mergeLocationEdits } from './helpers';
import { getZoneLocationsPriority } from 'woocommerce/state/sites/shipping-zone-locations/helpers';

/**
 * Computes a map of the continents that belong to a zone different than the one that's currently being edited.
 * That information will be used to mark them as "disabled" in the UI.
 *
 * @param {object} state Whole Redux state tree
 * @param {number} siteId Site ID
 * @returns {object} A map with the form { continentCode => zoneId }. If a continent doesn't appear in the map, it means that
 * it doesn't belong to a zone.
 */
const getContinentsOwnedByOtherZone = createSelector(
	( state, siteId ) => {
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
	},
	( state, siteId ) => {
		return [
			getCurrentlyEditingShippingZone( state, siteId ),
			getRawShippingZoneLocations( state, siteId ),
		];
	}
);

/**
 * Computes a map of the countries that belong to a zone different than the one that's currently being edited.
 * That information will be used to mark them as "disabled" in the UI.
 *
 * @param {object} state Whole Redux state tree
 * @param {number} siteId Site ID
 * @returns {object} A map with the form { countryCode => zoneId }. If a country doesn't appear in the map, it means that
 * it doesn't belong to a zone.
 */
const getCountriesOwnedByOtherZone = createSelector(
	( state, siteId ) => {
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
	},
	( state, siteId ) => {
		return [
			getCurrentlyEditingShippingZone( state, siteId ),
			getRawShippingZoneLocations( state, siteId ),
		];
	}
);

/**
 * Computes a map of the states that belong to a zone different than the one that's currently being edited.
 * That information will be used to mark them as "disabled" in the UI.
 *
 * @param {object} state Whole Redux state tree
 * @param {number} siteId Site ID
 * @param {string} countryCode 2-letter ISO country code
 * @returns {object} A map with the form { stateCode: zoneId }. If a state doesn't appear in the map, it means that
 * it doesn't belong to a zone.
 */
const getStatesOwnedByOtherZone = createSelector(
	( state, siteId, countryCode ) => {
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
	},
	( state, siteId ) => {
		return [
			getCurrentlyEditingShippingZone( state, siteId ),
			getRawShippingZoneLocations( state, siteId ),
		];
	},
	( state, siteId, countryCode ) => {
		return [ siteId, countryCode ].join();
	}
);

/**
 * @param {object} state Whole Redux state tree
 * @param {number} zoneId ID of the shipping zone
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {object} The list of locations for the shipping zone, in the form
 * { continent: [ ... ], country: [ ... ], state: [ ... ], postcode: [ ... ] }. On any failure, it will return null.
 * This won't include any local edits made to the zone locations.
 */
export const getShippingZoneLocations = createSelector(
	( state, zoneId, siteId = getSelectedSiteId( state ) ) => {
		if ( ! areShippingZonesLoaded( state, siteId ) ) {
			return null;
		}

		const locations = getRawShippingZoneLocations( state, siteId )[ zoneId ] || {
			continent: [],
			country: [],
			state: [],
			postcode: [],
		};

		const countries = new Set( locations.country );
		// Extract the country/state pair from the raw states (they are in the format "Country:State")
		const states = new Set();
		locations.state.forEach( ( fullCode ) => {
			const [ countryCode, stateCode ] = fullCode.split( ':' );
			countries.add( countryCode );
			states.add( stateCode );
		} );

		return {
			...locations,
			country: Array.from( countries ),
			state: Array.from( states ),
		};
	},
	( state, zoneId, siteId = getSelectedSiteId( state ) ) => {
		const loaded = areShippingZonesLoaded( state, siteId );
		return [ loaded, loaded && getRawShippingZoneLocations( state, siteId ) ];
	},
	( state, zoneId, siteId = getSelectedSiteId( state ) ) => {
		const id = isObject( zoneId ) ? `i${ zoneId.index }` : zoneId;
		return `${ id }${ siteId }`;
	}
);

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @param {boolean} [overlayTemporalEdits] Whether to overlay the temporal location edits that are being made inside the modal (true),
 * or just use the committed edits.
 * @returns {object} The list of locations for the shipping zone, including any edits made, in the form
 * { continent: [ ... ], country: [ ... ], state: [ ... ], postcode: [ ... ] }. On any failure, it will return null.
 */
export const getShippingZoneLocationsWithEdits = createSelector(
	( state, siteId = getSelectedSiteId( state ), overlayTemporalEdits = true ) => {
		if ( ! areShippingZonesLoaded( state, siteId ) ) {
			return null;
		}
		const zone = getCurrentlyEditingShippingZone( state, siteId );
		if ( ! zone ) {
			return null;
		}

		const locations = getShippingZoneLocations( state, zone.id, siteId );
		const continents = new Set( locations.continent );
		const countries = new Set( locations.country );
		const states = new Set( locations.state );

		const { temporaryChanges, ...committedEdits } = getShippingZonesEdits(
			state,
			siteId
		).currentlyEditingChanges.locations;
		const edits = overlayTemporalEdits
			? mergeLocationEdits( committedEdits, temporaryChanges )
			: committedEdits;
		if ( edits.pristine ) {
			return {
				continent: Array.from( continents ),
				country: Array.from( countries ),
				state: Array.from( states ),
				postcode: locations.postcode,
			};
		}

		const forbiddenCountries = new Set(
			Object.keys( getCountriesOwnedByOtherZone( state, siteId ) )
		);
		// Play the journal entries in order, from oldest to newest
		edits.journal.forEach( ( { action, code } ) => {
			switch ( action ) {
				case JOURNAL_ACTIONS.ADD_CONTINENT:
					// When selecting a whole continent, remove all its countries from the selection
					getCountriesByContinent( state, code, siteId ).forEach( ( country ) =>
						countries.delete( country.code )
					);
					if ( countries.size ) {
						// If the zone has countries selected, then instead of selecting the continent we select all its countries
						getCountriesByContinent( state, code, siteId ).forEach( ( country ) => {
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
					getCountriesByContinent( state, code, siteId ).forEach( ( country ) =>
						countries.delete( country.code )
					);
					break;
				case JOURNAL_ACTIONS.ADD_COUNTRY:
					forbiddenCountries.forEach( ( countryCode ) => {
						countries.delete( countryCode );
					} );
					countries.add( code );
					// If the zone has continents selected, then we need to replace them with their respective countries
					continents.forEach( ( continentCode ) => {
						getCountriesByContinent( state, continentCode, siteId ).forEach( ( country ) => {
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
						for ( const country of getCountriesByContinent( state, continentCode, siteId ) ) {
							if ( country.code === code ) {
								insideSelectedContinent = true;
								break;
							}
						}
					}
					// If the user unselected a country that was inside a selected continent, replace the continent for its countries
					if ( insideSelectedContinent ) {
						continents.forEach( ( continentCode ) => {
							getCountriesByContinent( state, continentCode, siteId ).forEach( ( country ) => {
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
	},
	( state, siteId = getSelectedSiteId( state ) ) => {
		const loaded = areShippingZonesLoaded( state, siteId );
		const zone = loaded && getCurrentlyEditingShippingZone( state, siteId );
		return [
			loaded,
			zone,
			zone && getShippingZoneLocations( state, zone.id, siteId ),
			zone && getShippingZonesEdits( state, siteId ),
			zone && getCountriesOwnedByOtherZone( state, siteId ),
		];
	},
	( state, siteId = getSelectedSiteId( state ), overlayTemporalEdits = true ) => {
		return [ siteId, overlayTemporalEdits ].join();
	}
);

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the "Edit Locations" modal is opened or not.
 */
export const isEditLocationsModalOpen = ( state, siteId = getSelectedSiteId( state ) ) => {
	if (
		! areShippingZonesLoaded( state, siteId ) ||
		! getCurrentlyEditingShippingZone( state, siteId )
	) {
		return false;
	}
	return Boolean(
		getShippingZonesEdits( state, siteId ).currentlyEditingChanges.locations.temporaryChanges
	);
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the locations can be filtered (by state or postcode) or not. They can be filtered if there
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
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {number|undefined} The Zone ID that is the "owner" of the currently selected country, or "false-y" if the
 * currently selected country isn't owned by any other zone. If this returns a Zone ID, then the user shouldn't be able
 * to filter by "whole country", only by states / postcode.
 */
export const getCurrentSelectedCountryZoneOwner = (
	state,
	siteId = getSelectedSiteId( state )
) => {
	if ( ! canLocationsBeFiltered( state, siteId ) ) {
		return null;
	}
	const locations = getShippingZoneLocationsWithEdits( state, siteId );
	return getCountriesOwnedByOtherZone( state, siteId )[ locations.country[ 0 ] ];
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the locations currently being edited can be filtered by state. This will happen when there
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
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the "Filter by postcode range" option is selected.
 */
export const areLocationsFilteredByPostcode = createSelector(
	( state, siteId = getSelectedSiteId( state ) ) => {
		if ( ! canLocationsBeFiltered( state, siteId ) ) {
			return false;
		}
		const zone = getCurrentlyEditingShippingZone( state, siteId );
		const locations = getRawShippingZoneLocations( state, siteId )[ zone.id ];
		const { temporaryChanges, ...committedEdits } = getShippingZonesEdits(
			state,
			siteId
		).currentlyEditingChanges.locations;
		const edits = mergeLocationEdits( committedEdits, temporaryChanges );

		if ( edits.pristine ) {
			return ! isEmpty( locations.postcode );
		}
		if ( null !== edits.postcode ) {
			return true;
		}
		return (
			! canLocationsBeFilteredByState( state, siteId ) &&
			Boolean( getCurrentSelectedCountryZoneOwner( state, siteId ) )
		);
	},
	( state, siteId = getSelectedSiteId( state ) ) => {
		const canFilter = canLocationsBeFiltered( state, siteId );
		return [
			canFilter,
			canFilter && getCurrentlyEditingShippingZone( state, siteId ),
			canFilter && getRawShippingZoneLocations( state, siteId ),
			canFilter && getShippingZonesEdits( state, siteId ),
			canFilter && canLocationsBeFilteredByState( state, siteId ),
			canFilter && getCurrentSelectedCountryZoneOwner( state, siteId ),
		];
	}
);

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the "Filter by state" option is selected.
 */
export const areLocationsFilteredByState = createSelector(
	( state, siteId = getSelectedSiteId( state ) ) => {
		if (
			! canLocationsBeFiltered( state, siteId ) ||
			! canLocationsBeFilteredByState( state, siteId )
		) {
			return false;
		}
		const zone = getCurrentlyEditingShippingZone( state, siteId );
		const locations = getRawShippingZoneLocations( state, siteId )[ zone.id ];
		const { temporaryChanges, ...committedEdits } = getShippingZonesEdits(
			state,
			siteId
		).currentlyEditingChanges.locations;
		const edits = mergeLocationEdits( committedEdits, temporaryChanges );

		if ( edits.pristine ) {
			return ! isEmpty( locations.state );
		}
		if ( null !== edits.states ) {
			return true;
		}
		return (
			! areLocationsFilteredByPostcode( state, siteId ) &&
			Boolean( getCurrentSelectedCountryZoneOwner( state, siteId ) )
		);
	},
	( state, siteId = getSelectedSiteId( state ) ) => {
		const canFilter = canLocationsBeFiltered( state, siteId );
		return [
			canFilter,
			canFilter && canLocationsBeFilteredByState( state, siteId ),
			canFilter && getCurrentlyEditingShippingZone( state, siteId ),
			canFilter && getRawShippingZoneLocations( state, siteId ),
			canFilter && getShippingZonesEdits( state, siteId ),
			canFilter && areLocationsFilteredByPostcode( state, siteId ),
			canFilter && getCurrentSelectedCountryZoneOwner( state, siteId ),
		];
	}
);

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the "Ship to the whole country" option is selected.
 */
export const areLocationsUnfiltered = ( state, siteId = getSelectedSiteId( state ) ) => {
	return (
		canLocationsBeFiltered( state, siteId ) &&
		! getCurrentSelectedCountryZoneOwner( state, siteId ) &&
		! areLocationsFilteredByState( state, siteId ) &&
		! areLocationsFilteredByPostcode( state, siteId )
	);
};

/**
 * @param {object} state Whole Redux state tree
 * @param {object} locations Set of locations (it has the properties "continent", "country", "state" and "postcode", all arrays)
 * @param {number} maxCountries Maximum number of countries per continent to list individually before
 * they are grouped into a continent
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} The list of locations, based on the "locations" object provided.
 * Each element of the list will have these properties:
 * - type: 'continent|country|state'
 * - code: Continent code, country code or state code, depending on the type
 * - name: Name of the location to be displayed
 * Additionally, if the "type" is "country", it will have an optional field:
 * - postcodeFilter: String, postcode range applied, if any.
 * And if the "type" is "state":
 * - countryName: Name of the country that this state is part of.
 * - countryCode: Code of the country that this state is part of.
 */
const getShippingZoneLocationsListFromLocations = (
	state,
	locations,
	maxCountries = 999,
	siteId = getSelectedSiteId( state )
) => {
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
				countryCode,
			} ) );
	}

	//if postcode filter exists, then only one country should be selected
	if ( locations.postcode[ 0 ] ) {
		return locations.country.map( ( code ) => ( {
			type: 'country',
			code,
			name: getCountryName( state, code, siteId ),
			postcodeFilter: locations.postcode[ 0 ],
		} ) );
	}

	const selectedCountries = new Set( locations.country );
	if ( ! selectedCountries.size ) {
		return [];
	}

	//if there are more than maxCountries per continent, group them into a continent
	let result = [];
	getContinents( state, siteId ).forEach( ( { code: continentCode, name: continentName } ) => {
		const continentCountries = getCountriesByContinent( state, continentCode, siteId );
		const selectedContinentCountries = continentCountries
			.filter( ( { code } ) => selectedCountries.has( code ) )
			.map( ( { code, name } ) => ( {
				type: 'country',
				code,
				name,
				postcodeFilter: undefined,
			} ) );

		if ( selectedContinentCountries.length < maxCountries ) {
			result = result.concat( selectedContinentCountries );
		} else {
			result.push( {
				type: 'continent',
				code: continentCode,
				name: continentName,
				countryCount: continentCountries.length,
				selectedCountryCount: selectedContinentCountries.length,
			} );
		}
	} );

	return result;
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} zoneId ID of the shipping zone.
 * @param {number} maxCountries Maximum number of countries per continent to list individually before
 * they are grouped into a continent
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} The list of locations configured for the zone. This doesn't include any local edits.
 */
export const getShippingZoneLocationsList = createSelector(
	( state, zoneId, maxCountries = 999, siteId = getSelectedSiteId( state ) ) => {
		const locations = getShippingZoneLocations( state, zoneId, siteId );
		return getShippingZoneLocationsListFromLocations( state, locations, maxCountries, siteId );
	},
	( state, zoneId, maxCountries, siteId = getSelectedSiteId( state ) ) => {
		return [ getShippingZoneLocations( state, zoneId, siteId ) ];
	},
	( state, zoneId, maxCountries = 999, siteId = getSelectedSiteId( state ) ) => {
		const id = isObject( zoneId ) ? `i${ zoneId.index }` : zoneId;
		return `${ id }${ maxCountries }${ siteId }`;
	}
);

/**
 * @param {object} state Whole Redux state tree
 * @param {number} maxCountries Maximum number of countries per continent to list individually before
 * they are grouped into a continent
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} The list of locations currently configured for the zone. This includes committed edits,
 * but not temporary edits, since it's made to be used for the UI outside of the locations modal.
 */
export const getCurrentlyEditingShippingZoneLocationsList = createSelector(
	( state, maxCountries = 999, siteId = getSelectedSiteId( state ) ) => {
		const locations = getShippingZoneLocationsWithEdits( state, siteId, false );
		return getShippingZoneLocationsListFromLocations( state, locations, maxCountries, siteId );
	},
	( state, maxCountries, siteId = getSelectedSiteId( state ) ) => {
		return [ getShippingZoneLocationsWithEdits( state, siteId, false ) ];
	},
	( state, maxCountries = 999, siteId = getSelectedSiteId( state ) ) => {
		return [ maxCountries, siteId ].join();
	}
);

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} The list of continents and countries for this zone, ready to be rendered in the UI. This includes
 * temporary edits, as it's made to be used inside the modal UI. Each element will have these properties:
 * - type: 'continent|country'
 * - code: Continent code or country code
 * - name: Name of the location to be displayed
 * - selected: Boolean, whether this location should be marked as "selected"
 * - disabled: Boolean, whether this location should be marked as "disabled". The user shouldn't be able to toggle a disabled element.
 * - ownerZoneId: The Zone ID that is the "owner" of this location, or undefined if no other zone includes this location.
 */
export const getCurrentlyEditingShippingZoneCountries = createSelector(
	( state, siteId = getSelectedSiteId( state ) ) => {
		const locations = getShippingZoneLocationsWithEdits( state, siteId );
		if ( ! locations ) {
			return [];
		}
		const selectedContinents = new Set( locations.continent );
		const selectedCountries = new Set( locations.country );
		const forbiddenContinents = getContinentsOwnedByOtherZone( state, siteId );
		const forbiddenCountries = getCountriesOwnedByOtherZone( state, siteId );
		const locationsList = [];
		const allowSelectingForbiddenCountries =
			0 === selectedContinents.size && 0 === selectedCountries.size;

		getContinents( state, siteId ).forEach( ( { code: continentCode, name: continentName } ) => {
			const continentSelected = selectedContinents.has( continentCode );
			const continentCountries = getCountriesByContinent( state, continentCode, siteId );
			let selectedCount = 0;
			const continentI = locationsList.push( {
				code: continentCode,
				name: continentName,
				selected: continentSelected,
				disabled: Boolean( forbiddenContinents[ continentCode ] ),
				ownerZoneId: forbiddenContinents[ continentCode ],
				type: 'continent',
				countryCount: continentCountries.length,
			} );
			continentCountries.forEach( ( { code: countryCode, name: countryName } ) => {
				const countrySelected = continentSelected || selectedCountries.has( countryCode );
				if ( countrySelected ) {
					selectedCount++;
				}
				locationsList.push( {
					code: countryCode,
					name: countryName,
					selected: countrySelected,
					disabled:
						! allowSelectingForbiddenCountries && Boolean( forbiddenCountries[ countryCode ] ),
					ownerZoneId: forbiddenCountries[ countryCode ],
					type: 'country',
				} );
			} );
			locationsList[ continentI - 1 ].selectedCountryCount = selectedCount;
		} );
		return locationsList;
	},
	( state, siteId = getSelectedSiteId( state ) ) => {
		return [
			getShippingZoneLocationsWithEdits( state, siteId ),
			getContinentsOwnedByOtherZone( state, siteId ),
			getCountriesOwnedByOtherZone( state, siteId ),
		];
	}
);

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} The list of states for this zone, ready to be rendered in the UI. This includes
 * temporary edits, as it's made to be used inside the modal UI. Each element will have these properties:
 * - code: State code
 * - name: State name
 * - selected: Boolean, whether this location should be markef as "selected"
 * - disabled: Boolean, whether this location should be marked as "disabled". The user shouldn't be able to toggle a disabled element.
 * - ownerZoneId: The Zone ID that is the "owner" of this state, or undefined if no other zone includes this state.
 */
export const getCurrentlyEditingShippingZoneStates = createSelector(
	( state, siteId = getSelectedSiteId( state ) ) => {
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
	},
	( state, siteId = getSelectedSiteId( state ) ) => {
		return [
			areLocationsFilteredByState( state, siteId ),
			getShippingZoneLocationsWithEdits( state, siteId ),
			getStatesOwnedByOtherZone( state, siteId ),
		];
	}
);

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the locations for the shipping zone currently being edited are valid. This includes
 * temporary edits, as it's designed to be used for enabling / disabling the "Save Changes" button.
 */
export const areCurrentlyEditingShippingZoneLocationsValid = (
	state,
	siteId = getSelectedSiteId( state )
) => {
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

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {object} A map of the new "order" property that the zones will need to have to preserve a correct ordering.
 * The keys will be the zone IDs, and the values will be the required order property for those zones
 */
export const getOrderOperationsToSaveCurrentZone = (
	state,
	siteId = getSelectedSiteId( state )
) => {
	const moves = {};
	const allLocations = getRawShippingZoneLocations( state, siteId );
	const allZones = orderBy( getAPIShippingZones( state, siteId ), 'order' );

	const currentZone = getCurrentlyEditingShippingZone( state, siteId );
	const currentZoneOrder = 'number' === typeof currentZone.id ? currentZone.order : 0;
	const currentZoneLocations = getShippingZoneLocationsWithEdits( state, siteId );
	const currentZonePriority = getZoneLocationsPriority( currentZoneLocations );
	if ( currentZonePriority && currentZoneOrder !== currentZonePriority ) {
		moves[ currentZone.id ] = currentZonePriority;
	}

	// Normally this won't be needed because all the already saved zones will have the correct order according
	// to their priority, but for example that's not the case after the initial setup (the "home country" zone
	// has order=0)
	for ( const { id, order } of allZones ) {
		// Skip over the "Locations not covered by your other zones" zone, the current zone and zones with no locations
		if ( currentZone.id === id || 0 === id ) {
			continue;
		}
		const priority = getZoneLocationsPriority( allLocations[ id ] );
		if ( ! priority ) {
			continue;
		}

		if ( order !== priority ) {
			moves[ id ] = priority;
		}
	}

	return moves;
};
