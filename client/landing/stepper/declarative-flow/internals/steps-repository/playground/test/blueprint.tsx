/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { getBlueprint, getBlueprintID, getBlueprintLabelForTracking } from '../lib/blueprint';

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

function setLocationHref( href: string ) {
	Object.defineProperty( window, 'location', {
		value: { href },
		writable: true,
	} );
}

describe( 'getBlueprint', () => {
	beforeEach( () => {
		jest.restoreAllMocks();
		setLocationHref( 'https://example.com/' );
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
		setLocationHref( 'https://example.com/?blueprint=woocommerce' );

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
		'returns blueprint after fetching from blueprint-url GET param $testName',
		( { mockResponse } ) => {
			it( 'fetches and returns the expected blueprint', async () => {
				setLocationHref( 'https://example.com/?blueprint-url=https://example.com/blueprint.json' );

				// Mock the fetch function with a proper arrayBuffer() response
				jest.spyOn( global, 'fetch' ).mockResolvedValue( {
					ok: true,
					status: 200,
					statusText: 'OK',
					arrayBuffer: async () => {
						const encoder = new TextEncoder();
						return encoder.encode( JSON.stringify( mockResponse ) ).buffer;
					},
				} as unknown as Response );

				const blueprint = await getBlueprint( false, '8.4' );

				// Verify fetch was called with the right URL
				expect( global.fetch ).toHaveBeenCalledWith( 'https://example.com/blueprint.json', {
					credentials: 'omit',
				} );
				expect( blueprint ).toEqual( REMOTE_BLUEPRINT );
			} );
		}
	);

	afterEach( () => {
		jest.restoreAllMocks();
		setLocationHref( 'https://example.com/' );
	} );
} );

describe( 'getBlueprintID', () => {
	beforeEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'returns blueprint ID from direct blueprint parameter when it is a number', () => {
		const params = new URLSearchParams( 'blueprint=12345' );
		const id = getBlueprintID( params );
		expect( id ).toBe( '12345' );
	} );

	it( 'returns blueprint ID from blueprint-url parameter when host matches BLUEPRINT_LIB_HOST', () => {
		const params = new URLSearchParams();
		params.set( 'blueprint-url', 'https://blueprintlibrary.wordpress.com?blueprint=67890' );
		const id = getBlueprintID( params );
		expect( id ).toBe( '67890' );
	} );

	it( 'returns null when blueprint-url host does not match BLUEPRINT_LIB_HOST', () => {
		const params = new URLSearchParams();
		params.set( 'blueprint-url', 'https://example.com?blueprint=12345' );
		const id = getBlueprintID( params );
		expect( id ).toBeNull();
	} );

	it( 'returns null when blueprint parameter is not a number', () => {
		const params = new URLSearchParams( 'blueprint=woocommerce' );
		const id = getBlueprintID( params );
		expect( id ).toBeNull();
	} );

	it( 'returns null when blueprint parameter is empty', () => {
		const params = new URLSearchParams( 'blueprint=' );
		const id = getBlueprintID( params );
		expect( id ).toBeNull();
	} );

	it( 'returns null when no blueprint parameters are provided', () => {
		const params = new URLSearchParams();
		const id = getBlueprintID( params );
		expect( id ).toBeNull();
	} );

	it( 'prioritizes blueprint-url over direct blueprint parameter when both are present', () => {
		const params = new URLSearchParams();
		params.set( 'blueprint-url', 'https://blueprintlibrary.wordpress.com?blueprint=11111' );
		params.set( 'blueprint', '22222' );
		const id = getBlueprintID( params );
		expect( id ).toBe( '11111' );
	} );

	it( 'falls back to direct blueprint parameter when blueprint-url is invalid', () => {
		const params = new URLSearchParams();
		params.set( 'blueprint-url', 'https://example.com?blueprint=invalid' );
		params.set( 'blueprint', '99999' );
		const id = getBlueprintID( params );
		expect( id ).toBe( '99999' );
	} );

	it( 'returns null when blueprint-url has valid host but no blueprint parameter', () => {
		const params = new URLSearchParams();
		params.set( 'blueprint-url', 'https://blueprintlibrary.wordpress.com?other=value' );
		const id = getBlueprintID( params );
		expect( id ).toBeNull();
	} );

	it( 'returns null when blueprint-url has valid host but blueprint parameter is not a number', () => {
		const params = new URLSearchParams();
		params.set( 'blueprint-url', 'https://blueprintlibrary.wordpress.com?blueprint=notanumber' );
		const id = getBlueprintID( params );
		expect( id ).toBeNull();
	} );
} );

