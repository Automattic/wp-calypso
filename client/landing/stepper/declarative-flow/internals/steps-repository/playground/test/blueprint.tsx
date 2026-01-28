/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { getBlueprint } from '../lib/blueprint';

const DEFAULT_BLUEPRINT = {
	preferredVersions: {
		php: '8.3',
		wp: 'latest',
	},
	features: {
		networking: true,
	},
	login: true,
};

const BLUEPRINT_IN_URL_HASH = '#' + JSON.stringify( { landingPage: '/hash' } );
const HASH_BLUEPRINT = {
	preferredVersions: {
		php: '8.2',
		wp: 'latest',
	},
	features: {
		networking: true,
	},
	login: true,
	landingPage: '/hash',
	steps: [],
};

const WOOCOMMERCE_PREDEFINED_BLUEPRINT = {
	preferredVersions: {
		php: '8.1',
		wp: 'latest',
	},
	features: {
		networking: true,
	},
	login: true,
	landingPage: '/shop',
	steps: [
		{
			step: 'installPlugin',
			pluginData: {
				resource: 'wordpress.org/plugins',
				slug: 'woocommerce',
			},
			options: {
				activate: true,
			},
		},
		{
			step: 'importWxr',
			file: {
				resource: 'url',
				url: 'https://raw.githubusercontent.com/wordpress/blueprints/trunk/blueprints/woo-shipping/sample_products.xml',
			},
		},
	],
};

const REMOTE_BLUEPRINT = {
	preferredVersions: {
		php: '8.4', // Should use the PHP version passed to getBlueprint
		wp: 'latest',
	},
	features: {
		networking: true,
	},
	login: true,
	landingPage: '/remote-blueprint',
	steps: [],
};

