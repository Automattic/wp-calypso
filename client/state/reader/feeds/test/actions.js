/**
 * External dependencies
 */
import { useNock } from 'test/helpers/use-nock';
import sinon from 'sinon';
import { assert, expect } from 'chai';


/**
 * Internal deps
 */
import { requestFeed } from '../actions';
import {
	READER_FEED_REQUEST,
	READER_FEED_REQUEST_SUCCESS,
	READER_FEED_REQUEST_FAILURE
} from 'state/action-types';

describe( 'actions', () => {
	describe( 'a valid fetch', () => {
		const spy = sinon.spy();
		let request;

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/read/feed/1?meta=site' )
				.reply( 200, {
					feed_ID: 1,
					name: 'My test feed'
				} );
			request = requestFeed( 1 )( spy );
		} );

		it( 'should dispatch request sync', () => {
			expect( spy ).to.have.been.calledWith( {
				type: READER_FEED_REQUEST,
				payload: {
					feed_ID: 1
				}
			} );
		} );

		it( 'should dispatch success, eventually', function() {
			return request.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: READER_FEED_REQUEST_SUCCESS,
					payload: {
						feed_ID: 1,
						name: 'My test feed'
					}
				} );
			}, ( err ) => {
				assert.fail( 'Errback should not be invoked!', err );
				return err;
			} );
		} );
	} );

	describe( 'a request for a feed that does not exist', () => {
		const spy = sinon.spy();
		let request;

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/read/feed/1?meta=site' )
				.reply( 404 );
			request = requestFeed( 1 )( spy );
		} );

		it( 'should dispatch request sync', () => {
			expect( spy ).to.have.been.calledWith( {
				type: READER_FEED_REQUEST,
				payload: {
					feed_ID: 1
				}
			} );
		} );

		it( 'should dispatch error, eventually', function() {
			return request.then( () => {
				assert.fail( 'callback should not be invoked!', arguments );
				throw new Error( 'errback should have been invoked' );
			}, () => {
				expect( spy ).to.have.been.calledWithMatch( {
					type: READER_FEED_REQUEST_FAILURE,
					payload: {
						feed_ID: 1
					},
					error: sinon.match.instanceOf( Error )
				} );
			} );
		} );
	} );
} );
