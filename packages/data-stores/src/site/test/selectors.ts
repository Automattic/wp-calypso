/*
 * These tests shouldn't require the jsdom environment,
 * but we're waiting for this PR to merge:
 * https://github.com/WordPress/gutenberg/pull/20486
 *
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { dispatch, select, subscribe } from '@wordpress/data';
import wpcomRequest from 'wpcom-proxy-request';

/**
 * Internal dependencies
 */
import { register } from '..';

jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
	default: jest.fn(),
	requestAllBlogsAccess: jest.fn( () => Promise.resolve() ),
} ) );

let store: ReturnType< typeof register >;

beforeAll( () => {
	store = register( { client_id: '', client_secret: '' } );
} );

beforeEach( () => {
	( wpcomRequest as jest.Mock ).mockReset();
	dispatch( store ).reset();
} );

describe( 'getSite', () => {
	it( 'resolves the state via an API call and caches the resolver on success', async () => {
		const slug = 'mytestsite12345.wordpress.com';
		const apiResponse = {
			ID: 1,
			name: 'My test site',
			description: '',
			URL: 'http://mytestsite12345.wordpress.com',
		};

		( wpcomRequest as jest.Mock ).mockResolvedValue( apiResponse );

		const listenForStateUpdate = () => {
			return new Promise( ( resolve ) => {
				const unsubscribe = subscribe( () => {
					unsubscribe();
					resolve();
				} );
			} );
		};

		// First call returns undefined
		expect( select( store ).getSite( slug ) ).toEqual( undefined );
		await listenForStateUpdate();

		// By the second call, the resolver will have resolved
		expect( select( store ).getSite( slug ) ).toEqual( apiResponse );
		await listenForStateUpdate();

		// The resolver should now be cached with an `isStarting` value of false

		expect( select( 'core/data' ).getIsResolving( store, 'getSite', [ slug ] ) ).toStrictEqual(
			false
		);
	} );

	it( 'resolves the state via an API call and invalidates the resolver cache on fail', async () => {
		const slug = 'mytestsite12345.wordpress.com';
		const apiResponse = {
			status: 404,
			error: 'unknown_blog',
			message: 'Unknown blog',
		};

		( wpcomRequest as jest.Mock ).mockRejectedValue( apiResponse );

		const listenForStateUpdate = () => {
			// The subscribe function in wordpress/data stores only updates when state changes,
			// so for this test (where state remains the same), use setTimeout instead.
			return new Promise( ( resolve ) => {
				setTimeout( () => {
					resolve();
				}, 0 );
			} );
		};

		// After the first call, the resolver's cache will be invalidated
		expect( select( store ).getSite( slug ) ).toEqual( undefined );
		await listenForStateUpdate();

		expect( select( 'core/data' ).getIsResolving( store, 'getSite', [ slug ] ) ).toStrictEqual(
			undefined
		);

		// After the second call, the resolver's cache will be valid
		expect( select( store ).getSite( slug ) ).toEqual( undefined );
		await listenForStateUpdate();

		expect( select( 'core/data' ).getIsResolving( store, 'getSite', [ slug ] ) ).toStrictEqual(
			false
		);

		// After the third call, the resolver's cache will be invalidated again
		expect( select( store ).getSite( slug ) ).toEqual( undefined );
		await listenForStateUpdate();

		// The resolver should now be cached with an `isStarting` value of false
		expect( select( 'core/data' ).getIsResolving( store, 'getSite', [ slug ] ) ).toStrictEqual(
			undefined
		);
	} );
} );
