/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer, { initialState, JOURNAL_ACTIONS } from '../reducer';
import {
	toggleContinentSelected,
	toggleCountrySelected,
	toggleStateSelected,
	editPostcode,
	filterByWholeCountry,
	filterByState,
	filterByPostcode,
} from '../actions';

const siteId = 123;

describe( 'reducer', () => {
	describe( 'toggleContinentSelected', () => {
		it( 'should add an ADD_CONTINENT entry to the journal', () => {
			const newState = reducer( initialState, toggleContinentSelected( siteId, 'NA', true ) );
			expect( newState.journal ).to.deep.equal( [
				{ action: JOURNAL_ACTIONS.ADD_CONTINENT, code: 'NA' },
			] );
			expect( newState.pristine ).to.equal( false );
		} );

		it( 'should add an REMOVE_CONTINENT entry to the journal', () => {
			const newState = reducer( initialState, toggleContinentSelected( siteId, 'NA', false ) );
			expect( newState.journal ).to.deep.equal( [
				{ action: JOURNAL_ACTIONS.REMOVE_CONTINENT, code: 'NA' },
			] );
			expect( newState.pristine ).to.equal( false );
		} );

		it( 'should NOT remove previous entries of the journal, only add entries instead', () => {
			const state = {
				journal: [
					{ action: JOURNAL_ACTIONS.REMOVE_CONTINENT, code: 'NA' },
					{ action: JOURNAL_ACTIONS.ADD_CONTINENT, code: 'EU' },
				],
				states: null,
				postcode: null,
				pristine: false,
			};
			const newState = reducer( state, toggleContinentSelected( siteId, 'NA', true ) );
			expect( newState.journal ).to.deep.equal( [
				{ action: JOURNAL_ACTIONS.REMOVE_CONTINENT, code: 'NA' },
				{ action: JOURNAL_ACTIONS.ADD_CONTINENT, code: 'EU' },
				{ action: JOURNAL_ACTIONS.ADD_CONTINENT, code: 'NA' },
			] );
			expect( newState.pristine ).to.equal( false );
		} );

		it( 'should always reset the postcode filter', () => {
			const state = {
				journal: [],
				states: null,
				postcode: '12345',
				pristine: false,
			};
			const newState = reducer( state, toggleContinentSelected( siteId, 'NA', true ) );
			expect( newState.postcode ).to.be.null;
			expect( newState.pristine ).to.equal( false );
		} );

		it( 'should always reset the states filter', () => {
			const state = {
				journal: [],
				states: { add: [ 'UT' ], remove: [ 'CA' ] },
				postcode: null,
				pristine: false,
			};
			const newState = reducer( state, toggleContinentSelected( siteId, 'NA', true ) );
			expect( newState.states ).to.be.null;
			expect( newState.pristine ).to.equal( false );
		} );
	} );

	describe( 'toggleCountrySelected', () => {
		it( 'should add an ADD_COUNTRY entry to the journal', () => {
			const newState = reducer( initialState, toggleCountrySelected( siteId, 'US', true ) );
			expect( newState.journal ).to.deep.equal( [
				{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'US' },
			] );
			expect( newState.pristine ).to.equal( false );
		} );

		it( 'should add an REMOVE_COUNTRY entry to the journal', () => {
			const newState = reducer( initialState, toggleCountrySelected( siteId, 'US', false ) );
			expect( newState.journal ).to.deep.equal( [
				{ action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'US' },
			] );
			expect( newState.pristine ).to.equal( false );
		} );

		it( 'should NOT remove previous entries of the journal, only add entries instead', () => {
			const state = {
				journal: [
					{ action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'US' },
					{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'CA' },
				],
				states: null,
				postcode: null,
				pristine: false,
			};
			const newState = reducer( state, toggleCountrySelected( siteId, 'US', true ) );
			expect( newState.journal ).to.deep.equal( [
				{ action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'US' },
				{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'CA' },
				{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'US' },
			] );
			expect( newState.pristine ).to.equal( false );
		} );

		it( 'should always reset the postcode filter', () => {
			const state = {
				journal: [],
				states: null,
				postcode: '12345',
				pristine: false,
			};
			const newState = reducer( state, toggleCountrySelected( siteId, 'US', true ) );
			expect( newState.postcode ).to.be.null;
			expect( newState.pristine ).to.equal( false );
		} );

		it( 'should always reset the states filter', () => {
			const state = {
				journal: [],
				states: { add: [ 'UT' ], remove: [ 'CA' ] },
				postcode: null,
				pristine: false,
			};
			const newState = reducer( state, toggleCountrySelected( siteId, 'US', true ) );
			expect( newState.states ).to.be.null;
			expect( newState.pristine ).to.equal( false );
		} );
	} );

	describe( 'toggleStateSelected', () => {
		it( 'should add a state to the list even if the states filter was uninitialized', () => {
			const state = {
				journal: [],
				states: null,
				postcode: null,
				pristine: true,
			};
			const newState = reducer( state, toggleStateSelected( siteId, 'NY', true ) );
			expect( newState.states ).to.deep.equal( {
				add: [ 'NY' ],
				remove: [],
				removeAll: false,
			} );
			expect( newState.pristine ).to.equal( false );
		} );

		it( 'should add a previously removed state to the list', () => {
			const state = {
				journal: [],
				states: {
					add: [ 'CA' ],
					remove: [ 'NY' ],
					removeAll: false,
				},
				postcode: null,
				pristine: false,
			};
			const newState = reducer( state, toggleStateSelected( siteId, 'NY', true ) );
			expect( newState.states ).to.deep.equal( {
				add: [ 'CA', 'NY' ],
				remove: [],
				removeAll: false,
			} );
			expect( newState.pristine ).to.equal( false );
		} );

		it( 'should add a state to the list', () => {
			const state = {
				journal: [],
				states: {
					add: [ 'CA' ],
					remove: [],
					removeAll: false,
				},
				postcode: null,
				pristine: false,
			};
			const newState = reducer( state, toggleStateSelected( siteId, 'NY', true ) );
			expect( newState.states ).to.deep.equal( {
				add: [ 'CA', 'NY' ],
				remove: [],
				removeAll: false,
			} );
			expect( newState.pristine ).to.equal( false );
		} );

		it( 'should remove a previously added state from the list', () => {
			const state = {
				journal: [],
				states: {
					add: [ 'NY' ],
					remove: [ 'CA' ],
					removeAll: false,
				},
				postcode: null,
				pristine: false,
			};
			const newState = reducer( state, toggleStateSelected( siteId, 'NY', false ) );
			expect( newState.states ).to.deep.equal( {
				add: [],
				remove: [ 'CA', 'NY' ],
				removeAll: false,
			} );
			expect( newState.pristine ).to.equal( false );
		} );

		it( 'should remove a state from the list', () => {
			const state = {
				journal: [],
				states: {
					add: [],
					remove: [ 'CA' ],
					removeAll: false,
				},
				postcode: null,
				pristine: false,
			};
			const newState = reducer( state, toggleStateSelected( siteId, 'NY', false ) );
			expect( newState.states ).to.deep.equal( {
				add: [],
				remove: [ 'CA', 'NY' ],
				removeAll: false,
			} );
			expect( newState.pristine ).to.equal( false );
		} );

		it( 'should preserve the removeAll flag', () => {
			const state = {
				journal: [],
				states: {
					add: [],
					remove: [],
					removeAll: true,
				},
				postcode: null,
				pristine: false,
			};
			const newState = reducer( state, toggleStateSelected( siteId, 'NY', true ) );
			expect( newState.states ).to.deep.equal( {
				add: [ 'NY' ],
				remove: [],
				removeAll: true,
			} );
			expect( newState.pristine ).to.equal( false );
		} );
	} );

	describe( 'editPostcode', () => {
		it( 'should store the given "postcode" value', () => {
			const newState = reducer( initialState, editPostcode( siteId, '12345' ) );
			expect( newState.postcode ).to.equal( '12345' );
			expect( newState.pristine ).to.equal( false );
		} );
	} );

	describe( 'filterByWholeCountry', () => {
		it( 'should remove the postcode filter', () => {
			const state = {
				journal: [],
				states: null,
				postcode: '12345',
				pristine: false,
			};
			const newState = reducer( state, filterByWholeCountry( siteId ) );
			expect( newState.postcode ).to.be.null;
			expect( newState.pristine ).to.equal( false );
		} );

		it( 'should remove the states filter', () => {
			const state = {
				journal: [],
				states: {
					add: [ 'NY' ],
					remove: [],
					removeAll: false,
				},
				postcode: null,
				pristine: false,
			};
			const newState = reducer( state, filterByWholeCountry( siteId ) );
			expect( newState.states ).to.be.null;
			expect( newState.pristine ).to.equal( false );
		} );
	} );

	describe( 'filterByState', () => {
		it( 'should remove the postcode filter', () => {
			const state = {
				journal: [],
				states: null,
				postcode: '12345',
				pristine: false,
			};
			const newState = reducer( state, filterByState( siteId ) );
			expect( newState.postcode ).to.be.null;
			expect( newState.states ).to.deep.equal( {
				add: [],
				remove: [],
				removeAll: true,
			} );
			expect( newState.pristine ).to.equal( false );
		} );
	} );

	describe( 'filterByPostcode', () => {
		it( 'should remove the states filter', () => {
			const state = {
				journal: [],
				states: {
					add: [ 'NY' ],
					remove: [],
					removeAll: false,
				},
				postcode: null,
				pristine: false,
			};
			const newState = reducer( state, filterByPostcode( siteId ) );
			expect( newState.states ).to.be.null;
			expect( newState.postcode ).to.equal( '' );
			expect( newState.pristine ).to.equal( false );
		} );
	} );
} );
