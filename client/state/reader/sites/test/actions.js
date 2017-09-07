/** @format */
/**
 * External dependencies
 */
import sinon from 'sinon';
import { assert, expect } from 'chai';

/**
 * Internal deps
 */
import { requestSite } from '../actions';
import {
	READER_SITE_REQUEST,
	READER_SITE_REQUEST_SUCCESS,
	READER_SITE_REQUEST_FAILURE,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	describe( 'a valid fetch', () => {
		const spy = sinon.spy();
		let request;

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/read/sites/1' )
				.query( {
					fields: [
						'ID',
						'name',
						'title',
						'URL',
						'icon',
						'is_jetpack',
						'description',
						'is_private',
						'feed_ID',
						'feed_URL',
						'capabilities',
						'prefer_feed',
						'options', // have to include this to get options at all
					].join( ',' ),
					options: [ 'is_mapped_domain', 'unmapped_url', 'is_redirect' ].join( ',' ),
				} )
				.reply( 200, {
					ID: 1,
					name: 'My test site',
				} );
			request = requestSite( 1 )( spy );
		} );

		it( 'should dispatch request sync', () => {
			expect( spy ).to.have.been.calledWith( {
				type: READER_SITE_REQUEST,
				payload: {
					ID: 1,
				},
			} );
		} );

		it( 'should dispatch success, eventually', function() {
			return request.then(
				() => {
					expect( spy ).to.have.been.calledWith( {
						type: READER_SITE_REQUEST_SUCCESS,
						payload: {
							ID: 1,
							name: 'My test site',
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

	describe( 'a request for a site that does not exist', () => {
		const spy = sinon.spy();
		let request;

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' ).get( '/rest/v1.1/read/sites/1' ).reply( 404 );
			request = requestSite( 1 )( spy );
		} );

		it( 'should dispatch request sync', () => {
			expect( spy ).to.have.been.calledWith( {
				type: READER_SITE_REQUEST,
				payload: {
					ID: 1,
				},
			} );
		} );

		it( 'should dispatch error, eventually', function() {
			return request.then(
				() => {
					assert.fail( 'callback should not be invoked!', arguments );
					throw new Error( 'errback should have been invoked' );
				},
				() => {
					expect( spy ).to.have.been.calledWithMatch( {
						type: READER_SITE_REQUEST_FAILURE,
						payload: {
							ID: 1,
						},
						error: sinon.match.instanceOf( Error ),
					} );
				}
			);
		} );
	} );
} );
