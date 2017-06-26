/**
 * External dependencies
 */
import { expect } from 'chai';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getShippingZoneLocationsWithEdits,
	canLocationsBeFiltered,
	getCurrentSelectedCountryZoneOwner,
	canLocationsBeFilteredByState,
	areLocationsFilteredByPostcode,
	areLocationsFilteredByState,
	areLocationsUnfiltered,
	getCurrentlyEditingShippingZoneCountries,
	getCurrentlyEditingShippingZoneStates,
} from '../selectors';
import { LOADING } from 'woocommerce/state/constants';
import { createState } from 'woocommerce/state/test/helpers';
import { JOURNAL_ACTIONS } from '../reducer';

const locations = [
	{
		code: 'EU',
		name: 'Europe',
		countries: [
			{
				code: 'UK',
				name: 'United Kingdom',
				states: [],
			},
			{
				code: 'FR',
				name: 'France',
				states: [],
			},
			{
				code: 'ES',
				name: 'Spain',
				states: [],
			},
		],
	},
	{
		code: 'NA',
		name: 'North America',
		countries: [
			{
				code: 'US',
				name: 'United States',
				states: [
					{
						code: 'AL',
						name: 'Alabama',
					},
					{
						code: 'CA',
						name: 'California',
					},
					{
						code: 'UT',
						name: 'Utah',
					},
				],
			},
			{
				code: 'CA',
				name: 'Canada',
				states: [],
			},
		],
	},
];

const createEditState = ( { zoneLocations, locationEdits } ) => createState( {
	site: {
		shippingZones: Object.keys( zoneLocations ).map( zoneId => ( { id: zoneId, methodIds: [] } ) ),
		shippingZoneLocations: zoneLocations,
		locations,
	},
	ui: {
		shipping: {
			zones: {
				creates: [], updates: [], deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: {
					locations: locationEdits,
				},
			},
		},
	},
} );

