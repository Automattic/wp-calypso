import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	jetpackAuthProvider,
	JWT_TOKEN_ID,
	requestJetpackToken,
} from './jetpack';

vi.mock( '@wordpress/api-fetch', () => ( {
	default: vi.fn(),
} ) );

import apiFetch from '@wordpress/api-fetch';
const mockedApiFetch = vi.mocked( apiFetch );

// Mock localStorage for Node.js environment
const localStorageMock = ( () => {
	let store: Record< string, string > = {};
	return {
		getItem: ( key: string ) => store[ key ] || null,
		setItem: ( key: string, value: string ) => {
			store[ key ] = value;
		},
		clear: () => {
			store = {};
		},
		removeItem: ( key: string ) => {
			delete store[ key ];
		},
	};
} )();

Object.defineProperty( global, 'localStorage', {
	value: localStorageMock,
	writable: true,
} );

Object.defineProperty( global, 'window', {
	value: global,
	writable: true,
} );

describe( 'Jetpack Auth Provider', () => {
	beforeEach( () => {
		vi.clearAllMocks();

		localStorageMock.clear();

		delete ( window as any ).JP_CONNECTION_INITIAL_STATE;
		delete ( window as any ).Jetpack_Editor_Initial_State;
	} );

	afterEach( () => {
		vi.clearAllMocks();
		localStorageMock.clear();
	} );

	describe( 'requestJetpackToken', () => {
		it( 'should fetch a new token for Jetpack-connected sites', async () => {
			( window as any ).JP_CONNECTION_INITIAL_STATE = {
				apiNonce: 'test-nonce',
				siteSuffix: 'test-site',
				connectionStatus: { isActive: true },
			};

			const mockToken = {
				token: 'jwt-token-123',
				blog_id: 'blog-123',
			};

			mockedApiFetch.mockResolvedValueOnce( mockToken );

			const result = await requestJetpackToken();

			expect( result ).toBeTruthy();
			expect( result?.token ).toBe( 'jwt-token-123' );
			expect( result?.blogId ).toBe( 'blog-123' );
			expect( result?.expire ).toBeGreaterThan( Date.now() );

			expect( mockedApiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: expect.stringContaining(
						'/jetpack/v4/jetpack-ai-jwt'
					),
					method: 'POST',
					headers: {
						'X-WP-Nonce': 'test-nonce',
					},
				} )
			);
		} );

		it( 'should fetch a new token for WordPress.com simple sites', async () => {
			( window as any ).Jetpack_Editor_Initial_State = {
				wpcomBlogId: 'wpcom-blog-456',
			};

			const mockToken = {
				token: 'wpcom-token-456',
				blog_id: 'wpcom-blog-456',
			};

			mockedApiFetch.mockResolvedValueOnce( mockToken );

			const result = await requestJetpackToken();

			expect( result ).toBeTruthy();
			expect( result?.token ).toBe( 'wpcom-token-456' );
			expect( result?.blogId ).toBe( 'wpcom-blog-456' );

			expect( mockedApiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/wpcom/v2/sites/wpcom-blog-456/jetpack-openai-query/jwt',
					method: 'POST',
				} )
			);
		} );

		it( 'should use cached token if valid', async () => {
			const cachedToken = {
				token: 'cached-token',
				blogId: 'cached-blog',
				expire: Date.now() + 60000, // Valid for 1 minute
			};

			localStorageMock.setItem(
				JWT_TOKEN_ID,
				JSON.stringify( cachedToken )
			);

			const result = await requestJetpackToken();

			expect( result ).toEqual( cachedToken );
			expect( mockedApiFetch ).not.toHaveBeenCalled();
		} );

		it( 'should fetch new token if cached token is expired', async () => {
			const expiredToken = {
				token: 'expired-token',
				blogId: 'expired-blog',
				expire: Date.now() - 1000, // Expired 1 second ago
			};

			localStorageMock.setItem(
				JWT_TOKEN_ID,
				JSON.stringify( expiredToken )
			);

			// Setup environment
			( window as any ).JP_CONNECTION_INITIAL_STATE = {
				apiNonce: 'test-nonce',
				siteSuffix: 'test-site',
				connectionStatus: { isActive: true },
			};

			const newToken = {
				token: 'new-token',
				blog_id: 'new-blog',
			};

			mockedApiFetch.mockResolvedValueOnce( newToken );

			const result = await requestJetpackToken();

			expect( result?.token ).toBe( 'new-token' );
			expect( mockedApiFetch ).toHaveBeenCalled();
		} );

		it( 'should handle invalid cached token gracefully', async () => {
			localStorageMock.setItem( JWT_TOKEN_ID, 'invalid-json' );

			// Setup environment
			( window as any ).JP_CONNECTION_INITIAL_STATE = {
				apiNonce: 'test-nonce',
				siteSuffix: 'test-site',
				connectionStatus: { isActive: true },
			};

			const newToken = {
				token: 'new-token',
				blog_id: 'new-blog',
			};

			mockedApiFetch.mockResolvedValueOnce( newToken );

			const result = await requestJetpackToken();

			expect( result?.token ).toBe( 'new-token' );
			expect( mockedApiFetch ).toHaveBeenCalled();
		} );

		it( 'should throw error when Jetpack connection is missing', async () => {
			// No window globals set

			// Mock apiFetch to return empty data (no token)
			mockedApiFetch.mockResolvedValueOnce( { token: '', blog_id: '' } );

			await expect( requestJetpackToken() ).rejects.toThrow(
				'Authentication failed'
			);
		} );

		it( 'should throw error when API returns no token', async () => {
			( window as any ).JP_CONNECTION_INITIAL_STATE = {
				apiNonce: 'test-nonce',
				siteSuffix: 'test-site',
				connectionStatus: { isActive: true },
			};

			mockedApiFetch.mockResolvedValueOnce( { token: '', blog_id: '' } );

			await expect( requestJetpackToken() ).rejects.toThrow(
				'Authentication failed'
			);
		} );

		it( 'should handle API errors with appropriate messages', async () => {
			( window as any ).JP_CONNECTION_INITIAL_STATE = {
				apiNonce: 'test-nonce',
				siteSuffix: 'test-site',
				connectionStatus: { isActive: true },
			};

			const error = new Error( 'API Error' );
			( error as any ).code = 'rest_forbidden';
			( error as any ).status = 403;

			mockedApiFetch.mockRejectedValueOnce( error );

			await expect( requestJetpackToken() ).rejects.toThrow(
				"You don't have permission to access Jetpack AI features"
			);
		} );

		it( 'should handle network errors', async () => {
			( window as any ).JP_CONNECTION_INITIAL_STATE = {
				apiNonce: 'test-nonce',
				siteSuffix: 'test-site',
				connectionStatus: { isActive: true },
			};

			const error = new Error( 'Network request failed' );
			mockedApiFetch.mockRejectedValueOnce( error );

			await expect( requestJetpackToken() ).rejects.toThrow(
				'Network connection issue'
			);
		} );

		it( 'should cache the new token after successful fetch', async () => {
			( window as any ).JP_CONNECTION_INITIAL_STATE = {
				apiNonce: 'test-nonce',
				siteSuffix: 'test-site',
				connectionStatus: { isActive: true },
			};

			const mockToken = {
				token: 'jwt-token-to-cache',
				blog_id: 'blog-to-cache',
			};

			mockedApiFetch.mockResolvedValueOnce( mockToken );

			await requestJetpackToken();

			const cached = localStorageMock.getItem( JWT_TOKEN_ID );
			expect( cached ).toBeTruthy();

			const parsedCache = JSON.parse( cached! );
			expect( parsedCache.token ).toBe( 'jwt-token-to-cache' );
			expect( parsedCache.blogId ).toBe( 'blog-to-cache' );
			expect( parsedCache.expire ).toBeGreaterThan( Date.now() );
		} );

		it( 'should continue even if localStorage fails', async () => {
			( window as any ).JP_CONNECTION_INITIAL_STATE = {
				apiNonce: 'test-nonce',
				siteSuffix: 'test-site',
				connectionStatus: { isActive: true },
			};

			const mockToken = {
				token: 'jwt-token-no-cache',
				blog_id: 'blog-no-cache',
			};

			// Mock localStorage.setItem to throw
			const originalSetItem = localStorageMock.setItem;
			localStorageMock.setItem = vi.fn().mockImplementation( () => {
				throw new Error( 'Storage quota exceeded' );
			} );

			mockedApiFetch.mockResolvedValueOnce( mockToken );

			const result = await requestJetpackToken();

			expect( result?.token ).toBe( 'jwt-token-no-cache' );

			// Restore original localStorage
			localStorageMock.setItem = originalSetItem;
		} );

		it( 'should bypass cache when useCachedToken is false', async () => {
			const cachedToken = {
				token: 'cached-token',
				blogId: 'cached-blog',
				expire: Date.now() + 60000, // Valid for 1 minute
			};

			localStorageMock.setItem(
				JWT_TOKEN_ID,
				JSON.stringify( cachedToken )
			);

			( window as any ).JP_CONNECTION_INITIAL_STATE = {
				apiNonce: 'test-nonce',
				siteSuffix: 'test-site',
				connectionStatus: { isActive: true },
			};

			const newToken = {
				token: 'fresh-token',
				blog_id: 'fresh-blog',
			};

			mockedApiFetch.mockResolvedValueOnce( newToken );

			const result = await requestJetpackToken( false );

			expect( result?.token ).toBe( 'fresh-token' );
			expect( mockedApiFetch ).toHaveBeenCalled();
		} );
	} );

	describe( 'jetpackAuthProvider', () => {
		it( 'should return headers with Authorization token', async () => {
			( window as any ).JP_CONNECTION_INITIAL_STATE = {
				apiNonce: 'test-nonce',
				siteSuffix: 'test-site',
				connectionStatus: { isActive: true },
			};

			const mockToken = {
				token: 'auth-header-token',
				blog_id: 'auth-blog',
			};

			mockedApiFetch.mockResolvedValueOnce( mockToken );

			const headers = await jetpackAuthProvider();

			expect( headers ).toEqual( {
				Authorization: 'auth-header-token',
			} );
		} );

		it( 'should throw error when token request fails', async () => {
			// No window globals set - will cause requestJetpackToken to fail

			await expect( jetpackAuthProvider() ).rejects.toThrow();
		} );

		it( 'should use cached token if available', async () => {
			const cachedToken = {
				token: 'cached-auth-token',
				blogId: 'cached-auth-blog',
				expire: Date.now() + 60000,
			};

			localStorageMock.setItem(
				JWT_TOKEN_ID,
				JSON.stringify( cachedToken )
			);

			const headers = await jetpackAuthProvider();

			expect( headers ).toEqual( {
				Authorization: 'cached-auth-token',
			} );

			// Should not call API when cached token is valid
			expect( mockedApiFetch ).not.toHaveBeenCalled();
		} );
	} );
} );
