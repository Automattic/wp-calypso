/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import queue from '../batch';

describe( 'wpcom-api', () => {
	describe( 'request', () => {
		useNock( nock => (
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/batch?urls%5B%5D=%2FendpointOne&urls%5B%5D=%2FendpointTwo' )
				.reply( 200, {
					'/endpointOne': {
						response1: 'batched'
					},
					'/endpointTwo': {
						response2: 'batched'
					}
				} )
				.get( '/rest/v1.1/batch?urls%5B%5D=%2FendpointFail' )
				.reply( 200, {
					'/endpointFail': {
						status_code: 400,
						error: 'Bad Request'
					}
				} )
				.get( '/rest/v1.1/batch?urls%5B%5D=%2FendpointOne' )
				.reply( 200, {
					'/endpointOne': {
						response1: 'unbatched'
					}
				} )
				.get( '/rest/v1.1/batch?urls%5B%5D=%2FendpointTwo' )
				.reply( 200, {
					'/endpointTwo': {
						response2: 'unbatched'
					}
				} )
		) );

		it( 'should batch requests into one API call', () => {
			return Promise.all( [
				queue.request( '/endpointOne' ),
				queue.request( '/endpointTwo' )
			] ).then( ( [ response1, response2 ] ) => {
				expect( response1 ).to.eql( {
					response1: 'batched'
				} );
				expect( response2 ).to.eql( {
					response2: 'batched'
				} );
			} );
		} );

		it( 'should fail when we provide a status code', () => {
			return queue.request( '/endpointFail' ).catch( response => {
				expect( response ).to.eql( {
					status_code: 400,
					error: 'Bad Request'
				} );
			} );
		} );

		it( 'should not batch requests if the delay is high enough', () => {
			const delay = timeout => new Promise( resolve => setTimeout( resolve, timeout ) );
			queue.request( '/endpointOne' );
			return delay( 60 )
				.then( () => queue.request( '/endpointTwo' ) )
				.then( response => {
					expect( response ).to.eql( {
						response2: 'unbatched'
					} );
				} );
		} );
	} );
} );
