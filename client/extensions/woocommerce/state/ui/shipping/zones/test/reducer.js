/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	addNewShippingZone,
	openShippingZoneForEdit,
	closeEditingShippingZone,
	cancelEditingShippingZone,
	changeShippingZoneName,
	deleteShippingZone,
} from '../actions';
import reducer, { initialState } from '../reducer';

const siteId = 123;

const emptyMethodChanges = {
	creates: [],
	updates: [],
	deletes: [],
	currentlyEditingId: null,
	currentlyEditingNew: false,
	currentlyEditingChangedType: false,
};

const emptyLocationChanges = {
	journal: [],
	postcode: null,
	states: null,
	pristine: true,
};

const emptyChanges = {
	methods: emptyMethodChanges,
	locations: emptyLocationChanges,
};

describe( 'reducer', () => {
	describe( 'addNewShippingZone', () => {
		test( 'should create a new zone and mark it as "editing", without commiting it to the "creates" bucket', () => {
			const newState = reducer( initialState, addNewShippingZone( siteId ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.currentlyEditingId ).to.deep.equal( { index: 0 } );
			expect( newState.currentlyEditingChanges ).to.deep.equal( emptyChanges );
		} );
	} );

	describe( 'openShippingZoneForEdit', () => {
		test( 'should not add anything to "updates" when the zone has a server-side ID', () => {
			const newState = reducer( initialState, openShippingZoneForEdit( siteId, 1 ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.be.empty;
			expect( newState.currentlyEditingId ).to.equal( 1 );
			expect( newState.currentlyEditingChanges ).to.deep.equal( emptyChanges );
		} );

		test( 'should not add anything to "creates" when the zone has a provisional ID', () => {
			const newState = reducer( initialState, openShippingZoneForEdit( siteId, { index: 0 } ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.be.empty;
			expect( newState.currentlyEditingId ).to.deep.equal( { index: 0 } );
			expect( newState.currentlyEditingChanges ).to.deep.equal( emptyChanges );
		} );
	} );

	describe( 'closeEditingShippingZone', () => {
		test( 'should do nothing if there are no changes to save', () => {
			const state = {
				creates: [],
				updates: [],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: emptyChanges,
			};

			const newState = reducer( state, closeEditingShippingZone( siteId ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.be.empty;
			expect( newState.currentlyEditingId ).to.be.null;
		} );

		test( 'should commit changes to the "updates" bucket if the zone has a server-side ID', () => {
			const state = {
				creates: [],
				updates: [ { id: 42 } ],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: { ...emptyChanges, name: 'Hi There' },
			};

			const newState = reducer( state, closeEditingShippingZone( siteId ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.deep.equal( [
				{ id: 42 },
				{ id: 1, ...emptyChanges, name: 'Hi There' },
			] );
			expect( newState.currentlyEditingId ).to.be.null;
		} );

		test( 'should overwrite data on the "updates" bucket if the zone has a server-side ID', () => {
			const state = {
				creates: [],
				updates: [ { id: 1, ...emptyChanges, name: 'OldName' } ],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: { ...emptyChanges, name: 'Hi There' },
			};

			const newState = reducer( state, closeEditingShippingZone( siteId ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.deep.equal( [ { id: 1, ...emptyChanges, name: 'Hi There' } ] );
			expect( newState.currentlyEditingId ).to.be.null;
		} );

		test( 'should commit changes to the "creates" bucket if the zone has a provisional ID', () => {
			const state = {
				creates: [ { id: { index: 0 } } ],
				updates: [],
				deletes: [],
				currentlyEditingId: { index: 1 },
				currentlyEditingChanges: { ...emptyChanges, name: 'Hi There' },
			};

			const newState = reducer( state, closeEditingShippingZone( siteId ) );
			expect( newState.updates ).to.be.empty;
			expect( newState.creates ).to.deep.equal( [
				{ id: { index: 0 } },
				{ id: { index: 1 }, ...emptyChanges, name: 'Hi There' },
			] );
			expect( newState.currentlyEditingId ).to.be.null;
		} );

		test( 'should overwrite data on the "creates" bucket if the zone has a provisional ID', () => {
			const state = {
				creates: [ { id: { index: 0 }, ...emptyChanges, name: 'OldName' } ],
				updates: [],
				deletes: [],
				currentlyEditingId: { index: 0 },
				currentlyEditingChanges: { ...emptyChanges, name: 'Hi There' },
			};

			const newState = reducer( state, closeEditingShippingZone( siteId ) );
			expect( newState.updates ).to.be.empty;
			expect( newState.creates ).to.deep.equal( [
				{ id: { index: 0 }, ...emptyChanges, name: 'Hi There' },
			] );
			expect( newState.currentlyEditingId ).to.be.null;
		} );
	} );

	describe( 'cancelEditingShippingZone', () => {
		test( 'should not commit changes for an "update" shipping zone', () => {
			const state = {
				creates: [],
				updates: [ { id: 1, name: 'Good Name' } ],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: { name: 'Trololololol' },
			};

			const newState = reducer( state, cancelEditingShippingZone( siteId ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.deep.equal( [ { id: 1, name: 'Good Name' } ] );
			expect( newState.currentlyEditingId ).to.be.null;
		} );

		test( 'should not commit changes for a "create" shipping zone', () => {
			const state = {
				creates: [ { id: { index: 0 }, name: 'Good Name' } ],
				updates: [],
				deletes: [],
				currentlyEditingId: { index: 0 },
				currentlyEditingChanges: { name: 'Trololololol' },
			};

			const newState = reducer( state, cancelEditingShippingZone( siteId ) );
			expect( newState.updates ).to.be.empty;
			expect( newState.creates ).to.deep.equal( [ { id: { index: 0 }, name: 'Good Name' } ] );
			expect( newState.currentlyEditingId ).to.be.null;
		} );
	} );

	describe( 'changeShippingZoneName', () => {
		test( 'should not do anything if there is no zone being edited', () => {
			const newState = reducer( initialState, changeShippingZoneName( siteId, 'something' ) );
			expect( newState ).to.deep.equal( initialState );
		} );

		test( 'should change the shipping zone name without committing it', () => {
			const state = {
				creates: [],
				updates: [ { id: 1, ...emptyChanges, name: 'Previous Name' } ],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: { ...emptyChanges, name: 'blah blah blah' },
			};

			const newState = reducer( state, changeShippingZoneName( siteId, 'New Name' ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.deep.equal( [
				{ id: 1, ...emptyChanges, name: 'Previous Name' },
			] );
			expect( newState.currentlyEditingChanges ).to.deep.equal( {
				...emptyChanges,
				name: 'New Name',
			} );
			expect( newState.currentlyEditingId ).to.equal( 1 );
		} );
	} );

	describe( 'deleteShippingZone', () => {
		test( 'should mark the zone as to be deleted', () => {
			const newState = reducer( initialState, deleteShippingZone( siteId, 42 ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.be.empty;
			expect( newState.deletes ).to.deep.equal( [ { id: 42 } ] );
		} );

		test( 'should remove the zone from the "updates" list', () => {
			const state = {
				creates: [],
				updates: [ { id: 1, name: 'Previous Name' }, { id: 2 } ],
				deletes: [],
				currentlyEditingId: null,
				currentlyEditingChanges: {},
			};

			const newState = reducer( state, deleteShippingZone( siteId, 1 ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.deep.equal( [ { id: 2 } ] );
			expect( newState.deletes ).to.deep.equal( [ { id: 1 } ] );
		} );

		test( 'should remove the zone from the "creates" list - should NOT mark it to delete', () => {
			const state = {
				creates: [ { id: { index: 0 }, name: 'Previous Name' }, { id: { index: 1 } } ],
				updates: [],
				deletes: [],
				currentlyEditingId: null,
				currentlyEditingChanges: {},
			};

			const newState = reducer( state, deleteShippingZone( siteId, { index: 0 } ) );
			expect( newState.creates ).to.deep.equal( [ { id: { index: 1 } } ] );
			expect( newState.updates ).to.be.empty;
			expect( newState.deletes ).to.be.empty;
		} );

		test( 'should discard the currently edited zone ID', () => {
			const state = {
				creates: [],
				updates: [ { id: 1, name: 'Previous Name' } ],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: {},
			};

			const newState = reducer( state, deleteShippingZone( siteId, 1 ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.be.empty;
			expect( newState.deletes ).to.deep.equal( [ { id: 1 } ] );
			expect( newState.currentlyEditingId ).to.be.null;
		} );
	} );
} );
