/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import { isLoading, isSaving, items, orders } from '../reducer';
import note from './fixtures/note';
import notes from './fixtures/notes';
import {
	WOOCOMMERCE_ORDER_NOTE_CREATE,
	WOOCOMMERCE_ORDER_NOTE_CREATE_FAILURE,
	WOOCOMMERCE_ORDER_NOTE_CREATE_SUCCESS,
	WOOCOMMERCE_ORDER_NOTES_REQUEST,
	WOOCOMMERCE_ORDER_NOTES_REQUEST_FAILURE,
	WOOCOMMERCE_ORDER_NOTES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	describe( 'isLoading', () => {
		test( 'should have no change by default', () => {
			const newState = isLoading( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		test( 'should store the currently loading order notes', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_NOTES_REQUEST,
				siteId: 123,
				orderId: 45,
			};
			const newState = isLoading( undefined, action );
			expect( newState ).to.eql( { 45: true } );
		} );

		test( 'should should show that request has loaded on success', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_NOTES_REQUEST_SUCCESS,
				siteId: 123,
				orderId: 45,
				notes,
			};
			const newState = isLoading( { 45: true }, action );
			expect( newState ).to.eql( { 45: false } );
		} );

		test( 'should should show that request has loaded on failure', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_NOTES_REQUEST_FAILURE,
				siteId: 123,
				orderId: 45,
				error: {},
			};
			const newState = isLoading( { 45: true }, action );
			expect( newState ).to.eql( { 45: false } );
		} );
	} );

	describe( 'isSaving', () => {
		test( 'should have no change by default', () => {
			const newState = isSaving( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		test( 'should flag that a note is currently being saved for an order', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_NOTE_CREATE,
				siteId: 123,
				orderId: 45,
			};
			const newState = isSaving( undefined, action );
			expect( newState ).to.eql( { 45: true } );
		} );

		test( 'should show that the order has finished saving on a success', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_NOTE_CREATE_SUCCESS,
				siteId: 123,
				orderId: 45,
				note,
			};
			const originalState = deepFreeze( { 45: true } );
			const newState = isSaving( originalState, action );
			expect( newState ).to.eql( { 45: false } );
		} );

		test( 'should show that the order has finished saving on a failure', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_NOTE_CREATE_FAILURE,
				siteId: 123,
				orderId: 45,
				error: {},
			};
			const originalState = deepFreeze( { 45: true } );
			const newState = isSaving( originalState, action );
			expect( newState ).to.eql( { 45: false } );
		} );
	} );

	describe( 'items', () => {
		test( 'should have no change by default', () => {
			const newState = items( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		test( 'should store the order notes in state', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_NOTES_REQUEST_SUCCESS,
				siteId: 123,
				orderId: 45,
				notes,
			};
			const newState = items( undefined, action );
			const notesById = keyBy( notes, 'id' );
			expect( newState ).to.eql( notesById );
		} );

		test( 'should add more order notes onto the existing note list', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_NOTES_REQUEST_SUCCESS,
				siteId: 123,
				orderId: 50,
				notes: [ note ],
			};
			const originalState = deepFreeze( keyBy( notes, 'id' ) );
			const newState = items( originalState, action );
			expect( newState ).to.eql( { ...originalState, 3: note } );
		} );

		test( 'should add the created note to the note list', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_NOTE_CREATE_SUCCESS,
				siteId: 123,
				orderId: 50,
				note,
			};
			const originalState = deepFreeze( keyBy( notes, 'id' ) );
			const newState = items( originalState, action );
			expect( newState ).to.eql( { ...originalState, 3: note } );
		} );

		test( 'should do nothing on a failure', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_NOTES_REQUEST_FAILURE,
				siteId: 123,
				orderId: 45,
				error: {},
			};
			const originalState = deepFreeze( keyBy( notes, 'id' ) );
			const newState = items( originalState, action );
			expect( newState ).to.eql( originalState );
		} );
	} );

	describe( 'orders', () => {
		test( 'should have no change by default', () => {
			const newState = orders( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		test( 'should store the note IDs for the requested order', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_NOTES_REQUEST_SUCCESS,
				siteId: 123,
				orderId: 45,
				notes,
			};
			const newState = orders( undefined, action );
			expect( newState ).to.eql( { 45: [ 1, 2 ] } );
		} );

		test( "should add a second order's notes as a second list", () => {
			const action = {
				type: WOOCOMMERCE_ORDER_NOTES_REQUEST_SUCCESS,
				siteId: 123,
				orderId: 50,
				notes: [ note ],
			};
			const originalState = deepFreeze( { 45: [ 1, 2 ] } );
			const newState = orders( originalState, action );
			expect( newState ).to.eql( { ...originalState, 50: [ 3 ] } );
		} );

		test( "should add the created note to order's note list", () => {
			const action = {
				type: WOOCOMMERCE_ORDER_NOTE_CREATE_SUCCESS,
				siteId: 123,
				orderId: 45,
				note,
			};
			const originalState = deepFreeze( { 45: [ 1, 2 ] } );
			const newState = orders( originalState, action );
			expect( newState ).to.eql( { 45: [ 1, 2, 3 ] } );
		} );

		test( 'should do nothing on a failure', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_NOTES_REQUEST_FAILURE,
				siteId: 123,
				orderId: 50,
				error: {},
			};
			const originalState = deepFreeze( { 45: [ 1, 2 ] } );
			const newState = orders( originalState, action );
			expect( newState ).to.eql( originalState );
		} );
	} );
} );
