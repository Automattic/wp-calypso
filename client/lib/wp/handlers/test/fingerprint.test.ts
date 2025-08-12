/**
 * @jest-environment jsdom
 */

import {
	type loadFingerprint as loadFingerprintType,
	type injectFingerprint as injectFingerprintType,
} from '../fingerprint';

describe( '#injectFingerprint', () => {
	let loadFingerprint: typeof loadFingerprintType;
	let injectFingerprint: typeof injectFingerprintType;
	let wpcom: { request: jest.Mock };
	let originalRequest: jest.Mock;
	const callback = jest.fn();

	beforeAll( async () => {
		jest.spyOn( document, 'readyState', 'get' ).mockReturnValue( 'loading' );
		jest.spyOn( document, 'addEventListener' ).mockImplementation( () => {} );
		( { loadFingerprint, injectFingerprint } = await import( '../fingerprint' ) );
	} );

	beforeEach( () => {
		originalRequest = jest.fn();
		wpcom = { request: originalRequest };
	} );

	test( 'should not inject X-Fingerprint header when fingerprint is not available', async () => {
		injectFingerprint( wpcom );

		wpcom.request( { path: '/me/transactions' }, callback );

		expect( originalRequest ).toHaveBeenCalledWith( { path: '/me/transactions' }, callback );
	} );

	describe( 'when fingerprint is loaded', () => {
		beforeAll( async () => {
			await loadFingerprint();
		} );

		test( 'should inject fingerprint header for transactions path', () => {
			injectFingerprint( wpcom );

			wpcom.request( { path: '/me/transactions' }, callback );

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

		test( 'should not inject header for other paths', () => {
			injectFingerprint( wpcom );

			wpcom.request( { path: '/me/settings' }, callback );

			expect( originalRequest ).toHaveBeenCalledWith( { path: '/me/settings' }, callback );
		} );

		test( 'should merge with existing headers if present', () => {
			injectFingerprint( wpcom );

			wpcom.request(
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