describe( 'selectors', () => {
	describe( 'getShippingZoneLocationsWithEdits', () => {
		it( 'should return null when the shipping zones are not fully loaded', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [] },
					],
					shippingZoneLocations: { 1: LOADING },
				},
				ui: {},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.be.null;
		} );

		it( 'should return null when there is no zone currently being edited', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, methodIds: [] },
					],
					shippingZoneLocations: { 1: { continent: [], country: [], state: [], postcode: [] } },
				},
				ui: {
					shipping: {
						zones: {
							creates: [], updates: [], deletes: [],
							currentlyEditingId: null,
						},
					},
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.be.null;
		} );

		it( 'should return the original locations if there are no changes', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'US' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: {
					pristine: true,
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.deep.equal( {
				continent: [],
				country: [ 'US' ],
				state: [],
				postcode: [],
			} );
		} );

		it( 'should add the continents logged in the journal', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [],
						state: [],
						postcode: [],
					},
				},
				locationEdits: {
					journal: [
						{ action: JOURNAL_ACTIONS.ADD_CONTINENT, code: 'EU' },
						{ action: JOURNAL_ACTIONS.ADD_CONTINENT, code: 'NA' },
					],
					states: null,
					postcode: null,
					pristine: false,
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.deep.equal( {
				continent: [ 'EU', 'NA' ],
				country: [],
				state: [],
				postcode: [],
			} );
		} );

		it( 'should remove the continents logged in the journal', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [ 'EU', 'NA' ],
						country: [],
						state: [],
						postcode: [],
					},
				},
				locationEdits: {
					journal: [
						{ action: JOURNAL_ACTIONS.REMOVE_CONTINENT, code: 'EU' },
					],
					states: null,
					postcode: null,
					pristine: false,
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.deep.equal( {
				continent: [ 'NA' ],
				country: [],
				state: [],
				postcode: [],
			} );
		} );

		it( 'should add all the continent\'s countries instead of the continent if the locations already include countries', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'UK' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: {
					journal: [
						{ action: JOURNAL_ACTIONS.ADD_CONTINENT, code: 'NA' },
					],
					states: null,
					postcode: null,
					pristine: false,
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.deep.equal( {
				continent: [],
				country: [ 'UK', 'CA', 'US' ],
				state: [],
				postcode: [],
			} );
		} );

		it( 'should not add the countries that already belong to another zone', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'US' ],
						state: [],
						postcode: [],
					},
					7: {
						continent: [],
						country: [ 'FR' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: {
					journal: [
						{ action: JOURNAL_ACTIONS.ADD_CONTINENT, code: 'EU' },
					],
					states: null,
					postcode: null,
					pristine: false,
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.deep.equal( {
				continent: [],
				country: [ 'US', 'ES', 'UK' ],
				state: [],
				postcode: [],
			} );
		} );

		it( 'should add remove all the continent\'s countries when adding the whole continent', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'UK' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: {
					journal: [
						{ action: JOURNAL_ACTIONS.ADD_CONTINENT, code: 'EU' },
					],
					states: null,
					postcode: null,
					pristine: false,
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.deep.equal( {
				continent: [ 'EU' ],
				country: [],
				state: [],
				postcode: [],
			} );
		} );

		it( 'should add the countries logged in the journal', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [],
						state: [],
						postcode: [],
					},
				},
				locationEdits: {
					journal: [
						{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'UK' },
						{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'US' },
					],
					states: null,
					postcode: null,
					pristine: false,
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.deep.equal( {
				continent: [],
				country: [ 'UK', 'US' ],
				state: [],
				postcode: [],
			} );
		} );

		it( 'should remove the countries logged in the journal', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'CA', 'US', 'UK' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: {
					journal: [
						{ action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'UK' },
						{ action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'US' },
					],
					states: null,
					postcode: null,
					pristine: false,
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.deep.equal( {
				continent: [],
				country: [ 'CA' ],
				state: [],
				postcode: [],
			} );
		} );

		it( 'should replace all the continents with their respective countries when adding a country', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [ 'NA' ],
						country: [],
						state: [],
						postcode: [],
					},
				},
				locationEdits: {
					journal: [
						{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'UK' },
					],
					states: null,
					postcode: null,
					pristine: false,
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.deep.equal( {
				continent: [],
				country: [ 'UK', 'CA', 'US' ],
				state: [],
				postcode: [],
			} );
		} );

		it( 'should not add the countries to the list of they already belong to another zone', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [ 'NA' ],
						country: [],
						state: [],
						postcode: [],
					},
					7: {
						continent: [],
						country: [ 'CA' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: {
					journal: [
						{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'UK' },
					],
					states: null,
					postcode: null,
					pristine: false,
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.deep.equal( {
				continent: [],
				country: [ 'UK', 'US' ],
				state: [],
				postcode: [],
			} );
		} );

		it( 'should remove the continent and add in its place all its countries when removing a country inside it', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [ 'NA', 'EU' ],
						country: [],
						state: [],
						postcode: [],
					},
				},
				locationEdits: {
					journal: [
						{ action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'UK' },
					],
					states: null,
					postcode: null,
					pristine: false,
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.deep.equal( {
				continent: [],
				country: [ 'CA', 'US', 'FR', 'ES' ],
				state: [],
				postcode: [],
			} );
		} );

		it( 'should not add the countries to the list if they already belong to another zone', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [ 'NA', 'EU' ],
						country: [],
						state: [],
						postcode: [],
					},
					7: {
						continent: [],
						country: [ 'CA', 'FR' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: {
					journal: [
						{ action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'UK' },
					],
					states: null,
					postcode: null,
					pristine: false,
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.deep.equal( {
				continent: [],
				country: [ 'US', 'ES' ],
				state: [],
				postcode: [],
			} );
		} );

		it( 'should process all the entries in the journal in order', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [ 'NA' ],
						country: [],
						state: [],
						postcode: [],
					},
				},
				locationEdits: {
					journal: [
						// this should add all the American countries and remove "NA"
						{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'UK' },
						{ action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'US' },
						// Can't add EU because there are selected NA countries, add all EU countries instead
						{ action: JOURNAL_ACTIONS.ADD_CONTINENT, code: 'EU' },
					],
					states: null,
					postcode: null,
					pristine: false,
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.deep.equal( {
				continent: [],
				country: [ 'CA', 'FR', 'ES', 'UK' ],
				state: [],
				postcode: [],
			} );
		} );

		it( 'should remove all the states when there were country or continent additions or removals', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [],
						state: [ 'US:CA' ],
						postcode: [],
					},
				},
				locationEdits: {
					journal: [
						{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'UK' },
					],
					states: null,
					postcode: null,
					pristine: false,
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.deep.equal( {
				continent: [],
				country: [ 'US', 'UK' ],
				state: [],
				postcode: [],
			} );
		} );

		it( 'should remove the postcode when there were country or continent additions or removals', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'US' ],
						state: [],
						postcode: [ '12345' ],
					},
				},
				locationEdits: {
					journal: [
						{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'UK' },
					],
					states: null,
					postcode: null,
					pristine: false,
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.deep.equal( {
				continent: [],
				country: [ 'US', 'UK' ],
				state: [],
				postcode: [],
			} );
		} );

		it( 'should add states to the locations', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [],
						state: [ 'US:CA' ],
						postcode: [],
					},
				},
				locationEdits: {
					journal: [],
					states: {
						add: [ 'NY', 'UT' ],
						remove: [],
						removeAll: false,
					},
					postcode: null,
					pristine: false,
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.deep.equal( {
				continent: [],
				country: [ 'US' ],
				state: [ 'CA', 'NY', 'UT' ],
				postcode: [],
			} );
		} );

		it( 'should remove states from the locations', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [],
						state: [ 'US:CA', 'US:NY', 'US:UT' ],
						postcode: [],
					},
				},
				locationEdits: {
					journal: [],
					states: {
						add: [],
						remove: [ 'UT', 'NY' ],
						removeAll: false,
					},
					postcode: null,
					pristine: false,
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.deep.equal( {
				continent: [],
				country: [ 'US' ],
				state: [ 'CA' ],
				postcode: [],
			} );
		} );

		it( 'should both add and remove states on the locations', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [],
						state: [ 'US:CA', 'US:UT' ],
						postcode: [],
					},
				},
				locationEdits: {
					journal: [],
					states: {
						add: [ 'NY' ],
						remove: [ 'UT' ],
						removeAll: false,
					},
					postcode: null,
					pristine: false,
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.deep.equal( {
				continent: [],
				country: [ 'US' ],
				state: [ 'CA', 'NY' ],
				postcode: [],
			} );
		} );

		it( 'should clear the states list if the removeAll flag is set', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [],
						state: [ 'US:CA', 'US:UT' ],
						postcode: [],
					},
				},
				locationEdits: {
					journal: [],
					states: {
						add: [ 'NY' ],
						remove: [],
						removeAll: true,
					},
					postcode: null,
					pristine: false,
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.deep.equal( {
				continent: [],
				country: [ 'US' ],
				state: [ 'NY' ],
				postcode: [],
			} );
		} );

		it( 'should clear the states list if the locations are not filtered by state anymore', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [],
						state: [ 'US:CA', 'US:UT' ],
						postcode: [],
					},
				},
				locationEdits: {
					journal: [],
					states: null,
					postcode: '12345',
					pristine: false,
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.deep.equal( {
				continent: [],
				country: [ 'US' ],
				state: [],
				postcode: [ '12345' ],
			} );
		} );

		it( 'should clear the postcode if the locations are not filtered by postcode anymore', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'US' ],
						state: [],
						postcode: [ '12345' ],
					},
				},
				locationEdits: {
					journal: [],
					states: null,
					postcode: null,
					pristine: false,
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.deep.equal( {
				continent: [],
				country: [ 'US' ],
				state: [],
				postcode: [],
			} );
		} );
	} );
} );
