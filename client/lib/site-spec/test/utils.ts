/**
 * SiteSpec Utils Tests
 *
 * These tests focus on the core business logic:
 * - Configuration retrieval and validation
 * - URL resolution with different parameters
 * - Type safety and edge cases
 * - Error handling for missing configurations
 *
 */
import {
	isSiteSpecEnabled,
	getSiteSpecUrl,
	getSiteSpecUrlByType,
	getSiteSpecConfig,
} from '../utils';

// Mock the calypso-config module
jest.mock( '@automattic/calypso-config', () => {
	const mockConfig = jest.fn() as jest.MockedFunction<
		typeof import('@automattic/calypso-config').default
	>;

	// Mock the isEnabled method
	mockConfig.isEnabled = jest.fn( ( feature: string ) => {
		if ( feature === 'site-spec' ) {
			return true;
		}
		return false;
	} );

	// Mock the default function for config keys
	mockConfig.mockImplementation( ( key: string ) => {
		const configValues: Record< string, unknown > = {
			site_spec: {
				script_url: 'https://example.com/site-spec.js',
				css_url: 'https://example.com/style.css',
				agent_url: 'https://api.example.com/agent',
				agent_id: 'test-agent',
				build_site_url: 'https://example.com/build?spec_id=',
			},
		};
		return configValues[ key ];
	} );

	return mockConfig;
} );

describe( 'SiteSpec Utils', () => {
	let config: jest.MockedFunction< typeof import('@automattic/calypso-config').default >;

	beforeEach( () => {
		config = require( '@automattic/calypso-config' );
		config.isEnabled.mockReset();
	} );

	describe( 'isSiteSpecEnabled', () => {
		it( 'should return true when feature flag is enabled', () => {
			config.isEnabled.mockReturnValue( true );
			expect( isSiteSpecEnabled() ).toBe( true );
			expect( config.isEnabled ).toHaveBeenCalledWith( 'site-spec' );
		} );

		it( 'should return false when feature flag is disabled', () => {
			config.isEnabled.mockReturnValue( false );
			expect( isSiteSpecEnabled() ).toBe( false );
		} );
	} );

	describe( 'getSiteSpecUrl', () => {
		it( 'should return the configured script URL by default', () => {
			const url = getSiteSpecUrl();
			expect( url ).toBe( 'https://example.com/site-spec.js' );
			expect( config ).toHaveBeenCalledWith( 'site_spec' );
		} );

		it( 'should return the configured script URL when script_url is requested', () => {
			const url = getSiteSpecUrl( 'script_url' );
			expect( url ).toBe( 'https://example.com/site-spec.js' );
			expect( config ).toHaveBeenCalledWith( 'site_spec' );
		} );

		it( 'should return the configured CSS URL when css_url is requested', () => {
			const url = getSiteSpecUrl( 'css_url' );
			expect( url ).toBe( 'https://example.com/style.css' );
			expect( config ).toHaveBeenCalledWith( 'site_spec' );
		} );

		it( 'should return null when URL is not configured', () => {
			config.mockReturnValueOnce( undefined );
			expect( getSiteSpecUrl() ).toBe( null );
		} );

		it( 'should return null when specific URL key is not configured', () => {
			config.mockReturnValueOnce( { script_url: 'https://example.com/script.js' } );
			const url = getSiteSpecUrl( 'css_url' );
			expect( url ).toBe( null );
		} );
	} );

	describe( 'getSiteSpecUrlByType', () => {
		it( 'should return script URL when type is script', () => {
			const url = getSiteSpecUrlByType( 'script' );
			expect( url ).toBe( 'https://example.com/site-spec.js' );
			expect( config ).toHaveBeenCalledWith( 'site_spec' );
		} );

		it( 'should return CSS URL when type is css', () => {
			const url = getSiteSpecUrlByType( 'css' );
			expect( url ).toBe( 'https://example.com/style.css' );
			expect( config ).toHaveBeenCalledWith( 'site_spec' );
		} );

		it( 'should return null when script URL is not configured', () => {
			config.mockReturnValueOnce( { css_url: 'https://example.com/style.css' } );
			const url = getSiteSpecUrlByType( 'script' );
			expect( url ).toBe( null );
		} );

		it( 'should return null when CSS URL is not configured', () => {
			config.mockReturnValueOnce( { script_url: 'https://example.com/script.js' } );
			const url = getSiteSpecUrlByType( 'css' );
			expect( url ).toBe( null );
		} );
	} );

	describe( 'getSiteSpecConfig', () => {
		it( 'should return configuration object with all values', () => {
			config.mockReturnValueOnce( {
				agent_url: 'https://api.example.com/agent',
				agent_id: 'test-agent-id',
				build_site_url: 'https://example.com/build?spec_id=',
			} );

			const result = getSiteSpecConfig();

			expect( result ).toEqual( {
				agentUrl: 'https://api.example.com/agent',
				agentId: 'test-agent-id',
				buildSiteUrl: 'https://example.com/build?spec_id=',
			} );
		} );

		it( 'should return empty object when config is undefined', () => {
			config.mockReturnValueOnce( undefined );
			const result = getSiteSpecConfig();
			expect( result ).toEqual( {} );
		} );

		it( 'should return partial configuration when some values are missing', () => {
			config.mockReturnValueOnce( {
				agent_id: 'test-agent-id',
				// Missing agent_url and build_site_url
			} );

			const result = getSiteSpecConfig();

			expect( result ).toEqual( {
				agentId: 'test-agent-id',
			} );
		} );
	} );
} );
