/*
 * These tests shouldn't require the jsdom environment,
 * but we're waiting for this PR to merge:
 * https://github.com/WordPress/gutenberg/pull/20486
 *
 * @jest-environment jsdom
 */

import { dispatch, select, subscribe } from '@wordpress/data';
import wpcomRequest from 'wpcom-proxy-request';
import { AtomicSoftwareStatus, AtomicSoftwareStatusError, register } from '..';
import { getAtomicSoftwareStatus, getAtomicSoftwareError } from '../selectors';
import type { State } from '../reducer';

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

		// In the first state update, the resolver starts resolving
		await listenForStateUpdate();

		// In the second update, the resolver is finished resolving and we can read the result in state
		await listenForStateUpdate();

		// By the second call, the resolver will have resolved
		expect( select( store ).getSite( slug ) ).toEqual( apiResponse );
		await listenForStateUpdate();

		// The resolver should now be cached with an `isStarting` value of false

		expect( select( 'core/data' ).getIsResolving( store, 'getSite', [ slug ] ) ).toStrictEqual(
			false
		);
	} );

	it( 'resolves the state via an API call and caches the resolver on fail', async () => {
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

		// After the first call, the resolver's cache will be valid
		expect( select( store ).getSite( slug ) ).toEqual( undefined );
		await listenForStateUpdate();

		expect( select( 'core/data' ).getIsResolving( store, 'getSite', [ slug ] ) ).toStrictEqual(
			false
		);

		// After the second call, the resolver's cache will still be valid
		expect( select( store ).getSite( slug ) ).toEqual( undefined );
		await listenForStateUpdate();

		expect( select( 'core/data' ).getIsResolving( store, 'getSite', [ slug ] ) ).toStrictEqual(
			false
		);
	} );
} );

describe( 'hasAvailableSiteFeature', () => {
	it( 'Retrieves an available site feature from the store', async () => {
		const siteId = 12345;
		const apiResponse = {
			URL: 'http://mytestsite12345.wordpress.com',
			ID: 12345,
			plan: {
				features: {
					active: [],
					available: {
						woop: 'This is a test feature',
					},
				},
			},
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

		// First call returns false
		expect( select( store ).hasAvailableSiteFeature( siteId, 'woop' ) ).toEqual( false );

		// In the first state update, the resolver starts resolving
		await listenForStateUpdate();

		// In the second update, the resolver is finished resolving and we can read the result in state
		await listenForStateUpdate();

		// The woop feature exists
		expect( select( store ).hasAvailableSiteFeature( siteId, 'woop' ) ).toEqual( true );

		// The foo feature does not exist
		expect( select( store ).hasAvailableSiteFeature( siteId, 'foo' ) ).toEqual( false );

		// Site requires upgrade
		expect( select( store ).requiresUpgrade( siteId ) ).toEqual( true );
	} );
} );

describe( 'getAtomicSoftwareStatus', () => {
	it( 'Tries to retrive the Atomic Software Status', async () => {
		const siteId = 1234;
		const softwareSet = 'woo-on-plans';
		const status: AtomicSoftwareStatus = {
			blog_id: 123,
			software_set: {
				test: { path: '/valid_path.php', state: 'activate' },
			},
			applied: false,
		};
		const state: State = {
			atomicSoftwareStatus: {
				[ siteId ]: {
					[ softwareSet ]: {
						status: status,
						error: undefined,
					},
				},
			},
		};

		// Successfuly returns the status
		expect( getAtomicSoftwareStatus( state, siteId, softwareSet ) ).toEqual( status );

		// Should return undefined when the software set is not found.
		expect( getAtomicSoftwareStatus( state, siteId, 'unknown_software_set' ) ).toEqual( undefined );

		// Should return undefined when the site ID is not found
		expect( getAtomicSoftwareStatus( state, 123456, softwareSet ) ).toEqual( undefined );
	} );

	it( 'Fails to retrive the Atomic Software Status', async () => {
		const siteId = 1234;
		const softwareSet = 'non-existing-software-set';
		const error: AtomicSoftwareStatusError = {
			name: 'NotFoundError',
			status: 404,
			message: 'Transfer not found',
			code: 'no_transfer_record',
		};

		const state: State = {
			atomicSoftwareStatus: {
				[ siteId ]: {
					[ softwareSet ]: {
						status: undefined,
						error: error,
					},
				},
			},
		};

		// Successfuly returns the status
		expect( getAtomicSoftwareError( state, siteId, softwareSet ) ).toEqual( error );
	} );
} );
