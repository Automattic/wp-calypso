/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
jest.mock( '../lib/resolve-remote-blueprint-standalone', () => ( {
	resolveRemoteBlueprint: jest.fn(),
	ZipFilesystem: jest.fn(),
} ) );

import { getBlueprint } from '../lib/blueprint';
import { resolveRemoteBlueprint } from '../lib/resolve-remote-blueprint-standalone';

const DEFAULT_BLUEPRINT = {
	preferredVersions: {
		php: '8.4',
		wp: 'latest',
	},
	features: {
		networking: true,
	},
	login: true,
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

/**
 * Creates a mock BlueprintBundle (ReadableFilesystemBackend) that returns
 * the given blueprint JSON when reading /blueprint.json.
 */
function createMockBlueprintBundle( blueprintJson ) {
	return {
		read: jest.fn().mockImplementation( ( path ) => {
			if ( path === '/blueprint.json' ) {
				const encoded = new TextEncoder().encode( JSON.stringify( blueprintJson ) );
				return Promise.resolve( {
					arrayBuffer: () => Promise.resolve( encoded.buffer ),
				} );
			}
			return Promise.reject( new Error( `File not found: ${ path }` ) );
		} ),
	};
}

describe( 'getBlueprint', () => {
	beforeEach( () => {
		jest.resetAllMocks();
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
		'returns blueprint after resolving from blueprint-url GET param $testName',
		( { mockResponse } ) => {
			it( 'resolves and returns the expected blueprint', async () => {
				// Mock URL to return blueprint-url parameter
				jest.spyOn( global, 'URL' ).mockImplementation( () => ( {
					searchParams: {
						get: ( param ) =>
							param === 'blueprint-url' ? 'https://example.com/blueprint.json' : null,
						has: ( param ) => param === 'blueprint-url',
					},
				} ) );

				// Mock resolveRemoteBlueprint to return a BlueprintBundle
				// that serves the mockResponse as /blueprint.json
				resolveRemoteBlueprint.mockResolvedValue( createMockBlueprintBundle( mockResponse ) );

				const blueprint = await getBlueprint( false, '8.4' );

				// Verify resolveRemoteBlueprint was called with the right URL
				expect( resolveRemoteBlueprint ).toHaveBeenCalledWith(
					'https://example.com/blueprint.json'
				);
				expect( blueprint ).toEqual( REMOTE_BLUEPRINT );
			} );
		}
	);
} );
