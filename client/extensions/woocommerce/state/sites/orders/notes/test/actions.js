/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	createNote,
	createNoteSuccess,
	createNoteFailure,
	fetchNotes,
	fetchNotesSuccess,
	fetchNotesFailure,
} from '../actions';
import {
	WOOCOMMERCE_ORDER_NOTE_CREATE,
	WOOCOMMERCE_ORDER_NOTE_CREATE_FAILURE,
	WOOCOMMERCE_ORDER_NOTE_CREATE_SUCCESS,
	WOOCOMMERCE_ORDER_NOTES_REQUEST,
	WOOCOMMERCE_ORDER_NOTES_REQUEST_FAILURE,
	WOOCOMMERCE_ORDER_NOTES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#fetchNotes()', () => {
		test( 'should return an action', () => {
			const onSuccess = { type: WOOCOMMERCE_ORDER_NOTES_REQUEST_SUCCESS };
			const onFailure = { type: WOOCOMMERCE_ORDER_NOTES_REQUEST_FAILURE };
			const action = fetchNotes( 123, 38, onSuccess, onFailure );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_ORDER_NOTES_REQUEST,
				siteId: 123,
				orderId: 38,
				onSuccess,
				onFailure,
			} );
		} );
	} );

	describe( '#fetchNotesSuccess', () => {
		test( 'should return a success action with the notes when request completes', () => {
			const notes = [
				{
					id: 16,
					note: 'Order details manually sent to customer.',
				},
			];
			const action = fetchNotesSuccess( 123, 38, notes );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_ORDER_NOTES_REQUEST_SUCCESS,
				siteId: 123,
				orderId: 38,
				notes,
			} );
		} );
	} );

	describe( '#fetchNotesFailure', () => {
		test( 'should return a failure action with the error when a the request fails', () => {
			const error = new Error( 'Unable to send invoice', {
				code: 'woocommerce_api_cannot_create_order_note',
				message: 'Cannot create order note, please try again.',
			} );
			const action = fetchNotesFailure( 234, 21, error );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_ORDER_NOTES_REQUEST_FAILURE,
				siteId: 234,
				orderId: 21,
				error,
			} );
		} );
	} );

	describe( 'create', () => {
		const note = {
			note: 'Testing customer note',
			customer_note: true,
		};

		describe( '#createNote()', () => {
			test( 'should return an action', () => {
				const onSuccess = { type: WOOCOMMERCE_ORDER_NOTE_CREATE_SUCCESS };
				const onFailure = { type: WOOCOMMERCE_ORDER_NOTE_CREATE_FAILURE };
				const action = createNote( 123, 38, note, onSuccess, onFailure );
				expect( action ).to.eql( {
					type: WOOCOMMERCE_ORDER_NOTE_CREATE,
					siteId: 123,
					orderId: 38,
					note,
					onSuccess,
					onFailure,
				} );
			} );
		} );

		describe( '#createNoteSuccess', () => {
			test( 'should return a success action with the note when request completes', () => {
				const action = createNoteSuccess( 123, 38, note );
				expect( action ).to.eql( {
					type: WOOCOMMERCE_ORDER_NOTE_CREATE_SUCCESS,
					siteId: 123,
					orderId: 38,
					note,
				} );
			} );
		} );

		describe( '#createNoteFailure', () => {
			test( 'should return a failure action with the error when a the request fails', () => {
				const error = new Error( 'Unable to create note', {
					error: 'bad_json',
					message: 'Could not parse JSON request body.',
				} );
				const action = createNoteFailure( 234, 21, error );
				expect( action ).to.eql( {
					type: WOOCOMMERCE_ORDER_NOTE_CREATE_FAILURE,
					siteId: 234,
					orderId: 21,
					error,
				} );
			} );
		} );
	} );
} );
