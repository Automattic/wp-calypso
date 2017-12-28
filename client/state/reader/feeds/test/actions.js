/** @format */
/**
 * External dependencies
 */
import { assert, expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { requestFeed } from '../actions';
import {
	READER_FEED_REQUEST,
	READER_FEED_REQUEST_SUCCESS,
	READER_FEED_REQUEST_FAILURE,
} from 'client/state/action-types';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	describe( 'a valid fetch', () => {
		const spy = sinon.spy();
		let request;

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/read/feed/1' )
				.reply( 200, {
					feed_ID: 1,
					name: 'My test feed',
				} );
			request = requestFeed( 1 )( spy );
		} );

		test( 'should dispatch request sync', () => {
			expect( spy ).to.have.been.calledWith( {
				type: READER_FEED_REQUEST,
				payload: {
					feed_ID: 1,
				},
			} );
		} );

		test( 'should dispatch success, eventually', () => {
			return request.then(
				() => {
					expect( spy ).to.have.been.calledWith( {
						type: READER_FEED_REQUEST_SUCCESS,
						payload: {
							feed_ID: 1,
							name: 'My test feed',
						},
					} );
				},
				err => {
					assert.fail( 'Errback should not be invoked!', err );
					return err;
				}
			);
		} );
	} );

	describe( 'a request for a feed that does not exist', () => {
		const spy = sinon.spy();
		let request;

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/read/feed/1' )
				.reply( 404 );
			request = requestFeed( 1 )( spy );
		} );

		test( 'should dispatch request sync', () => {
			expect( spy ).to.have.been.calledWith( {
				type: READER_FEED_REQUEST,
				payload: {
					feed_ID: 1,
				},
			} );
		} );

		test( 'should dispatch error, eventually', () => {
			return request.then(
				() => {
					assert.fail( 'callback should not be invoked!', arguments );
					throw new Error( 'errback should have been invoked' );
				},
				() => {
					expect( spy ).to.have.been.calledWithMatch( {
						type: READER_FEED_REQUEST_FAILURE,
						payload: {
							feed_ID: 1,
						},
						error: sinon.match.instanceOf( Error ),
					} );
				}
			);
		} );
	} );
} );
