/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	openEditLocations,
	closeEditLocations,
	cancelEditLocations,
	toggleContinentSelected,
	toggleCountrySelected,
	toggleStateSelected,
	editPostcode,
	filterByWholeCountry,
	filterByState,
	filterByPostcode,
} from '../actions';
import reducer, { initialState, JOURNAL_ACTIONS } from '../reducer';

const initialStateWithTempChanges = {
	...initialState,
	temporaryChanges: { ...initialState },
};

const siteId = 123;

describe( 'reducer', () => {
	describe( 'openEditLocations', () => {
		test( 'should add an empty set of "temporal changes" to the state', () => {
			const newState = reducer( initialState, openEditLocations( siteId ) );
			expect( newState ).to.deep.equal( initialStateWithTempChanges );
		} );
	} );

	describe( 'closeEditLocations', () => {
		test( 'should commit the temporal changes to the main state', () => {
			const state = {
				journal: [ { action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'US' } ],
				states: null,
				postcode: null,
				pristine: false,
				temporaryChanges: {
					journal: [
						{ action: JOURNAL_ACTIONS.REMOVE_CONTINENT, code: 'NA' },
						{ action: JOURNAL_ACTIONS.ADD_CONTINENT, code: 'EU' },
					],
					states: null,
					postcode: null,
					pristine: false,
				},
			};
			const newState = reducer( state, closeEditLocations( siteId ) );
			expect( newState ).to.deep.equal( {
				journal: [
					{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'US' },
					{ action: JOURNAL_ACTIONS.REMOVE_CONTINENT, code: 'NA' },
					{ action: JOURNAL_ACTIONS.ADD_CONTINENT, code: 'EU' },
				],
				states: null,
				postcode: null,
				pristine: false,
			} );
		} );
	} );

	describe( 'cancelEditLocations', () => {
		test( 'should discard the temporal changes', () => {
			const state = {
				journal: [ { action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'US' } ],
				states: null,
				postcode: null,
				pristine: false,
				temporaryChanges: {
					journal: [
						{ action: JOURNAL_ACTIONS.REMOVE_CONTINENT, code: 'NA' },
						{ action: JOURNAL_ACTIONS.ADD_CONTINENT, code: 'EU' },
					],
					states: null,
					postcode: null,
					pristine: false,
				},
			};
			const newState = reducer( state, cancelEditLocations( siteId ) );
			expect( newState ).to.deep.equal( {
				journal: [ { action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'US' } ],
				states: null,
				postcode: null,
				pristine: false,
				temporaryChanges: null,
			} );
		} );
	} );

	describe( 'toggleContinentSelected', () => {
		test( 'should add an ADD_CONTINENT entry to the journal', () => {
			const newState = reducer(
				initialStateWithTempChanges,
				toggleContinentSelected( siteId, 'NA', true )
			);
			expect( newState.temporaryChanges.journal ).to.deep.equal( [
				{ action: JOURNAL_ACTIONS.ADD_CONTINENT, code: 'NA' },
			] );
			expect( newState.temporaryChanges.pristine ).to.equal( false );
		} );

		test( 'should add an REMOVE_CONTINENT entry to the journal', () => {
			const newState = reducer(
				initialStateWithTempChanges,
				toggleContinentSelected( siteId, 'NA', false )
			);
			expect( newState.temporaryChanges.journal ).to.deep.equal( [
				{ action: JOURNAL_ACTIONS.REMOVE_CONTINENT, code: 'NA' },
			] );
			expect( newState.temporaryChanges.pristine ).to.equal( false );
		} );

		test( 'should NOT remove previous entries of the journal, only add entries instead', () => {
			const state = {
				...initialState,
				temporaryChanges: {
					journal: [
						{ action: JOURNAL_ACTIONS.REMOVE_CONTINENT, code: 'NA' },
						{ action: JOURNAL_ACTIONS.ADD_CONTINENT, code: 'EU' },
					],
					states: null,
					postcode: null,
					pristine: false,
				},
			};
			const newState = reducer( state, toggleContinentSelected( siteId, 'NA', true ) );
			expect( newState.temporaryChanges.journal ).to.deep.equal( [
				{ action: JOURNAL_ACTIONS.REMOVE_CONTINENT, code: 'NA' },
				{ action: JOURNAL_ACTIONS.ADD_CONTINENT, code: 'EU' },
				{ action: JOURNAL_ACTIONS.ADD_CONTINENT, code: 'NA' },
			] );
			expect( newState.temporaryChanges.pristine ).to.equal( false );
		} );

		test( 'should always reset the postcode filter', () => {
			const state = {
				...initialState,
				temporaryChanges: {
					journal: [],
					states: null,
					postcode: '12345',
					pristine: false,
				},
			};
			const newState = reducer( state, toggleContinentSelected( siteId, 'NA', true ) );
			expect( newState.temporaryChanges.postcode ).to.be.null;
			expect( newState.temporaryChanges.pristine ).to.equal( false );
		} );

		test( 'should always reset the states filter', () => {
			const state = {
				...initialState,
				temporaryChanges: {
					journal: [],
					states: { add: [ 'UT' ], remove: [ 'CA' ] },
					postcode: null,
					pristine: false,
				},
			};
			const newState = reducer( state, toggleContinentSelected( siteId, 'NA', true ) );
			expect( newState.temporaryChanges.states ).to.be.null;
			expect( newState.temporaryChanges.pristine ).to.equal( false );
		} );
	} );

	describe( 'toggleCountrySelected', () => {
		test( 'should add an ADD_COUNTRY entry to the journal', () => {
			const newState = reducer(
				initialStateWithTempChanges,
				toggleCountrySelected( siteId, 'US', true )
			);
			expect( newState.temporaryChanges.journal ).to.deep.equal( [
				{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'US' },
			] );
			expect( newState.temporaryChanges.pristine ).to.equal( false );
		} );

		test( 'should add an REMOVE_COUNTRY entry to the journal', () => {
			const newState = reducer(
				initialStateWithTempChanges,
				toggleCountrySelected( siteId, 'US', false )
			);
			expect( newState.temporaryChanges.journal ).to.deep.equal( [
				{ action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'US' },
			] );
			expect( newState.temporaryChanges.pristine ).to.equal( false );
		} );

		test( 'should NOT remove previous entries of the journal, only add entries instead', () => {
			const state = {
				...initialState,
				temporaryChanges: {
					journal: [
						{ action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'US' },
						{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'CA' },
					],
					states: null,
					postcode: null,
					pristine: false,
				},
			};
			const newState = reducer( state, toggleCountrySelected( siteId, 'US', true ) );
			expect( newState.temporaryChanges.journal ).to.deep.equal( [
				{ action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'US' },
				{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'CA' },
				{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'US' },
			] );
			expect( newState.temporaryChanges.pristine ).to.equal( false );
		} );

		test( 'should always reset the postcode filter', () => {
			const state = {
				...initialState,
				temporaryChanges: {
					journal: [],
					states: null,
					postcode: '12345',
					pristine: false,
				},
			};
			const newState = reducer( state, toggleCountrySelected( siteId, 'US', true ) );
			expect( newState.temporaryChanges.postcode ).to.be.null;
			expect( newState.temporaryChanges.pristine ).to.equal( false );
		} );

		test( 'should always reset the states filter', () => {
			const state = {
				...initialState,
				temporaryChanges: {
					journal: [],
					states: { add: [ 'UT' ], remove: [ 'CA' ] },
					postcode: null,
					pristine: false,
				},
			};
			const newState = reducer( state, toggleCountrySelected( siteId, 'US', true ) );
			expect( newState.temporaryChanges.states ).to.be.null;
			expect( newState.temporaryChanges.pristine ).to.equal( false );
		} );
	} );

	describe( 'toggleStateSelected', () => {
		test( 'should add a state to the list even if the states filter was uninitialized', () => {
			const state = {
				...initialState,
				temporaryChanges: {
					journal: [],
					states: null,
					postcode: null,
					pristine: true,
				},
			};
			const newState = reducer( state, toggleStateSelected( siteId, 'NY', true ) );
			expect( newState.temporaryChanges.states ).to.deep.equal( {
				add: [ 'NY' ],
				remove: [],
				removeAll: false,
			} );
			expect( newState.temporaryChanges.pristine ).to.equal( false );
		} );

		test( 'should add a previously removed state to the list', () => {
			const state = {
				...initialState,
				temporaryChanges: {
					journal: [],
					states: {
						add: [ 'CA' ],
						remove: [ 'NY' ],
						removeAll: false,
					},
					postcode: null,
					pristine: false,
				},
			};
			const newState = reducer( state, toggleStateSelected( siteId, 'NY', true ) );
			expect( newState.temporaryChanges.states ).to.deep.equal( {
				add: [ 'CA', 'NY' ],
				remove: [],
				removeAll: false,
			} );
			expect( newState.temporaryChanges.pristine ).to.equal( false );
		} );

		test( 'should add a state to the list', () => {
			const state = {
				...initialState,
				temporaryChanges: {
					journal: [],
					states: {
						add: [ 'CA' ],
						remove: [],
						removeAll: false,
					},
					postcode: null,
					pristine: false,
				},
			};
			const newState = reducer( state, toggleStateSelected( siteId, 'NY', true ) );
			expect( newState.temporaryChanges.states ).to.deep.equal( {
				add: [ 'CA', 'NY' ],
				remove: [],
				removeAll: false,
			} );
			expect( newState.temporaryChanges.pristine ).to.equal( false );
		} );

		test( 'should remove a previously added state from the list', () => {
			const state = {
				...initialState,
				temporaryChanges: {
					journal: [],
					states: {
						add: [ 'NY' ],
						remove: [ 'CA' ],
						removeAll: false,
					},
					postcode: null,
					pristine: false,
				},
			};
			const newState = reducer( state, toggleStateSelected( siteId, 'NY', false ) );
			expect( newState.temporaryChanges.states ).to.deep.equal( {
				add: [],
				remove: [ 'CA', 'NY' ],
				removeAll: false,
			} );
			expect( newState.temporaryChanges.pristine ).to.equal( false );
		} );

		test( 'should remove a state from the list', () => {
			const state = {
				...initialState,
				temporaryChanges: {
					journal: [],
					states: {
						add: [],
						remove: [ 'CA' ],
						removeAll: false,
					},
					postcode: null,
					pristine: false,
				},
			};
			const newState = reducer( state, toggleStateSelected( siteId, 'NY', false ) );
			expect( newState.temporaryChanges.states ).to.deep.equal( {
				add: [],
				remove: [ 'CA', 'NY' ],
				removeAll: false,
			} );
			expect( newState.temporaryChanges.pristine ).to.equal( false );
		} );

		test( 'should preserve the removeAll flag', () => {
			const state = {
				...initialState,
				temporaryChanges: {
					journal: [],
					states: {
						add: [],
						remove: [],
						removeAll: true,
					},
					postcode: null,
					pristine: false,
				},
			};
			const newState = reducer( state, toggleStateSelected( siteId, 'NY', true ) );
			expect( newState.temporaryChanges.states ).to.deep.equal( {
				add: [ 'NY' ],
				remove: [],
				removeAll: true,
			} );
			expect( newState.temporaryChanges.pristine ).to.equal( false );
		} );
	} );

	describe( 'editPostcode', () => {
		test( 'should store the given "postcode" value', () => {
			const newState = reducer( initialStateWithTempChanges, editPostcode( siteId, '12345' ) );
			expect( newState.temporaryChanges.postcode ).to.equal( '12345' );
			expect( newState.temporaryChanges.pristine ).to.equal( false );
		} );
	} );

	describe( 'filterByWholeCountry', () => {
		test( 'should remove the postcode filter', () => {
			const state = {
				...initialState,
				temporaryChanges: {
					journal: [],
					states: null,
					postcode: '12345',
					pristine: false,
				},
			};
			const newState = reducer( state, filterByWholeCountry( siteId ) );
			expect( newState.temporaryChanges.postcode ).to.be.null;
			expect( newState.temporaryChanges.pristine ).to.equal( false );
		} );

		test( 'should remove the states filter', () => {
			const state = {
				...initialState,
				temporaryChanges: {
					journal: [],
					states: {
						add: [ 'NY' ],
						remove: [],
						removeAll: false,
					},
					postcode: null,
					pristine: false,
				},
			};
			const newState = reducer( state, filterByWholeCountry( siteId ) );
			expect( newState.temporaryChanges.states ).to.be.null;
			expect( newState.temporaryChanges.pristine ).to.equal( false );
		} );
	} );

	describe( 'filterByState', () => {
		test( 'should remove the postcode filter', () => {
			const state = {
				...initialState,
				temporaryChanges: {
					journal: [],
					states: null,
					postcode: '12345',
					pristine: false,
				},
			};
			const newState = reducer( state, filterByState( siteId ) );
			expect( newState.temporaryChanges.postcode ).to.be.null;
			expect( newState.temporaryChanges.states ).to.deep.equal( {
				add: [],
				remove: [],
				removeAll: true,
			} );
			expect( newState.temporaryChanges.pristine ).to.equal( false );
		} );
	} );

	describe( 'filterByPostcode', () => {
		test( 'should remove the states filter', () => {
			const state = {
				...initialState,
				temporaryChanges: {
					journal: [],
					states: {
						add: [ 'NY' ],
						remove: [],
						removeAll: false,
					},
					postcode: null,
					pristine: false,
				},
			};
			const newState = reducer( state, filterByPostcode( siteId ) );
			expect( newState.temporaryChanges.states ).to.be.null;
			expect( newState.temporaryChanges.postcode ).to.equal( '' );
			expect( newState.temporaryChanges.pristine ).to.equal( false );
		} );
	} );
} );