describe( 'getBlueprintLabelForTracking', () => {
	beforeEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'returns "unknown" for non-numeric predefined blueprint names like "woocommerce"', () => {
		// getBlueprintID only returns numeric IDs, so "woocommerce" returns null
		const params = new URLSearchParams( 'blueprint=woocommerce' );
		const label = getBlueprintLabelForTracking( params );
		expect( label ).toBe( 'unknown' );
	} );

	it( 'returns predefined blueprint name for "2024" theme', () => {
		const params = new URLSearchParams( 'blueprint=2024' );
		const label = getBlueprintLabelForTracking( params );
		expect( label ).toBe( '2024' );
	} );

	it( 'returns predefined blueprint name for "2023" theme', () => {
		const params = new URLSearchParams( 'blueprint=2023' );
		const label = getBlueprintLabelForTracking( params );
		expect( label ).toBe( '2023' );
	} );

	it( 'returns "unknown" for non-numeric predefined blueprint names like "design1"', () => {
		// getBlueprintID only returns numeric IDs, so "design1" returns null
		const params = new URLSearchParams( 'blueprint=design1' );
		const label = getBlueprintLabelForTracking( params );
		expect( label ).toBe( 'unknown' );
	} );

	it( 'returns "bpl-" prefixed label for numeric blueprint ID', () => {
		const params = new URLSearchParams( 'blueprint=12345' );
		const label = getBlueprintLabelForTracking( params );
		expect( label ).toBe( 'bpl-12345' );
	} );

	it( 'returns "bpl-" prefixed label for blueprint library ID from blueprint-url', () => {
		const params = new URLSearchParams();
		params.set( 'blueprint-url', 'https://blueprintlibrary.wordpress.com?blueprint=67890' );
		const label = getBlueprintLabelForTracking( params );
		expect( label ).toBe( 'bpl-67890' );
	} );

	it( 'returns "unknown" when no blueprint parameters are provided', () => {
		const params = new URLSearchParams();
		const label = getBlueprintLabelForTracking( params );
		expect( label ).toBe( 'unknown' );
	} );

	it( 'returns "unknown" when blueprint-url host does not match BLUEPRINT_LIB_HOST', () => {
		const params = new URLSearchParams();
		params.set( 'blueprint-url', 'https://example.com?blueprint=12345' );
		const label = getBlueprintLabelForTracking( params );
		expect( label ).toBe( 'unknown' );
	} );

	it( 'returns "unknown" when blueprint parameter is not a valid predefined name or number', () => {
		const params = new URLSearchParams( 'blueprint=invalidname' );
		const label = getBlueprintLabelForTracking( params );
		expect( label ).toBe( 'unknown' );
	} );

	it( 'prioritizes blueprint-url over direct blueprint parameter', () => {
		const params = new URLSearchParams();
		params.set( 'blueprint-url', 'https://blueprintlibrary.wordpress.com?blueprint=99999' );
		params.set( 'blueprint', 'woocommerce' );
		const label = getBlueprintLabelForTracking( params );
		expect( label ).toBe( 'bpl-99999' );
	} );

	it( 'returns "unknown" when blueprint-url is invalid and fallback is non-numeric', () => {
		const params = new URLSearchParams();
		params.set( 'blueprint-url', 'https://example.com?blueprint=invalid' );
		params.set( 'blueprint', 'woocommerce' );
		const label = getBlueprintLabelForTracking( params );
		expect( label ).toBe( 'unknown' );
	} );

	it( 'falls back to numeric blueprint ID when blueprint-url is invalid', () => {
		const params = new URLSearchParams();
		params.set( 'blueprint-url', 'https://example.com?blueprint=invalid' );
		params.set( 'blueprint', '55555' );
		const label = getBlueprintLabelForTracking( params );
		expect( label ).toBe( 'bpl-55555' );
	} );
} );
