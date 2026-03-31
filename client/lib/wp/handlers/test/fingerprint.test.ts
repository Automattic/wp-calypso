/**
 * @jest-environment jsdom
 */

import type * as fingerprintModuleType from '../fingerprint';

describe( '#injectFingerprint', () => {
	let fingerprintModule: typeof fingerprintModuleType;
	let wpcom: { request: jest.Mock };
	let originalRequest: jest.Mock;
	const callback = jest.fn();

	beforeAll( async () => {
		jest.spyOn( document, 'readyState', 'get' ).mockReturnValue( 'loading' );
		jest.spyOn( document, 'addEventListener' ).mockImplementation( () => {} );
		fingerprintModule = await import( '../fingerprint' );
	} );

	beforeEach( () => {
		originalRequest = jest.fn();
		wpcom = { request: originalRequest };
	} );

	test( 'should not inject X-Fingerprint header when fingerprint is not available', async () => {
		// Populate the cache, so that we get `undefined` as the fingerprint value.
		fingerprintModule.cache.result = Promise.resolve( undefined );
		fingerprintModule.injectFingerprint( wpcom );

		await wpcom.request( { path: '/me/transactions' }, callback );

		expect( originalRequest ).toHaveBeenCalledWith( { path: '/me/transactions' }, callback );
	} );

	describe( 'when fingerprint is enabled', () => {
		beforeAll( () => {
			// Clear the cache, so that we can run through the usual steps of
			// retrieving a fingerprint value.
			delete fingerprintModule.cache[ 'result' ];
		} );

		test( 'should inject fingerprint header for transactions path', async () => {
			fingerprintModule.injectFingerprint( wpcom );

			await wpcom.request( { path: '/me/transactions' }, callback );

			expect( originalRequest ).toHaveBeenCalledWith(
				{
					path: '/me/transactions',
					headers: {
						'X-Fingerprint': expect.any( String ),
					},
				},
				callback
			);
		} );

		test( 'should not inject header for other paths', async () => {
			fingerprintModule.injectFingerprint( wpcom );

			await wpcom.request( { path: '/me/settings' }, callback );

			expect( originalRequest ).toHaveBeenCalledWith( { path: '/me/settings' }, callback );
		} );

		test( 'should merge with existing headers if present', async () => {
			fingerprintModule.injectFingerprint( wpcom );

			await wpcom.request(
				{ path: '/me/transactions', headers: { 'Content-Type': 'application/json' } },
				callback
			);

			expect( originalRequest ).toHaveBeenCalledWith(
				{
					path: '/me/transactions',
					headers: {
						'Content-Type': 'application/json',
						'X-Fingerprint': expect.any( String ),
					},
				},
				callback
			);
		} );
	} );
} );
