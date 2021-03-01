/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { fetch, onSuccess, onError } from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { requestLock, requestLockError, updateLock } from 'zoninator/state/locks/actions';

describe( 'handlers', () => {
	describe( '#fetch()', () => {
		test( 'should dispatch a HTTP request to the lock endpoint', () => {
			const action = requestLock( 123, 456 );

			const result = fetch( action );

			expect( result ).to.deep.equal(
				http(
					{
						method: 'POST',
						path: '/jetpack-blogs/123/rest-api/',
						query: {
							path: '/zoninator/v1/zones/456/lock&_method=PUT',
						},
					},
					action
				)
			);
		} );
	} );

	describe( '#onSuccess()', () => {
		test( 'should dispatch `updateLock`', () => {
			const action = requestLock( 123, 456 );
			const lock = {
				expires: new Date().getTime(),
				maxLockPeriod: 300000,
			};

			const result = onSuccess( action, lock );

			expect( result ).to.deep.equal( updateLock( 123, 456, lock.expires, lock.maxLockPeriod ) );
		} );
	} );

	describe( '#handleLockFailure()', () => {
		test( 'should dispatch `requestLockError`', () => {
			const action = requestLock( 123, 456 );

			const result = onError( action );

			expect( result ).to.deep.equal( requestLockError( 123, 456 ) );
		} );
	} );
} );
