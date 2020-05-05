/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { initialState, JOURNAL_ACTIONS } from '../reducer';
import {
	getShippingZoneLocationsWithEdits,
	isEditLocationsModalOpen,
	canLocationsBeFiltered,
	getCurrentSelectedCountryZoneOwner,
	canLocationsBeFilteredByState,
	areLocationsFilteredByPostcode,
	areLocationsFilteredByState,
	areLocationsUnfiltered,
	getCurrentlyEditingShippingZoneLocationsList,
	getCurrentlyEditingShippingZoneCountries,
	getCurrentlyEditingShippingZoneStates,
	areCurrentlyEditingShippingZoneLocationsValid,
	getOrderOperationsToSaveCurrentZone,
} from '../selectors';
import { LOADING } from 'woocommerce/state/constants';
import { createState } from 'woocommerce/state/test/helpers';
import * as plugins from 'woocommerce/state/selectors/plugins';

const initialStateWithEmptyTempEdits = {
	...initialState,
	temporaryChanges: {
		journal: [],
		states: null,
		postcode: null,
		pristine: true,
	},
};

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
						code: 'NY',
						name: 'New York',
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

const createEditState = ( { zoneLocations, locationEdits } ) =>
	createState( {
		site: {
			shippingZones: Object.keys( zoneLocations ).map( ( zoneId ) => ( {
				id: Number( zoneId ),
				methodIds: [],
			} ) ),
			shippingZoneLocations: zoneLocations,
			data: { locations },
		},
		ui: {
			shipping: {
				zones: {
					creates: [],
					updates: [],
					deletes: [],
					currentlyEditingId: 1,
					currentlyEditingChanges: {
						locations: locationEdits,
					},
				},
			},
		},
	} );

