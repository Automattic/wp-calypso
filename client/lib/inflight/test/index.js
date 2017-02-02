/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import inflight from '../';

const THE_ANSWER = 42;

describe( 'inflight', ( ) => {
	describe( 'promiseTracker', () => {
		it( 'should mark an item as inflight while the request is ongoing and request succeeds', () => {
			const key = 'key1';
			const trackedPromise = inflight.promiseTracker( key, Promise.resolve( THE_ANSWER ) );

			expect( inflight.requestInflight( key ) ).to.be.true;
			return trackedPromise.then( () => {
				expect( inflight.requestInflight( key ) ).to.be.false;
			} );
		} );

		it( 'should mark an item as inflight while the request is ongoing and request fails', () => {
			const key = 'key2';
			const trackedPromise = inflight.promiseTracker( key, Promise.reject( THE_ANSWER ) );

			expect( inflight.requestInflight( key ) ).to.be.true;
			return trackedPromise.catch( () => {
				expect( inflight.requestInflight( key ) ).to.be.false;
			} );
		} );

		it( 'should return the same data as the original promise', () => {
			const key = 'key3';
			const trackedPromise = inflight.promiseTracker( key, Promise.resolve( THE_ANSWER ) );

			return trackedPromise.then( data => {
				expect( data ).to.equal( THE_ANSWER );
			} );
		} );
	} );
} );
