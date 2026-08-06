/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
jest.mock( '@automattic/oauth-token', () => ( {
	getToken: jest.fn(),
} ) );

jest.mock( '@wordpress/api-fetch', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
	default: jest.fn(),
	canAccessWpcomApis: jest.fn( () => false ),
} ) );

import apiFetch from '@wordpress/api-fetch';
import { createCalypsoAuthProvider } from '../calypso-auth-provider';

const mockApiFetch = apiFetch as unknown as jest.Mock;

describe( 'createCalypsoAuthProvider', () => {
	beforeEach( () => {
		sessionStorage.clear();
		mockApiFetch.mockReset();
	} );

	it( 'does not reuse a cached site-scoped JWT for a different site', async () => {
		mockApiFetch
			.mockResolvedValueOnce( { token: 'site-123-token', blog_id: '123' } )
			.mockResolvedValueOnce( { token: 'site-456-token', blog_id: '456' } );

		const firstHeaders = await createCalypsoAuthProvider( 123 )();
		const secondHeaders = await createCalypsoAuthProvider( 456 )();

		expect( firstHeaders.Authorization ).toBe( 'site-123-token' );
		expect( secondHeaders.Authorization ).toBe( 'site-456-token' );
		expect( mockApiFetch ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'reuses a cached site-scoped JWT for the same site', async () => {
		mockApiFetch.mockResolvedValueOnce( { token: 'site-123-token', blog_id: 123 } );

		const firstHeaders = await createCalypsoAuthProvider( 123 )();
		const secondHeaders = await createCalypsoAuthProvider( '123' )();

		expect( firstHeaders.Authorization ).toBe( 'site-123-token' );
		expect( secondHeaders.Authorization ).toBe( 'site-123-token' );
		expect( mockApiFetch ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'reuses a legacy cached JWT with a numeric blog ID for the same site', async () => {
		sessionStorage.setItem(
			'jetpack-ai-jwt-token',
			JSON.stringify( {
				token: 'legacy-site-123-token',
				blogId: 123,
				expire: Date.now() + 60_000,
			} )
		);

		const headers = await createCalypsoAuthProvider( '123' )();

		expect( headers.Authorization ).toBe( 'legacy-site-123-token' );
		expect( mockApiFetch ).not.toHaveBeenCalled();
	} );
} );
