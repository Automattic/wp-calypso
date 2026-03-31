/**
 * @jest-environment jsdom
 */

const MOCK_VISITOR_ID = 'mock-visitor-id-123';

jest.mock( '@fingerprintjs/fingerprintjs', () => ( {
	load: jest.fn( () =>
		Promise.resolve( {
			get: jest.fn( () => Promise.resolve( { visitorId: MOCK_VISITOR_ID } ) ),
		} )
	),
} ) );

import { injectFingerprint } from '../fingerprint';

describe( '#injectFingerprint', () => {
	let wpcom: { request: jest.Mock };
	let originalRequest: jest.Mock;
	const callback = jest.fn();

	beforeEach( () => {
		originalRequest = jest.fn();
		wpcom = { request: originalRequest };
	} );

	test( 'should inject fingerprint header for transactions path', async () => {
		injectFingerprint( wpcom );

		await wpcom.request( { path: '/me/transactions' }, callback );

		expect( originalRequest ).toHaveBeenCalledWith(
			{
				path: '/me/transactions',
				headers: {
					'X-Fingerprint': MOCK_VISITOR_ID,
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

	test( 'should merge with existing headers if present', async () => {
		injectFingerprint( wpcom );

		await wpcom.request(
			{ path: '/me/transactions', headers: { 'Content-Type': 'application/json' } },
			callback
		);

		expect( originalRequest ).toHaveBeenCalledWith(
			{
				path: '/me/transactions',
				headers: {
					'Content-Type': 'application/json',
					'X-Fingerprint': MOCK_VISITOR_ID,
				},
			},
			callback
		);
	} );
} );
