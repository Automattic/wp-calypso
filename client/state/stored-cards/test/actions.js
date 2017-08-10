/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import { addStoredCard, deleteStoredCard, fetchStoredCards } from '../actions';
import {
	STORED_CARDS_ADD_COMPLETED,
	STORED_CARDS_DELETE,
	STORED_CARDS_DELETE_COMPLETED,
	STORED_CARDS_DELETE_FAILED,
	STORED_CARDS_FETCH,
	STORED_CARDS_FETCH_COMPLETED,
	STORED_CARDS_FETCH_FAILED,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';
import wp from 'lib/wp';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	const error = {
		code: 'unauthorized',
		message: 'you are unauthorized',
	};

	describe( '#addStoredCard', () => {
		const paygateToken = 'pg_1234',
			item = { stored_details_id: 123 };
		let sandbox;

		useSandbox( newSandbox => ( sandbox = newSandbox ) );

		it( 'should dispatch complete action when API returns card item', () => {
			sandbox.stub( wp, 'undocumented', () => ( {
				me: () => ( {
					storedCardAdd: ( token, callback ) => callback( null, item ),
				} ),
			} ) );

			const result = addStoredCard( paygateToken )( spy );

			return result.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: STORED_CARDS_ADD_COMPLETED,
					item,
				} );
			} );
		} );
	} );

	describe( '#fetchStoredCards', () => {
		const cards = [ { stored_details_id: 1 }, { stored_details_id: 2 } ];

		describe( 'success', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.get( '/rest/v1.1/me/stored-cards' )
					.reply( 200, cards );
			} );

			it( 'should dispatch fetch/complete actions', () => {
				const promise = fetchStoredCards()( spy );

				expect( spy ).to.have.been.calledWith( {
					type: STORED_CARDS_FETCH,
				} );

				return promise.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: STORED_CARDS_FETCH_COMPLETED,
						list: cards,
					} );
				} );
			} );
		} );

		describe( 'fail', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.get( '/rest/v1.1/me/stored-cards' )
					.reply( 403, error );
			} );

			it( 'should dispatch fetch/fail actions', () => {
				const promise = fetchStoredCards()( spy );

				expect( spy ).to.have.been.calledWith( {
					type: STORED_CARDS_FETCH,
				} );

				return promise.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: STORED_CARDS_FETCH_FAILED,
						error: error.message,
					} );
				} );
			} );
		} );
	} );

	describe( '#deleteStoredCard', () => {
		const card = {
			stored_details_id: 1337,
		};

		describe( 'success', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.post( `/rest/v1.1/me/stored-cards/${ card.stored_details_id }/delete` )
					.reply( 200, { success: true } );
			} );

			it( 'should dispatch fetch/complete actions', () => {
				const promise = deleteStoredCard( card )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: STORED_CARDS_DELETE,
				} );

				return promise.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: STORED_CARDS_DELETE_COMPLETED,
						card,
					} );
				} );
			} );
		} );

		describe( 'fail', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.post( `/rest/v1.1/me/stored-cards/${ card.stored_details_id }/delete` )
					.reply( 403, error );
			} );

			it( 'should dispatch fetch/fail actions', () => {
				const promise = deleteStoredCard( card )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: STORED_CARDS_DELETE,
				} );

				return promise.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: STORED_CARDS_DELETE_FAILED,
						error: error.message,
					} );
				} );
			} );
		} );
	} );
} );
