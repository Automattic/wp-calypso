/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import request from 'woocommerce/state/sites/request';
import useNock from 'test/helpers/use-nock';

describe( 'request', () => {
	describe( '#get', () => {
		const siteId = '123';
		const getResponse = { name: 'placeholder get response', placeholder: true };

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/placeholder_endpoint&_via_calypso&_method=get', json: true } )
				.reply( 200, { data: getResponse } );
		} );

		test( 'should fetch data via promise', () => {
			return request( siteId )
				.get( 'placeholder_endpoint' )
				.then( data => {
					expect( data ).to.eql( getResponse );
				} );
		} );

		test( 'should catch error via promise', () => {
			return request( siteId )
				.get( 'bad_placeholder_endpoint' )
				.catch( error => {
					expect( error.statusCode ).to.equal( 404 );
				} );
		} );
	} );

	describe( '#post', () => {
		const siteId = '123';
		const body = { name: 'placeholder post request', placeholder: true };
		const postResponse = { name: 'placeholder post response', placeholder: true };

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/placeholder_endpoint&_via_calypso&_method=post', json: true } )
				.reply( 201, { data: postResponse } );
		} );

		test( 'should post data', () => {
			return request( siteId )
				.post( 'placeholder_endpoint', body )
				.then( data => {
					expect( data ).to.eql( postResponse );
				} );
		} );

		test( 'should catch error via promise', () => {
			return request( siteId )
				.post( 'bad_placeholder_endpoint' )
				.catch( error => {
					expect( error.statusCode ).to.equal( 404 );
				} );
		} );
	} );

	describe( '#put', () => {
		const siteId = '123';
		const body = { name: 'placeholder put request', placeholder: true };
		const putResponse = { name: 'placeholder put response', placeholder: true };

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/placeholder_endpoint&_via_calypso&_method=put', json: true } )
				.reply( 200, { data: putResponse } );
		} );

		test( 'should put data', () => {
			return request( siteId )
				.put( 'placeholder_endpoint', body )
				.then( data => {
					expect( data ).to.eql( putResponse );
				} );
		} );

		test( 'should catch error via promise', () => {
			return request( siteId )
				.put( 'bad_placeholder_endpoint' )
				.catch( error => {
					expect( error.statusCode ).to.equal( 404 );
				} );
		} );
	} );

	describe( '#del', () => {
		const siteId = '123';
		const deleteResponse = { name: 'placeholder delete response', placeholder: true };

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/placeholder_endpoint&_via_calypso&_method=delete', json: true } )
				.reply( 200, { data: deleteResponse } );
		} );

		test( 'should delete', () => {
			return request( siteId )
				.del( 'placeholder_endpoint' )
				.then( data => {
					expect( data ).to.eql( deleteResponse );
				} );
		} );

		test( 'should catch error via promise', () => {
			return request( siteId )
				.del( 'bad_placeholder_endpoint' )
				.catch( error => {
					expect( error.statusCode ).to.equal( 404 );
				} );
		} );
	} );
} );
