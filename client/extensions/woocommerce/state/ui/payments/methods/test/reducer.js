/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer, { initialState } from '../reducer';
import {
	openPaymentMethodForEdit,
	closeEditingPaymentMethod,
	cancelEditingPaymentMethod,
	changePaymentMethodField,
} from '../actions';

const siteId = 123;

describe( 'reducer', () => {
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

	describe( 'changePaymentMethodField', () => {
		it( 'should not do anything if there is no method being edited', () => {
			const newState = reducer( initialState, changePaymentMethodField( siteId, 'foo', 'something' ) );
			expect( newState ).to.deep.equal( initialState );
		} );

		it( 'should change the payment method name without committing it', () => {
			const state = {
				creates: [],
				updates: [ { id: 1, name: 'Previous Value' } ],
				deletes: [],
				currentlyEditingId: 1,
				currentlyEditingChanges: { name: 'blah blah blah' },
			};

			const newState = reducer( state, changePaymentMethodField( siteId, 'name', 'New Value' ) );
			expect( newState.creates ).to.be.empty;
			expect( newState.updates ).to.deep.equal( [ { id: 1, name: 'Previous Value' } ] );
			expect( newState.currentlyEditingChanges ).to.deep.equal( { name: { value: 'New Value' } } );
			expect( newState.currentlyEditingId ).to.equal( 1 );
		} );
	} );
} );
