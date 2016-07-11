// External dependencies
import { expect } from 'chai';
import { nock, useNock } from 'test/helpers/use-nock';
import sinon from 'sinon';

// Internal dependencies
import {
	deleteStoredCard,
	fetchStoredCards
} from '../actions';
import { STORED_CARDS, STORED_CARDS_FROM_API } from './fixture';
import {
	STORED_CARDS_DELETE,
	STORED_CARDS_DELETE_COMPLETED,
	STORED_CARDS_DELETE_FAILED,
	STORED_CARDS_FETCH,
	STORED_CARDS_FETCH_COMPLETED,
	STORED_CARDS_FETCH_FAILED
} from 'state/action-types';

describe( 'actions', () => {
	useNock();

	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	const error = {
		code: 'unauthorized',
		message: 'you are unauthorized'
	};

	describe( '#fetchStoredCards', () => {
		describe( 'success', () => {
			before( () => {
				nock( 'https://public-api.wordpress.com:443' )
					.get( '/rest/v1.1/me/stored-cards' )
					.reply( 200, STORED_CARDS_FROM_API );
			} );

			it( 'should dispatch fetch/complete actions', () => {
				const promise = fetchStoredCards()( spy );

				expect( spy ).to.have.been.calledWith( {
					type: STORED_CARDS_FETCH
				} );

				return promise.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: STORED_CARDS_FETCH_COMPLETED,
						list: STORED_CARDS
					} );
				} );
			} );
		} );

		describe( 'fail', () => {
			before( () => {
				nock( 'https://public-api.wordpress.com:443' )
					.get( '/rest/v1.1/me/stored-cards' )
					.reply( 403, error );
			} );

			it( 'should dispatch fetch/fail actions', () => {
				const promise = fetchStoredCards()( spy );

				expect( spy ).to.have.been.calledWith( {
					type: STORED_CARDS_FETCH
				} );

				return promise.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: STORED_CARDS_FETCH_FAILED,
						error: error.message
					} );
				} );
			} );
		} );
	} );

	describe( '#deleteStoredCard', () => {
		const card = STORED_CARDS[ 0 ];

		describe( 'success', () => {
			before( () => {
				nock( 'https://public-api.wordpress.com:443' )
					.post( `/rest/v1.1/me/stored-cards/${ card.id }/delete` )
					.reply( 200, { success: true } );
			} );

			it( 'should dispatch fetch/complete actions', () => {
				const promise = deleteStoredCard( card )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: STORED_CARDS_DELETE
				} );

				return promise.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: STORED_CARDS_DELETE_COMPLETED,
						card
					} );
				} );
			} );
		} );

		describe( 'fail', () => {
			before( () => {
				nock( 'https://public-api.wordpress.com:443' )
					.post( `/rest/v1.1/me/stored-cards/${ card.id }/delete` )
					.reply( 403, error );
			} );

			it( 'should dispatch fetch/fail actions', () => {
				const promise = deleteStoredCard( card )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: STORED_CARDS_DELETE
				} );

				return promise.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: STORED_CARDS_DELETE_FAILED,
						error: error.message
					} );
				} );
			} );
		} );
	} );
} );