describe( 'getBlueprint', () => {
	beforeEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'returns default blueprint if WordPress is installed', async () => {
		const blueprint = await getBlueprint( true, '7.4' );
		expect( blueprint ).toEqual( {
			...DEFAULT_BLUEPRINT,
			preferredVersions: {
				wp: 'latest',
				php: '7.4',
			},
		} );
	} );

	it( 'returns pre-defined blueprint when its name is specified', async () => {
		jest.spyOn( global, 'URL' ).mockImplementation( () => ( {
			searchParams: {
				get: ( param ) => ( param === 'blueprint' ? 'woocommerce' : null ),
			},
		} ) );

		const blueprint = await getBlueprint( false, '8.1' );
		expect( blueprint ).toEqual( WOOCOMMERCE_PREDEFINED_BLUEPRINT );
	} );

	it( 'returns blueprint in url hash', async () => {
		jest.spyOn( global, 'URL' ).mockImplementation( () => ( {
			searchParams: {
				get: () => null,
				has: () => false,
			},
			hash: BLUEPRINT_IN_URL_HASH,
		} ) );

		const blueprint = await getBlueprint( false, '8.2' );
		expect( blueprint ).toEqual( HASH_BLUEPRINT );
	} );

	describe.each( [
		{
			testName: 'with a standard blueprint',
			mockResponse: {
				preferredVersions: {
					php: '8.4',
					wp: 'latest',
				},
				features: {
					networking: true,
				},
				login: true,
				landingPage: '/remote-blueprint',
			},
		},
		{
			testName: 'when features property is not specified',
			mockResponse: {
				preferredVersions: {
					php: '8.4',
					wp: 'latest',
				},
				login: true,
				landingPage: '/remote-blueprint',
			},
		},
		{
			testName: 'when features property is empty',
			mockResponse: {
				preferredVersions: {
					php: '8.4',
					wp: 'latest',
				},
				features: {},
				login: true,
				landingPage: '/remote-blueprint',
			},
		},
		{
			testName: 'with networking turned off',
			mockResponse: {
				preferredVersions: {
					php: '8.4',
					wp: 'latest',
				},
				features: {
					networking: false,
				},
				login: true,
				landingPage: '/remote-blueprint',
			},
		},
		{
			testName: 'with login turned off',
			mockResponse: {
				preferredVersions: {
					php: '8.4',
					wp: 'latest',
				},
				features: {
					networking: true,
				},
				login: false,
				landingPage: '/remote-blueprint',
			},
		},
		{
			testName: 'with modified PHP version',
			mockResponse: {
				preferredVersions: {
					php: '99',
					wp: 'latest',
				},
				features: {
					networking: true,
				},
				login: true,
				landingPage: '/remote-blueprint',
			},
		},
		{
			testName: 'with modified wp value',
			mockResponse: {
				preferredVersions: {
					php: '8.4',
					wp: '1.0',
				},
				features: {
					networking: true,
				},
				login: true,
				landingPage: '/remote-blueprint',
			},
		},
	] )(
		'returns blueprint after fetching from blueprint-url GET param $testName',
		( { mockResponse } ) => {
			it( 'fetches and returns the expected blueprint', async () => {
				// Mock URL to return blueprint-url parameter
				jest.spyOn( global, 'URL' ).mockImplementation( () => ( {
					searchParams: {
						get: ( param ) =>
							param === 'blueprint-url' ? 'https://example.com/blueprint.json' : null,
						has: ( param ) => param === 'blueprint-url',
					},
				} ) );

				// Mock the fetch function
				jest.spyOn( global, 'fetch' ).mockResolvedValue( {
					ok: true,
					status: 200,
					statusText: 'OK',
					json: async () => mockResponse,
				} as Response );

				const blueprint = await getBlueprint( false, '8.4' );

				// Verify fetch was called with the right URL
				expect( global.fetch ).toHaveBeenCalledWith( 'https://example.com/blueprint.json', {
					credentials: 'omit',
				} );
				expect( blueprint ).toEqual( REMOTE_BLUEPRINT );
			} );
		}
	);

	it( 'returns default blueprint when fetch fails with invalid URL', async () => {
		// Mock URL to return blueprint-url parameter
		jest.spyOn( global, 'URL' ).mockImplementation( () => ( {
			searchParams: {
				get: ( param ) =>
					param === 'blueprint-url' ? 'https://invalid-example.com/blueprint.json' : null,
				has: ( param ) => param === 'blueprint-url',
			},
		} ) );

		// Mock fetch to return a failed response
		jest.spyOn( global, 'fetch' ).mockResolvedValue( {
			ok: false,
			status: 404,
			statusText: 'Not Found',
			json: async () => {
				throw new Error( 'Failed to parse JSON' );
			},
		} as Response );

		const blueprint = await getBlueprint( false, '8.3' );

		// Verify fetch was called
		expect( global.fetch ).toHaveBeenCalledWith( 'https://invalid-example.com/blueprint.json', {
			credentials: 'omit',
		} );

		// When fetch fails, it should return the default blueprint with merged properties
		expect( blueprint ).toEqual( {
			...DEFAULT_BLUEPRINT,
			preferredVersions: {
				wp: 'latest',
				php: '8.3',
			},
			steps: [],
		} );
	} );

	it( 'returns default blueprint when fetch throws a network error', async () => {
		// Mock URL to return blueprint-url parameter
		jest.spyOn( global, 'URL' ).mockImplementation( () => ( {
			searchParams: {
				get: ( param ) =>
					param === 'blueprint-url' ? 'https://unreachable-server.com/blueprint.json' : null,
				has: ( param ) => param === 'blueprint-url',
			},
		} ) );

		// Mock fetch to throw a network error
		jest.spyOn( global, 'fetch' ).mockRejectedValue( new Error( 'Network error' ) );

		// Expect getBlueprint to throw since fetch error is not caught
		await expect( getBlueprint( false, '8.0' ) ).rejects.toThrow( 'Network error' );

		// Verify fetch was called
		expect( global.fetch ).toHaveBeenCalledWith( 'https://unreachable-server.com/blueprint.json', {
			credentials: 'omit',
		} );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );
} );
