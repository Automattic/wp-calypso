/** @format */
/**
 * External dependencies
 */
import { assert, expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { requestSite } from '../actions';
import {
	READER_SITE_REQUEST,
	READER_SITE_REQUEST_SUCCESS,
	READER_SITE_REQUEST_FAILURE,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';
import { fields } from '../fields';

describe( 'actions', () => {
	describe( 'a valid fetch', () => {
		const spy = sinon.spy();
		let request;

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/read/sites/1' )
				.query( {
					fields: fields.join( ',' ),
					options: [ 'is_mapped_domain', 'unmapped_url', 'is_redirect' ].join( ',' ),
				} )
				.reply( 200, {
					ID: 1,
					name: 'My test site',
				} );
			request = requestSite( 1 )( spy );
		} );

		test( 'should dispatch request sync', () => {
			expect( spy ).to.have.been.calledWith( {
				type: READER_SITE_REQUEST,
				payload: {
					ID: 1,
				},
			} );
		} );

		test( 'should dispatch success, eventually', () => {
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
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/read/sites/1' )
				.reply( 404 );
			request = requestSite( 1 )( spy );
		} );

		test( 'should dispatch request sync', () => {
			expect( spy ).to.have.been.calledWith( {
				type: READER_SITE_REQUEST,
				payload: {
					ID: 1,
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
