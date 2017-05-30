/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer, { initialState } from '../reducer';
import {
	addNewPaymentMethod,
	openPaymentMethodForEdit,
	closeEditingPaymentMethod,
	cancelEditingPaymentMethod,
	changePaymentMethodName,
	deletePaymentMethod,
} from '../actions';

const siteId = 123;

describe( 'reducer', () => {
	describe( 'addNewPaymentMethod', () => {
		it( 'should create a new method and mark it as "editing", without commiting it to the "creates" bucket', () => {
			const newState = reducer( initialState, addNewPaymentMethod( siteId ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.currentlyEditingId ).to.deep.equal( { index: 0 } );
			expect( newState.currentlyEditingChanges ).to.be.empty;
		} );
	} );

	describe( 'openPaymentMethodForEdit', () => {
		it( 'when the method has a server-side ID', () => {
			const newState = reducer( initialState, openPaymentMethodForEdit( siteId, 1 ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.be.empty;
			expect( newState.currentlyEditingId ).to.equal( 1 );
			expect( newState.currentlyEditingChanges ).to.be.empty;
		} );

		it( 'when the method has a provisional ID', () => {
			const newState = reducer( initialState, openPaymentMethodForEdit( siteId, { index: 0 } ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.be.empty;
			expect( newState.currentlyEditingId ).to.deep.equal( { index: 0 } );
			expect( newState.currentlyEditingChanges ).to.be.empty;
		} );
	} );

	describe( 'closeEditingPaymentMethod', () => {
		it( 'should do nothing if there are no changes to save', () => {
			const state = {
				creates: [],
				updates: [],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: {},
			};

			const newState = reducer( state, closeEditingPaymentMethod( siteId ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.be.empty;
			expect( newState.currentlyEditingId ).to.be.null;
		} );

		it( 'should commit changes to the "updates" bucket if the method has a server-side ID', () => {
			const state = {
				creates: [],
				updates: [ { id: 42 } ],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: { name: 'Hi There' },
			};

			const newState = reducer( state, closeEditingPaymentMethod( siteId ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.deep.equal( [
				{ id: 42 },
				{ id: 1, name: 'Hi There' },
			] );
			expect( newState.currentlyEditingId ).to.be.null;
		} );

		it( 'should overwrite data on the "updates" bucket if the method has a server-side ID', () => {
			const state = {
				creates: [],
				updates: [ { id: 1, name: 'OldName' } ],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: { name: 'Hi There' },
			};

			const newState = reducer( state, closeEditingPaymentMethod( siteId ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.deep.equal( [
				{ id: 1, name: 'Hi There' },
			] );
			expect( newState.currentlyEditingId ).to.be.null;
		} );

		it( 'should commit changes to the "creates" bucket if the method has a provisional ID', () => {
			const state = {
				creates: [ { id: { index: 0 } } ],
				updates: [],
				deletes: [],
				currentlyEditingId: { index: 1 },
				currentlyEditingChanges: { name: 'Hi There' },
			};

			const newState = reducer( state, closeEditingPaymentMethod( siteId ) );
			expect( newState.updates ).to.be.empty;
			expect( newState.creates ).to.deep.equal( [
				{ id: { index: 0 } },
				{ id: { index: 1 }, name: 'Hi There' },
			] );
			expect( newState.currentlyEditingId ).to.be.null;
		} );

		it( 'should overwrite data on the "creates" bucket if the method has a provisional ID', () => {
			const state = {
				creates: [ { id: { index: 0 }, name: 'OldName' } ],
				updates: [],
				deletes: [],
				currentlyEditingId: { index: 0 },
				currentlyEditingChanges: { name: 'Hi There' },
			};

			const newState = reducer( state, closeEditingPaymentMethod( siteId ) );
			expect( newState.updates ).to.be.empty;
			expect( newState.creates ).to.deep.equal( [
				{ id: { index: 0 }, name: 'Hi There' },
			] );
			expect( newState.currentlyEditingId ).to.be.null;
		} );
	} );

	describe( 'cancelEditingPaymentMethod', () => {
		it( 'should not commit changes for an "update" payment method', () => {
			const state = {
				creates: [],
				updates: [ { id: 1, name: 'Good Name' } ],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: { name: 'Trololololol' },
			};

			const newState = reducer( state, cancelEditingPaymentMethod( siteId ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.deep.equal( [ { id: 1, name: 'Good Name' } ] );
			expect( newState.currentlyEditingId ).to.be.null;
		} );

		it( 'should not commit changes for a "create" payment method', () => {
			const state = {
				creates: [ { id: { index: 0 }, name: 'Good Name' } ],
				updates: [],
				deletes: [],
				currentlyEditingId: { index: 0 },
				currentlyEditingChanges: { name: 'Trololololol' },
			};

			const newState = reducer( state, cancelEditingPaymentMethod( siteId ) );
			expect( newState.updates ).to.be.empty;
			expect( newState.creates ).to.deep.equal( [ { id: { index: 0 }, name: 'Good Name' } ] );
			expect( newState.currentlyEditingId ).to.be.null;
		} );
	} );

	describe( 'changePaymentMethodName', () => {
		it( 'should not do anything if there is no method being edited', () => {
			const newState = reducer( initialState, changePaymentMethodName( siteId, 'something' ) );
			expect( newState ).to.deep.equal( initialState );
		} );

		it( 'should change the payment method name without committing it', () => {
			const state = {
				creates: [],
				updates: [ { id: 1, name: 'Previous Name' } ],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: { name: 'blah blah blah' },
			};

			const newState = reducer( state, changePaymentMethodName( siteId, 'New Name' ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.deep.equal( [ { id: 1, name: 'Previous Name' } ] );
			expect( newState.currentlyEditingChanges ).to.deep.equal( { name: 'New Name' } );
			expect( newState.currentlyEditingId ).to.equal( 1 );
		} );
	} );

	describe( 'deletePaymentMethod', () => {
		it( 'should mark the method as to be deleted', () => {
			const newState = reducer( initialState, deletePaymentMethod( siteId, 42 ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.be.empty;
			expect( newState.deletes ).to.deep.equal( [ { id: 42 } ] );
		} );

		it( 'should remove the method from the "updates" list', () => {
			const state = {
				creates: [],
				updates: [ { id: 1, name: 'Previous Name' }, { id: 2 } ],
				deletes: [],
				currentlyEditingId: null,
				currentlyEditingChanges: {},
			};

			const newState = reducer( state, deletePaymentMethod( siteId, 1 ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.deep.equal( [ { id: 2 } ] );
			expect( newState.deletes ).to.deep.equal( [ { id: 1 } ] );
		} );

		it( 'should remove the method from the "creates" list - should NOT mark it to delete', () => {
			const state = {
				creates: [ { id: { index: 0 }, name: 'Previous Name' }, { id: { index: 1 } } ],
				updates: [],
				deletes: [],
				currentlyEditingId: null,
				currentlyEditingChanges: {},
			};

			const newState = reducer( state, deletePaymentMethod( siteId, { index: 0 } ) );
			expect( newState.creates ).to.deep.equal( [ { id: { index: 1 } } ] );
			expect( newState.updates ).to.be.empty;
			expect( newState.deletes ).to.be.empty;
		} );

		it( 'should discard the currently edited method ID', () => {
			const state = {
				creates: [],
				updates: [ { id: 1, name: 'Previous Name' } ],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: {},
			};

			const newState = reducer( state, deletePaymentMethod( siteId, 1 ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.be.empty;
			expect( newState.deletes ).to.deep.equal( [ { id: 1 } ] );
			expect( newState.currentlyEditingId ).to.be.null;
		} );
	} );
} );
