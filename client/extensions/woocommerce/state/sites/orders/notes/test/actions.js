/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { fetchNotes, fetchNotesSuccess, fetchNotesFailure, createNote } from '../actions';
import useNock from 'test/helpers/use-nock';
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
		test( 'should return a success action with the customer list when request completes', () => {
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

	describe( '#createNote()', () => {
		const siteId = '123';
		const orderId = 45;
		const note = {
			note: 'A note to the customer.',
			customer_note: true,
		};

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( `/rest/v1.1/jetpack-blogs/${ siteId }/rest-api/` )
				.query( { path: '/wc/v3/orders/45/notes&_method=post', body: note, json: true } )
				.reply( 201, { data: note } )
				.post( '/rest/v1.1/jetpack-blogs/234/rest-api/' )
				.query( { path: '/wc/v3/orders/0/notes&_method=post', body: note, json: true } )
				.reply( 400, {
					data: {
						error: 'rest_missing_callback_param',
						message: 'Missing parameter(s): note',
					},
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			createNote( siteId, orderId, note )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_ORDER_NOTE_CREATE,
				siteId,
				orderId,
			} );
		} );

		test( 'should dispatch a success action with the notes list when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = createNote( siteId, orderId, note )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_ORDER_NOTE_CREATE_SUCCESS,
					siteId,
					orderId,
					note,
				} );
			} );
		} );

		test( 'should dispatch a failure action with the error when a the request fails', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = createNote( 234, 0, {} )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWithMatch( {
					type: WOOCOMMERCE_ORDER_NOTE_CREATE_FAILURE,
					siteId: 234,
					orderId: 0,
				} );
			} );
		} );
	} );
} );
