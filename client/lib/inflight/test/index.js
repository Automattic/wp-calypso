/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestInflight,
	markRequestInflight,
	completeRequest,
	trackPromise,
	requestTracker,
	_clear,
} from '../';

describe( 'inflight', () => {
	const key = '__test';
	afterEach( () => {
		_clear();
	} );
	describe( 'explicit lifecycle', () => {
		test( 'should handle the explicit lifecycle', () => {
			expect( isRequestInflight( key ) ).to.be.false;
			markRequestInflight( key );
			expect( isRequestInflight( key ) ).to.be.true;
			completeRequest( key );
			expect( isRequestInflight( key ) ).to.be.false;
		} );

		test( 'should handle marking a request inflight twice', () => {
			expect( isRequestInflight( key ) ).to.be.false;
			markRequestInflight( key );
			markRequestInflight( key );
			expect( isRequestInflight( key ) ).to.be.true;
			completeRequest( key );
			expect( isRequestInflight( key ) ).to.be.false;
		} );

		test( 'should handle marking a request not inflight as not inflight', () => {
			expect( isRequestInflight( key ) ).to.be.false;
			completeRequest( key );
			expect( isRequestInflight( key ) ).to.be.false;
		} );
	} );
	describe( 'promise tracker', () => {
		test( 'should track a promise that resolves', () => {
			const tracked = trackPromise( key, Promise.resolve( 5 ) );
			expect( isRequestInflight( key ) ).to.be.true;
			return tracked.then( () => expect( isRequestInflight( key ) ).to.be.false );
		} );
		test( 'should track a promise that rejects', () => {
			const tracked = trackPromise( key, Promise.reject( 5 ) );
			expect( isRequestInflight( key ) ).to.be.true;
			return tracked.then(
				() => expect( false ).to.be.true,
				() => expect( isRequestInflight( key ) ).to.be.false
			);
		} );
	} );
	describe( 'requestTracker', () => {
		test( 'should track a good request', done => {
			const val = { one: 1 };
			const cb = ( err, data ) => {
				expect( err ).to.not.be.ok;
				expect( data ).to.equal( val );
				expect( isRequestInflight( key ) ).to.be.false;
				done();
			};
			const tracked = requestTracker( key, cb );
			expect( isRequestInflight( key ) ).to.be.true;
			tracked( null, val );
		} );
		test( 'should track a bad request', done => {
			const error = { one: 1 };
			const cb = ( err, data ) => {
				expect( err ).to.equal( error );
				expect( data ).to.be.undefined;
				expect( isRequestInflight( key ) ).to.be.false;
				done();
			};
			const tracked = requestTracker( key, cb );
			expect( isRequestInflight( key ) ).to.be.true;
			tracked( error );
		} );
	} );
} );