describe( 'selectors', () => {
	let wcsEnabledStub;
	beforeEach( () => {
		wcsEnabledStub = sinon.stub( plugins, 'isWcsEnabled' ).returns( false );
	} );

	afterEach( () => {
		wcsEnabledStub.restore();
	} );

	describe( 'getShippingZoneLocationsWithEdits', () => {
		test( 'should return null when the shipping zones are not fully loaded', () => {
			const state = createState( {
				site: {
					shippingZones: [ { id: 1, methodIds: [] } ],
					shippingZoneLocations: { 1: LOADING },
				},
				ui: {},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.be.null;
		} );

		test( 'should return null when there is no zone currently being edited', () => {
			const state = createState( {
				site: {
					shippingZones: [ { id: 1, methodIds: [] } ],
					shippingZoneLocations: { 1: { continent: [], country: [], state: [], postcode: [] } },
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [],
							deletes: [],
							currentlyEditingId: null,
						},
					},
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.be.null;
		} );

		test( 'should return empty arrays when there is no zone currently being edited', () => {
			const state = createState( {
				site: {
					shippingZones: [],
					shippingZoneLocations: {},
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [],
							deletes: [],
							currentlyEditingId: { index: 0 },
							currentlyEditingChanges: { locations: initialState },
						},
					},
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.deep.equal( {
				continent: [],
				country: [],
				state: [],
				postcode: [],
			} );
		} );

		test( 'should return the original locations if there are no changes', () => {
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

		test( 'should add the continents logged in the journal', () => {
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

		test( 'should remove the continents logged in the journal', () => {
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
					journal: [ { action: JOURNAL_ACTIONS.REMOVE_CONTINENT, code: 'EU' } ],
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

		test( "should add all the continent's countries instead of the continent if the locations already include countries", () => {
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
					journal: [ { action: JOURNAL_ACTIONS.ADD_CONTINENT, code: 'NA' } ],
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

		test( 'should not add the countries that already belong to another zone', () => {
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
					journal: [ { action: JOURNAL_ACTIONS.ADD_CONTINENT, code: 'EU' } ],
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

		test( "should add remove all the continent's countries when adding the whole continent", () => {
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
					journal: [ { action: JOURNAL_ACTIONS.ADD_CONTINENT, code: 'EU' } ],
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

		test( 'should add the countries logged in the journal', () => {
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

		test( 'should remove the countries logged in the journal', () => {
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

		test( 'should replace all the continents with their respective countries when adding a country', () => {
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
					journal: [ { action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'UK' } ],
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

		test( 'should not add the countries to the list of they already belong to another zone', () => {
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
					journal: [ { action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'UK' } ],
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

		test( 'should allow selecting a single country even if it belongs to another zone', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'UK' ],
						state: [],
						postcode: [],
					},
					7: {
						continent: [],
						country: [ 'US' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: {
					journal: [
						{ action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'UK' },
						{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'US' },
					],
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

		test( 'should allow selecting a second country even if the first belongs to another zone, but the first will be removed', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'UK' ],
						state: [],
						postcode: [],
					},
					7: {
						continent: [],
						country: [ 'US' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: {
					journal: [
						{ action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'UK' },
						{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'US' },
						{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'CA' },
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

		test( 'should remove the continent and add in its place all its countries when removing a country inside it', () => {
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
					journal: [ { action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'UK' } ],
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

		test( 'should not add the countries to the list if they already belong to another zone', () => {
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
					journal: [ { action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'UK' } ],
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

		test( 'should process all the entries in the journal in order', () => {
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

		test( 'should remove all the states when there were country or continent additions or removals', () => {
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
					journal: [ { action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'UK' } ],
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

		test( 'should remove the postcode when there were country or continent additions or removals', () => {
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
					journal: [ { action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'UK' } ],
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

		test( 'should add states to the locations', () => {
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

		test( 'should remove states from the locations', () => {
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

		test( 'should both add and remove states on the locations', () => {
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

		test( 'should clear the states list if the removeAll flag is set', () => {
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

		test( 'should clear the states list if the locations are not filtered by state anymore', () => {
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

		test( 'should clear the postcode if the locations are not filtered by postcode anymore', () => {
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

		test( 'should overlay temporary edits by default', () => {
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
					journal: [ { action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'UK' } ],
					states: null,
					postcode: null,
					pristine: false,
					temporaryChanges: {
						journal: [ { action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'FR' } ],
						states: null,
						postcode: null,
						pristine: false,
					},
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state ) ).to.deep.equal( {
				continent: [],
				country: [ 'US', 'UK', 'FR' ],
				state: [],
				postcode: [],
			} );
		} );

		test( 'should NOT overlay temporary edits if specified', () => {
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
					journal: [ { action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'UK' } ],
					states: null,
					postcode: null,
					pristine: false,
					temporaryChanges: {
						journal: [ { action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'FR' } ],
						states: null,
						postcode: null,
						pristine: false,
					},
				},
			} );

			expect( getShippingZoneLocationsWithEdits( state, undefined, false ) ).to.deep.equal( {
				continent: [],
				country: [ 'US', 'UK' ],
				state: [],
				postcode: [],
			} );
		} );
	} );

	describe( 'isEditLocationsModalOpen', () => {
		test( 'should return false when there is no shipping zone being edited', () => {
			const state = createState( {
				site: {
					shippingZones: [ { id: 1, methodIds: [] } ],
					shippingZoneLocations: { 1: { continent: [], country: [], state: [], postcode: [] } },
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [],
							deletes: [],
							currentlyEditingId: null,
						},
					},
				},
			} );

			expect( isEditLocationsModalOpen( state ) ).to.be.false;
		} );

		test( 'should return false when there are no temporary changes', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [ 'NA' ],
						country: [],
						state: [],
						postcode: [],
					},
				},
				locationEdits: initialState,
			} );

			expect( isEditLocationsModalOpen( state ) ).to.be.false;
		} );

		test( 'should return false when there are temporary changes (even empty changes)', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [ 'NA' ],
						country: [],
						state: [],
						postcode: [],
					},
				},
				locationEdits: initialStateWithEmptyTempEdits,
			} );

			expect( isEditLocationsModalOpen( state ) ).to.be.true;
		} );
	} );

	describe( 'canLocationsBeFiltered', () => {
		test( 'should return false when there are continents selected', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [ 'NA' ],
						country: [],
						state: [],
						postcode: [],
					},
				},
				locationEdits: initialStateWithEmptyTempEdits,
			} );

			expect( canLocationsBeFiltered( state ) ).to.be.false;
		} );

		test( 'should return false when there are multiple countries selected', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'US', 'CA' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: initialStateWithEmptyTempEdits,
			} );

			expect( canLocationsBeFiltered( state ) ).to.be.false;
		} );

		test( 'should return false when there is no country selected', () => {
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
					...initialState,
					temporaryChanges: {
						journal: [ { action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'US' } ],
						states: null,
						postcode: null,
						pristine: false,
					},
				},
			} );

			expect( canLocationsBeFiltered( state ) ).to.be.false;
		} );

		test( 'should return true when there is a single country selected', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'US' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: initialStateWithEmptyTempEdits,
			} );

			expect( canLocationsBeFiltered( state ) ).to.be.true;
		} );

		test( 'should return true when there is a single country selected with states', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [],
						state: [ 'US:CA', 'US:NY' ],
						postcode: [],
					},
				},
				locationEdits: initialStateWithEmptyTempEdits,
			} );

			expect( canLocationsBeFiltered( state ) ).to.be.true;
		} );

		test( 'should return true when there is a single country selected with postcode filter', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'US' ],
						state: [],
						postcode: [ '12345' ],
					},
				},
				locationEdits: initialStateWithEmptyTempEdits,
			} );

			expect( canLocationsBeFiltered( state ) ).to.be.true;
		} );
	} );

	describe( 'getCurrentSelectedCountryZoneOwner', () => {
		test( "should return null when the zone locations can't be filtered", () => {
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
					journal: [],
					states: null,
					postcode: null,
					pristine: true,
				},
			} );

			expect( getCurrentSelectedCountryZoneOwner( state ) ).to.not.be.ok;
		} );

		test( 'should return null when there are no other zones that have the current country', () => {
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
						country: [ 'CA' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: {
					...initialState,
					temporaryChanges: {
						journal: [],
						states: null,
						postcode: null,
						pristine: true,
					},
				},
			} );

			expect( getCurrentSelectedCountryZoneOwner( state ) ).to.not.be.ok;
		} );

		test( 'should return null when there are no other zones that own the *whole* country', () => {
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
						country: [ 'US' ],
						state: [],
						postcode: [ '12345' ],
					},
				},
				locationEdits: initialStateWithEmptyTempEdits,
			} );

			expect( getCurrentSelectedCountryZoneOwner( state ) ).to.not.be.ok;
		} );

		test( 'should return the zone ID that owns the current country', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'UK' ],
						state: [],
						postcode: [],
					},
					7: {
						continent: [],
						country: [ 'US' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: {
					...initialState,
					temporaryChanges: {
						journal: [
							{ action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'UK' },
							{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'US' },
						],
						states: null,
						postcode: null,
						pristine: false,
					},
				},
			} );

			expect( getCurrentSelectedCountryZoneOwner( state ) ).to.equal( 7 );
		} );
	} );

	describe( 'canLocationsBeFilteredByState', () => {
		test( 'should return false when there are continents selected', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [ 'NA' ],
						country: [],
						state: [],
						postcode: [],
					},
				},
				locationEdits: initialStateWithEmptyTempEdits,
			} );

			expect( canLocationsBeFilteredByState( state ) ).to.be.false;
		} );

		test( 'should return false when there are multiple countries selected', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'US', 'CA' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: initialStateWithEmptyTempEdits,
			} );

			expect( canLocationsBeFilteredByState( state ) ).to.be.false;
		} );

		test( 'should return false when there is no country selected', () => {
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
					...initialState,
					temporaryChanges: {
						journal: [ { action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'US' } ],
						states: null,
						postcode: null,
						pristine: false,
					},
				},
			} );

			expect( canLocationsBeFilteredByState( state ) ).to.be.false;
		} );

		test( 'should return true when there is a single country selected, and it has states', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'US' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: initialStateWithEmptyTempEdits,
			} );

			expect( canLocationsBeFilteredByState( state ) ).to.be.true;
		} );

		test( 'should return true when there is a single country selected with states', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [],
						state: [ 'US:CA', 'US:NY' ],
						postcode: [],
					},
				},
				locationEdits: initialStateWithEmptyTempEdits,
			} );

			expect( canLocationsBeFilteredByState( state ) ).to.be.true;
		} );

		test( 'should return true when there is a single country selected with postcode filter, and it has states', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'US' ],
						state: [],
						postcode: [ '12345' ],
					},
				},
				locationEdits: initialStateWithEmptyTempEdits,
			} );

			expect( canLocationsBeFilteredByState( state ) ).to.be.true;
		} );

		test( 'should return true when there is a single country selected, and it does not have states', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'UK' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: initialStateWithEmptyTempEdits,
			} );

			expect( canLocationsBeFilteredByState( state ) ).to.be.false;
		} );

		test( 'should return false when there is a single country selected with postcode filter, and it does not have states', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'UK' ],
						state: [],
						postcode: [ '12345' ],
					},
				},
				locationEdits: initialStateWithEmptyTempEdits,
			} );

			expect( canLocationsBeFilteredByState( state ) ).to.be.false;
		} );
	} );

	describe( 'areLocationsFilteredByPostcode', () => {
		test( 'should return false when there are continents selected', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [ 'NA' ],
						country: [],
						state: [],
						postcode: [],
					},
				},
				locationEdits: initialStateWithEmptyTempEdits,
			} );

			expect( areLocationsFilteredByPostcode( state ) ).to.be.false;
		} );

		test( 'should return false when there are multiple countries selected', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'US', 'CA' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: initialStateWithEmptyTempEdits,
			} );

			expect( areLocationsFilteredByPostcode( state ) ).to.be.false;
		} );

		test( 'should return false when there is no country selected', () => {
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
					...initialState,
					temporaryChanges: {
						journal: [ { action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'US' } ],
						states: null,
						postcode: null,
						pristine: false,
					},
				},
			} );

			expect( areLocationsFilteredByPostcode( state ) ).to.be.false;
		} );

		test( 'should return false when there is a whole single country selected', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'US' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: initialStateWithEmptyTempEdits,
			} );

			expect( areLocationsFilteredByPostcode( state ) ).to.be.false;
		} );

		test( 'should return false when there is a whole country selected but the it belongs to other zone', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'UK' ],
						state: [],
						postcode: [],
					},
					7: {
						continent: [],
						country: [ 'US' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: {
					...initialState,
					temporaryChanges: {
						journal: [
							{ action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'UK' },
							{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'US' },
						],
						states: null,
						postcode: null,
						pristine: false,
					},
				},
			} );

			expect( areLocationsFilteredByPostcode( state ) ).to.be.false;
		} );

		test( 'should return true when there is a whole country selected but it belongs to another zone and does not allow states', () => {
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
						country: [ 'UK' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: {
					...initialState,
					temporaryChanges: {
						journal: [
							{ action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'US' },
							{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'UK' },
						],
						states: null,
						postcode: null,
						pristine: false,
					},
				},
			} );

			expect( areLocationsFilteredByPostcode( state ) ).to.be.true;
		} );

		test( 'should return false when there is a single country selected, filtered by states', () => {
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
					...initialState,
					temporaryChanges: {
						journal: [],
						states: {
							add: [ 'NY' ],
							remove: [],
							removeAll: true,
						},
						postcode: null,
						pristine: false,
					},
				},
			} );

			expect( areLocationsFilteredByPostcode( state ) ).to.be.false;
		} );

		test( 'should return false when there is a single country with postcode selected, but the postcode filter was removed', () => {
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
					...initialState,
					temporaryChanges: {
						journal: [],
						states: null,
						postcode: null,
						pristine: false,
					},
				},
			} );

			expect( areLocationsFilteredByPostcode( state ) ).to.be.false;
		} );

		test( 'should return true when there is a single country with postcode selected', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'US' ],
						state: [],
						postcode: [ '12345' ],
					},
				},
				locationEdits: initialStateWithEmptyTempEdits,
			} );

			expect( areLocationsFilteredByPostcode( state ) ).to.be.true;
		} );

		test( 'should return true when there is a single country with postcode selected, and the postcode was edited', () => {
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
					...initialState,
					temporaryChanges: {
						journal: [],
						states: null,
						postcode: '12345',
						pristine: false,
					},
				},
			} );

			expect( areLocationsFilteredByPostcode( state ) ).to.be.true;
		} );
	} );

	describe( 'areLocationsFilteredByState', () => {
		test( 'should return false when there are continents selected', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [ 'NA' ],
						country: [],
						state: [],
						postcode: [],
					},
				},
				locationEdits: initialStateWithEmptyTempEdits,
			} );

			expect( areLocationsFilteredByState( state ) ).to.be.false;
		} );

		test( 'should return false when there are multiple countries selected', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'US', 'CA' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: initialStateWithEmptyTempEdits,
			} );

			expect( areLocationsFilteredByState( state ) ).to.be.false;
		} );

		test( 'should return false when there is no country selected', () => {
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
					...initialState,
					temporaryChanges: {
						journal: [ { action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'US' } ],
						states: null,
						postcode: null,
						pristine: false,
					},
				},
			} );

			expect( areLocationsFilteredByState( state ) ).to.be.false;
		} );

		test( 'should return false when there is a whole single country selected', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'US' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: initialStateWithEmptyTempEdits,
			} );

			expect( areLocationsFilteredByState( state ) ).to.be.false;
		} );

		test( 'should return true when there is a whole single country selected but it belongs to another zone', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'UK' ],
						state: [],
						postcode: [],
					},
					7: {
						continent: [],
						country: [ 'US' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: {
					...initialState,
					temporaryChanges: {
						journal: [
							{ action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'UK' },
							{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'US' },
						],
						states: null,
						postcode: null,
						pristine: false,
					},
				},
			} );

			expect( areLocationsFilteredByState( state ) ).to.be.true;
		} );

		test( 'should return false when there is a single country selected, filtered by postcode', () => {
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
					...initialState,
					temporaryChanges: {
						journal: [],
						states: null,
						postcode: '12345',
						pristine: false,
					},
				},
			} );

			expect( areLocationsFilteredByState( state ) ).to.be.false;
		} );

		test( 'should return false when there is a single country with states selected, but the states filter was removed', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [],
						state: [ 'US:NY', 'US:CA' ],
						postcode: [],
					},
				},
				locationEdits: {
					...initialState,
					temporaryChanges: {
						journal: [],
						states: null,
						postcode: null,
						pristine: false,
					},
				},
			} );

			expect( areLocationsFilteredByState( state ) ).to.be.false;
		} );

		test( 'should return true when there is a single country with states selected', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [],
						state: [ 'US:NY', 'US:CA' ],
						postcode: [],
					},
				},
				locationEdits: {
					...initialState,
					temporaryChanges: {
						journal: [],
						states: {
							add: [],
							remove: [],
							removeAll: false,
						},
						postcode: null,
						pristine: false,
					},
				},
			} );

			expect( areLocationsFilteredByState( state ) ).to.be.true;
		} );

		test( 'should return true when there is a single country with states selected, and the states filter was edited', () => {
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
					...initialState,
					temporaryChanges: {
						journal: [],
						states: {
							add: [ 'CA', 'NY' ],
							remove: [],
							removeAll: true,
						},
						postcode: null,
						pristine: false,
					},
				},
			} );

			expect( areLocationsFilteredByState( state ) ).to.be.true;
		} );
	} );

	describe( 'areLocationsUnfiltered', () => {
		test( 'should return false when there are continents selected', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [ 'NA' ],
						country: [],
						state: [],
						postcode: [],
					},
				},
				locationEdits: initialStateWithEmptyTempEdits,
			} );

			expect( areLocationsUnfiltered( state ) ).to.be.false;
		} );

		test( 'should return false when there are multiple countries selected', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'US', 'CA' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: initialStateWithEmptyTempEdits,
			} );

			expect( areLocationsUnfiltered( state ) ).to.be.false;
		} );

		test( 'should return false when there is no country selected', () => {
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
					...initialState,
					temporaryChanges: {
						journal: [ { action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'US' } ],
						states: null,
						postcode: null,
						pristine: false,
					},
				},
			} );

			expect( areLocationsUnfiltered( state ) ).to.be.false;
		} );

		test( 'should return true when there is a whole single country selected', () => {
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
					...initialState,
					temporaryChanges: {
						journal: [],
						states: null,
						postcode: null,
						pristine: false,
					},
				},
			} );

			expect( areLocationsUnfiltered( state ) ).to.be.true;
		} );

		test( 'should return false when there is a whole single country selected but it belongs to another zone', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'UK' ],
						state: [],
						postcode: [],
					},
					7: {
						continent: [],
						country: [ 'US' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: {
					...initialState,
					temporaryChanges: {
						journal: [
							{ action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'UK' },
							{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'US' },
						],
						states: null,
						postcode: null,
						pristine: false,
					},
				},
			} );

			expect( areLocationsUnfiltered( state ) ).to.be.false;
		} );

		test( 'should return false when there is a single country selected, filtered by postcode', () => {
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
					...initialState,
					temporaryChanges: {
						journal: [],
						states: null,
						postcode: '12345',
						pristine: false,
					},
				},
			} );

			expect( areLocationsUnfiltered( state ) ).to.be.false;
		} );

		test( 'should return false when there is a single country with states selected', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [],
						state: [ 'US:NY', 'US:CA' ],
						postcode: [],
					},
				},
				locationEdits: {
					...initialState,
					temporaryChanges: {
						journal: [],
						states: {
							add: [],
							remove: [],
							removeAll: false,
						},
						postcode: null,
						pristine: false,
					},
				},
			} );

			expect( areLocationsUnfiltered( state ) ).to.be.false;
		} );
	} );

	describe( 'getCurrentlyEditingShippingZoneLocationsList', () => {
		test( 'should return an empty list if the locations are not available', () => {
			const state = createEditState( {
				zoneLocations: {
					1: LOADING,
				},
				locationEdits: {},
			} );

			expect( getCurrentlyEditingShippingZoneLocationsList( state ) ).to.deep.equal( [] );
		} );

		test( 'should return a list of continents if the locations are only continents, sorted by name', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [ 'NA', 'EU' ],
						country: [],
						state: [],
						postcode: [],
					},
				},
				locationEdits: initialState,
			} );

			expect( getCurrentlyEditingShippingZoneLocationsList( state ) ).to.deep.equal( [
				{
					type: 'continent',
					code: 'EU',
					name: 'Europe',
				},
				{
					type: 'continent',
					code: 'NA',
					name: 'North America',
				},
			] );
		} );

		test( 'should return a list of countries if the locations are only countries, sorted by name', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'FR', 'US' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: initialState,
			} );

			expect( getCurrentlyEditingShippingZoneLocationsList( state ) ).to.deep.equal( [
				{
					type: 'country',
					code: 'FR',
					name: 'France',
					postcodeFilter: undefined,
				},
				{
					type: 'country',
					code: 'US',
					name: 'United States',
					postcodeFilter: undefined,
				},
			] );
		} );

		test( 'should return a list of states if the locations are only states, sorted by name', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [],
						state: [ 'US:CA', 'US:NY' ],
						postcode: [],
					},
				},
				locationEdits: initialState,
			} );

			expect( getCurrentlyEditingShippingZoneLocationsList( state ) ).to.deep.equal( [
				{
					type: 'state',
					code: 'CA',
					name: 'California',
					countryCode: 'US',
					countryName: 'United States',
				},
				{
					type: 'state',
					code: 'NY',
					name: 'New York',
					countryCode: 'US',
					countryName: 'United States',
				},
			] );
		} );

		test( 'should return the country info and the postcode filter info if the locations are a country plus a postcode', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'US' ],
						state: [],
						postcode: [ '12345' ],
					},
				},
				locationEdits: initialState,
			} );

			expect( getCurrentlyEditingShippingZoneLocationsList( state ) ).to.deep.equal( [
				{
					type: 'country',
					code: 'US',
					name: 'United States',
					postcodeFilter: '12345',
				},
			] );
		} );

		test( 'should apply the commited edits, but not the temporal edits', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'FR' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: {
					journal: [ { action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'UK' } ],
					states: null,
					postcode: null,
					pristine: false,
					temporaryChanges: {
						journal: [ { action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'US' } ],
						states: null,
						postcode: null,
						pristine: false,
					},
				},
			} );

			expect( getCurrentlyEditingShippingZoneLocationsList( state ) ).to.deep.equal( [
				{
					type: 'country',
					code: 'FR',
					name: 'France',
					postcodeFilter: undefined,
				},
				{
					type: 'country',
					code: 'UK',
					name: 'United Kingdom',
					postcodeFilter: undefined,
				},
			] );
		} );

		test( 'should group countries into continents if necessary', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'FR', 'US' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: initialState,
			} );

			expect( getCurrentlyEditingShippingZoneLocationsList( state, 0 ) ).to.deep.equal( [
				{
					type: 'continent',
					code: 'EU',
					name: 'Europe',
					countryCount: 3,
					selectedCountryCount: 1,
				},
				{
					type: 'continent',
					code: 'NA',
					name: 'North America',
					countryCount: 2,
					selectedCountryCount: 1,
				},
			] );
		} );
	} );

	describe( 'getCurrentlyEditingShippingZoneCountries', () => {
		test( 'should return all the continents and countries, sorted hierarchically and by name', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [ 'EU' ],
						country: [],
						state: [],
						postcode: [],
					},
					7: {
						continent: [],
						country: [ 'FR', 'US' ],
						state: [],
						postcode: [],
					},
					8: {
						continent: [ 'NA' ],
						country: [],
						state: [],
						postcode: [],
					},
				},
				locationEdits: {
					journal: [],
					states: null,
					postcode: null,
					pristine: true,
				},
			} );

			expect( getCurrentlyEditingShippingZoneCountries( state ) ).to.deep.equal( [
				{
					code: 'EU',
					name: 'Europe',
					type: 'continent',
					selected: true,
					disabled: false,
					ownerZoneId: undefined,
					countryCount: 3,
					selectedCountryCount: 3,
				},
				{
					code: 'FR',
					name: 'France',
					type: 'country',
					selected: true,
					disabled: true,
					ownerZoneId: 7,
				},
				{
					code: 'ES',
					name: 'Spain',
					type: 'country',
					selected: true,
					disabled: false,
					ownerZoneId: undefined,
				},
				{
					code: 'UK',
					name: 'United Kingdom',
					type: 'country',
					selected: true,
					disabled: false,
					ownerZoneId: undefined,
				},
				{
					code: 'NA',
					name: 'North America',
					type: 'continent',
					selected: false,
					disabled: true,
					ownerZoneId: 8,
					countryCount: 2,
					selectedCountryCount: 0,
				},
				{
					code: 'CA',
					name: 'Canada',
					type: 'country',
					selected: false,
					disabled: false,
					ownerZoneId: undefined,
				},
				{
					code: 'US',
					name: 'United States',
					type: 'country',
					selected: false,
					disabled: true,
					ownerZoneId: 7,
				},
			] );
		} );
	} );

	describe( 'getCurrentlyEditingShippingZoneStates', () => {
		test( 'should return an empty list when the locations are not filtered by state', () => {
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
					journal: [],
					states: null,
					postcode: '12345',
					pristine: false,
					temporaryChanges: initialState,
				},
			} );

			expect( getCurrentlyEditingShippingZoneStates( state ) ).to.deep.equal( [] );
		} );

		test( 'should return all the country states, sorted by name', () => {
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
						country: [],
						state: [ 'US:UT' ],
						postcode: [],
					},
				},
				locationEdits: {
					journal: [],
					states: {
						add: [ 'NY', 'CA' ],
						remove: [],
						removeAll: true,
					},
					postcode: null,
					pristine: false,
					temporaryChanges: initialState,
				},
			} );

			expect( getCurrentlyEditingShippingZoneStates( state ) ).to.deep.equal( [
				{
					code: 'AL',
					name: 'Alabama',
					selected: false,
					disabled: false,
					ownerZoneId: undefined,
				},
				{
					code: 'CA',
					name: 'California',
					selected: true,
					disabled: false,
					ownerZoneId: undefined,
				},
				{
					code: 'NY',
					name: 'New York',
					selected: true,
					disabled: false,
					ownerZoneId: undefined,
				},
				{
					code: 'UT',
					name: 'Utah',
					selected: false,
					disabled: true,
					ownerZoneId: 7,
				},
			] );
		} );
	} );

	describe( 'areCurrentlyEditingShippingZoneLocationsValid', () => {
		test( 'should return false when the locations are empty', () => {
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
					journal: [ { action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'US' } ],
					states: null,
					postcode: null,
					pristine: false,
					temporaryChanges: initialState,
				},
			} );

			expect( areCurrentlyEditingShippingZoneLocationsValid( state ) ).to.be.false;
		} );

		test( 'should return false when the locations are filtered by postcode but it is empty', () => {
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
					journal: [],
					states: null,
					postcode: '',
					pristine: false,
					temporaryChanges: initialState,
				},
			} );

			expect( areCurrentlyEditingShippingZoneLocationsValid( state ) ).to.be.false;
		} );

		test( 'should return false when the locations are filtered by state but there are no states selected', () => {
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
					journal: [],
					states: {
						add: [],
						remove: [],
						removeAll: false,
					},
					postcode: null,
					pristine: false,
					temporaryChanges: initialState,
				},
			} );

			expect( areCurrentlyEditingShippingZoneLocationsValid( state ) ).to.be.false;
		} );

		test( 'should return true when the locations are several countries', () => {
			const state = createEditState( {
				zoneLocations: {
					1: {
						continent: [],
						country: [ 'US', 'UK' ],
						state: [],
						postcode: [],
					},
				},
				locationEdits: {
					journal: [],
					states: null,
					postcode: null,
					pristine: true,
					temporaryChanges: initialState,
				},
			} );

			expect( areCurrentlyEditingShippingZoneLocationsValid( state ) ).to.be.true;
		} );

		test( 'should return true when the locations are several continents', () => {
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
					journal: [],
					states: null,
					postcode: null,
					pristine: true,
					temporaryChanges: initialState,
				},
			} );

			expect( areCurrentlyEditingShippingZoneLocationsValid( state ) ).to.be.true;
		} );

		test( 'should return true when the locations are a country with a postcode', () => {
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
					journal: [],
					states: null,
					postcode: '12345',
					pristine: false,
					temporaryChanges: initialState,
				},
			} );

			expect( areCurrentlyEditingShippingZoneLocationsValid( state ) ).to.be.true;
		} );

		test( 'should return true when the locations are a country with states', () => {
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
					journal: [],
					states: {
						add: [ 'CA', 'NY' ],
						remove: [],
						removeAll: false,
					},
					postcode: null,
					pristine: false,
					temporaryChanges: initialState,
				},
			} );

			expect( areCurrentlyEditingShippingZoneLocationsValid( state ) ).to.be.true;
		} );

		test( 'should overlay the temporary changes', () => {
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
					journal: [ { action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'US' } ],
					states: null,
					postcode: null,
					pristine: false,
					temporaryChanges: {
						journal: [ { action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'UK' } ],
						states: null,
						postcode: null,
						pristine: false,
					},
				},
			} );

			expect( areCurrentlyEditingShippingZoneLocationsValid( state ) ).to.be.true;
		} );
	} );

	describe( 'getOrderOperationsToSaveCurrentZone', () => {
		test( 'should return an empty list if the zone does not have locations', () => {
			const state = createState( {
				site: {
					shippingZones: [ { id: 1, methodIds: [] } ],
					shippingZoneLocations: {
						1: {
							continent: [],
							country: [ 'US' ],
							state: [],
							postcode: [],
						},
					},
					locations,
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [],
							deletes: [],
							currentlyEditingId: 1,
							currentlyEditingChanges: {
								locations: {
									journal: [ { action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'US' } ],
									states: null,
									postcode: null,
									pristine: false,
								},
							},
						},
					},
				},
			} );

			expect( getOrderOperationsToSaveCurrentZone( state ) ).to.deep.equal( {} );
		} );

		test( 'should return a move operation if the zone locations edits have made it change priority', () => {
			const state = createState( {
				site: {
					shippingZones: [ { id: 1, order: 3, methodIds: [] } ],
					shippingZoneLocations: {
						1: {
							continent: [],
							country: [ 'US' ],
							state: [],
							postcode: [],
						},
					},
					locations,
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [],
							deletes: [],
							currentlyEditingId: 1,
							currentlyEditingChanges: {
								locations: {
									journal: [],
									states: {
										add: [ 'NY' ],
										remove: [],
										removeAll: false,
									},
									postcode: null,
									pristine: false,
								},
							},
						},
					},
				},
			} );

			expect( getOrderOperationsToSaveCurrentZone( state ) ).to.deep.equal( {
				1: 2, // Zone 1 must have order=2
			} );
		} );

		test( 'should return multiple move operations if the existing zones were not in ideal order', () => {
			const state = createState( {
				site: {
					shippingZones: [
						{ id: 1, order: 0, methodIds: [] },
						{ id: 2, order: 0, methodIds: [] },
						{ id: 3, order: 0, methodIds: [] },
					],
					shippingZoneLocations: {
						1: {
							continent: [],
							country: [],
							state: [ 'US:NY' ],
							postcode: [],
						},
						2: {
							continent: [],
							country: [ 'UK' ],
							state: [],
							postcode: [],
						},
						3: {
							continent: [],
							country: [ 'US' ],
							state: [],
							postcode: [],
						},
					},
					locations,
				},
				ui: {
					shipping: {
						zones: {
							creates: [],
							updates: [],
							deletes: [],
							currentlyEditingId: 1,
							currentlyEditingChanges: {
								locations: {
									journal: [],
									states: null,
									postcode: null,
									pristine: true,
								},
							},
						},
					},
				},
			} );

			expect( getOrderOperationsToSaveCurrentZone( state ) ).to.deep.equal( {
				1: 2, // Zone 1 must have order=2
				2: 3, // Zone 2 must have order=3
				3: 3, // Zone 3 must have order=3
			} );
		} );
	} );
} );
