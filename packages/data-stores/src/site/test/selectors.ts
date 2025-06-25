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
import {
	getAtomicSoftwareStatus,
	getAtomicSoftwareError,
	getSiteOptions,
	getSiteOption,
	getBundledPluginSlug,
	getSiteTheme,
} from '../selectors';
import { SiteDetails } from '../types';
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

describe( 'getBundledPluginSlug', () => {
	it( 'retrieves the bundled plugin slug from the store', () => {
		const siteSlug = 'test.wordpress.com';
		const pluginSlug = 'woocommerce';

		const state: State = {
			bundledPluginSlug: {
				[ siteSlug ]: pluginSlug,
			},
		};

		expect( getBundledPluginSlug( state, siteSlug ) ).toEqual( pluginSlug );
	} );
} );

describe( 'getSiteTheme', () => {
	it( 'retrieves the site theme from the store', () => {
		const siteId = 1234;
		const themeSlug = 'tazza';

		const state: State = {
			siteTheme: {
				[ siteId ]: {
					id: themeSlug,
				},
			},
		};

		expect( getSiteTheme( state, siteId ).id ).toEqual( themeSlug );
	} );
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

	it( 'resolves the state when called with ID', async () => {
		const ID = 1;
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
		expect( select( store ).getSite( ID ) ).toEqual( undefined );

		// In first state update, the resolver starts resolving
		// In the second update, the resolver is finished and we can read the result in state
		await listenForStateUpdate();
		await listenForStateUpdate();
		expect( select( store ).getSite( ID ) ).toEqual( apiResponse );
	} );

	it( 'resolves the state when called with secondary wordpress domain', async () => {
		const slug = 'mytestsite123456.wordpress.com';
		const apiResponse = {
			ID: 1,
			name: 'My test site',
			description: '',
			URL: 'http://customdomain.com',
			options: {
				unmapped_url: 'http://mytestsite123456.wordpress.com',
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

		// First call returns undefined
		expect( select( store ).getSite( slug ) ).toEqual( undefined );

		// In first state update, the resolver starts resolving
		// In the second update, the resolver is finished and we can read the result in state
		await listenForStateUpdate();
		await listenForStateUpdate();
		expect( select( store ).getSite( slug ) ).toEqual( apiResponse );
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

describe( 'requiresUpgrade', () => {
	it( 'Retrieves an available site feature from the store', async () => {
		const siteId = 12345;
		const apiResponse = {
			URL: 'http://mytestsite12345.wordpress.com',
			ID: siteId,
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

		// First call returns undefined
		expect( select( store ).getSite( 'plan' ) ).toEqual( undefined );

		const listenForStateUpdate = () => {
			return new Promise( ( resolve ) => {
				const unsubscribe = subscribe( () => {
					unsubscribe();
					resolve();
				} );
			} );
		};

		// In the first state update, the resolver starts resolving
		await listenForStateUpdate();

		// In the second update, the resolver is finished resolving and we can read the result in state
		await listenForStateUpdate();

		// Site requires upgrade
		expect( select( store ).requiresUpgrade( siteId ) ).toEqual( true );
	} );

	it( 'Does not requires upgrade', async () => {
		const siteId = 12345;
		const apiResponse = {
			URL: 'http://mytestsite12345.wordpress.com',
			ID: siteId,
			plan: {
				features: {
					active: [ 'woop' ],
					available: {
						woop: 'This is a test feature',
					},
				},
			},
		};
		( wpcomRequest as jest.Mock ).mockResolvedValue( apiResponse );

		// First call returns undefined
		expect( select( store ).getSite( 'plan' ) ).toEqual( undefined );

		const listenForStateUpdate = () => {
			return new Promise( ( resolve ) => {
				const unsubscribe = subscribe( () => {
					unsubscribe();
					resolve();
				} );
			} );
		};

		// In the first state update, the resolver starts resolving
		await listenForStateUpdate();

		// In the second update, the resolver is finished resolving and we can read the result in state
		await listenForStateUpdate();

		// Site requires upgrade
		expect( select( store ).requiresUpgrade( siteId ) ).toEqual( false );
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

describe( 'getSiteOptions', () => {
	const siteId = 1234;
	const adminUrl = 'https://test.wordpress.com/wp-admin';
	const options = {
		admin_url: adminUrl,
	};
	const site: SiteDetails = {
		ID: siteId,
		name: 'test',
		description: 'test site',
		URL: 'https://test.wordpress.com',
		launch_status: '',
		jetpack: false,
		logo: { id: 'logoId', sizes: [ 'small' ], url: 'logoURL' },
		options,
		capabilities: {
			edit_pages: true,
			edit_posts: true,
			edit_others_posts: true,
			edit_others_pages: true,
			delete_posts: true,
			delete_others_posts: true,
			edit_theme_options: true,
			edit_users: true,
			list_users: true,
			manage_categories: true,
			manage_options: true,
			moderate_comments: true,
			activate_wordads: true,
			promote_users: true,
			publish_posts: true,
			upload_files: true,
			delete_users: true,
			remove_users: true,
			own_site: true,
			view_stats: true,
			activate_plugins: true,
		},
	};

	it( 'Tries to retrive the site options', async () => {
		const state: State = {
			sites: {
				[ siteId ]: site,
			},
		};

		expect( getSiteOptions( state, siteId ) ).toEqual( options );
	} );

	it( 'Tries to retrive a specific site option', async () => {
		const state: State = {
			sites: {
				[ siteId ]: site,
			},
		};

		expect( getSiteOption( state, siteId, 'admin_url' ) ).toEqual( adminUrl );
	} );
} );

describe( 'siteHasFeature', () => {
	it( 'Test if site has features', async () => {
		const siteId = 924785;
		const siteSlug = `http://mytestsite${ siteId }.wordpress.com`;
		const apiResponse = {
			URL: siteSlug,
			ID: siteId,
			plan: {
				features: {
					active: [ 'woop' ],
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

		// First call returns undefined
		expect( select( store ).getSite( siteId ) ).toEqual( undefined );

		// In the first state update, the resolver starts resolving
		await listenForStateUpdate();

		// In the second update, the resolver is finished resolving and we can read the result in state
		await listenForStateUpdate();

		expect( select( store ).siteHasFeature( siteId, 'woop' ) ).toEqual( true );

		expect( select( store ).siteHasFeature( siteId, 'loop' ) ).toEqual( false );
	} );
} );
