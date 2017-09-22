/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import request from '../http-request';
import { WPCOM_HTTP_REQUEST } from 'state/action-types';

const siteId = '123';
const originalAction = {
	type: 'WOOCOMMERCE_TEST_ACTION',
	siteId,
};

describe( 'request', () => {
	describe( '#get', () => {
		it( 'should return a request action', () => {
			const action = request( siteId, originalAction ).get( 'placeholder_endpoint' );
			expect( action ).to.include( {
				type: WPCOM_HTTP_REQUEST,
				method: 'GET',
				path: `/jetpack-blogs/${ siteId }/rest-api/`,
			} );
			expect( action.query ).to.exist;
			expect( action.query ).to.include( {
				path: '/wc/v3/placeholder_endpoint&_method=GET',
			} );
		} );
	} );
	describe( '#getWithHeaders', () => {
		it( 'should return a modified path', () => {
			const action = request( siteId, originalAction ).getWithHeaders( 'placeholder_endpoint' );

			expect( action.query ).to.exist;
			expect( action.query.path ).to.exist;
			expect( action.query.path.indexOf( '&_envelope' ) ).to.not.equal( -1 );
		} );
	} );
	describe( '#post', () => {
		const body = { name: 'placeholder post request', placeholder: true };

		it( 'should return a request action', () => {
			const action = request( siteId, originalAction ).post( 'placeholder_endpoint', body );
			expect( action ).to.include( {
				type: WPCOM_HTTP_REQUEST,
				method: 'POST',
				path: `/jetpack-blogs/${ siteId }/rest-api/`,
			} );
			expect( action.body ).to.eql( JSON.stringify( body ) );
			expect( action.query ).to.exist;
			expect( action.query ).to.include( {
				path: '/wc/v3/placeholder_endpoint&_method=POST',
			} );
		} );
	} );
	describe( '#put', () => {
		const body = { name: 'placeholder post request', placeholder: true };

		it( 'should return a request action', () => {
			const action = request( siteId, originalAction ).put( 'placeholder_endpoint', body );
			expect( action ).to.include( {
				type: WPCOM_HTTP_REQUEST,
				method: 'POST', // Note that this stays POST
				path: `/jetpack-blogs/${ siteId }/rest-api/`,
			} );
			expect( action.body ).to.eql( JSON.stringify( body ) );
			expect( action.query ).to.exist;
			expect( action.query ).to.include( {
				path: '/wc/v3/placeholder_endpoint&_method=PUT',
			} );
		} );
	} );

	describe( '#del', () => {
		it( 'should return a request action', () => {
			const action = request( siteId, originalAction ).del( 'placeholder_endpoint' );
			expect( action ).to.include( {
				type: WPCOM_HTTP_REQUEST,
				method: 'POST', // Note that this stays POST
				path: `/jetpack-blogs/${ siteId }/rest-api/`,
			} );
			expect( action.body ).to.be.null,
			expect( action.query ).to.exist;
			expect( action.query ).to.include( {
				path: '/wc/v3/placeholder_endpoint&_method=DELETE',
			} );
		} );
	} );
} );
