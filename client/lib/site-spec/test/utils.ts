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
import config from '@automattic/calypso-config';
import {
	isSiteSpecEnabled,
	getSiteSpecUrl,
	getSiteSpecUrlByType,
	getDefaultSiteSpecConfig,
	getEarlyProvisionSiteSpecConfig,
	getBuildWowSiteSpecConfig,
} from '../utils';

interface MockWithIsEnabled extends jest.Mock {
	isEnabled: jest.Mock;
}

jest.mock( '@automattic/calypso-config', () => {
	const mockFn: MockWithIsEnabled = jest.fn() as MockWithIsEnabled;
	mockFn.isEnabled = jest.fn();
	return mockFn;
} );

describe( 'SiteSpec Utils', () => {
	const mockConfig = config as unknown as MockWithIsEnabled;

	beforeEach( () => {
		// Reset all mocks
		jest.clearAllMocks();

		// Setup default mock implementations
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

		mockConfig.isEnabled.mockImplementation( ( feature: string ) => {
			return feature === 'site-spec';
		} );
	} );

	describe( 'isSiteSpecEnabled', () => {
		it( 'should return true when feature flag is enabled', () => {
			mockConfig.isEnabled.mockReturnValue( true );
			expect( isSiteSpecEnabled() ).toBe( true );
			expect( mockConfig.isEnabled ).toHaveBeenCalledWith( 'site-spec' );
		} );

		it( 'should return false when feature flag is disabled', () => {
			mockConfig.isEnabled.mockReturnValue( false );
			expect( isSiteSpecEnabled() ).toBe( false );
		} );
	} );

	describe( 'getSiteSpecUrl', () => {
		it( 'should return the configured script URL by default', () => {
			const url = getSiteSpecUrl();
			expect( url ).toBe( 'https://example.com/site-spec.js' );
			expect( mockConfig ).toHaveBeenCalledWith( 'site_spec' );
		} );

		it( 'should return the configured script URL when script_url is requested', () => {
			const url = getSiteSpecUrl( 'script_url' );
			expect( url ).toBe( 'https://example.com/site-spec.js' );
			expect( mockConfig ).toHaveBeenCalledWith( 'site_spec' );
		} );

		it( 'should return the configured CSS URL when css_url is requested', () => {
			const url = getSiteSpecUrl( 'css_url' );
			expect( url ).toBe( 'https://example.com/style.css' );
			expect( mockConfig ).toHaveBeenCalledWith( 'site_spec' );
		} );

		it( 'should return null when URL is not configured', () => {
			mockConfig.mockReturnValueOnce( undefined );
			expect( getSiteSpecUrl() ).toBe( null );
		} );

		it( 'should return null when specific URL key is not configured', () => {
			mockConfig.mockReturnValueOnce( { script_url: 'https://example.com/script.js' } );
			const url = getSiteSpecUrl( 'css_url' );
			expect( url ).toBe( null );
		} );
	} );

	describe( 'getSiteSpecUrlByType', () => {
		it( 'should return script URL when type is script', () => {
			const url = getSiteSpecUrlByType( 'script' );
			expect( url ).toBe( 'https://example.com/site-spec.js' );
			expect( mockConfig ).toHaveBeenCalledWith( 'site_spec' );
		} );

		it( 'should return CSS URL when type is css', () => {
			const url = getSiteSpecUrlByType( 'css' );
			expect( url ).toBe( 'https://example.com/style.css' );
			expect( mockConfig ).toHaveBeenCalledWith( 'site_spec' );
		} );

		it( 'should return null when script URL is not configured', () => {
			mockConfig.mockReturnValueOnce( { css_url: 'https://example.com/style.css' } );
			const url = getSiteSpecUrlByType( 'script' );
			expect( url ).toBe( null );
		} );

		it( 'should return null when CSS URL is not configured', () => {
			mockConfig.mockReturnValueOnce( { script_url: 'https://example.com/script.js' } );
			const url = getSiteSpecUrlByType( 'css' );
			expect( url ).toBe( null );
		} );
	} );

	describe( 'getDefaultSiteSpecConfig', () => {
		it( 'should return configuration object with all values including tracking', () => {
			mockConfig.mockReturnValueOnce( {
				agent_url: 'https://api.example.com/agent',
				agent_id: 'test-agent-id',
				build_site_url: 'https://example.com/build?spec_id=',
			} );

			const result = getDefaultSiteSpecConfig();

			expect( result ).toEqual( {
				agentUrl: 'https://api.example.com/agent',
				agentId: 'test-agent-id',
				buildSiteUrl: 'https://example.com/build?spec_id=',
				tracking: {
					enabled: true,
					prefix: 'jetpack_calypso',
					getOverrides: expect.any( Function ),
				},
			} );
		} );

		it( 'should return empty object when config is undefined', () => {
			mockConfig.mockReturnValueOnce( undefined );
			const result = getDefaultSiteSpecConfig();
			expect( result ).toEqual( {} );
		} );

		it( 'should return partial configuration when some values are missing', () => {
			mockConfig.mockReturnValueOnce( {
				agent_id: 'test-agent-id',
				// Missing agent_url and build_site_url
			} );

			const result = getDefaultSiteSpecConfig();

			expect( result ).toEqual( {
				agentId: 'test-agent-id',
				tracking: {
					enabled: true,
					prefix: 'jetpack_calypso',
					getOverrides: expect.any( Function ),
				},
			} );
		} );

		it( 'should always include tracking configuration with correct values', () => {
			mockConfig.mockReturnValueOnce( {} );

			const result = getDefaultSiteSpecConfig();

			expect( result.tracking ).toEqual( {
				enabled: true,
				prefix: 'jetpack_calypso',
				getOverrides: expect.any( Function ),
			} );

			// Test that getOverrides function returns expected values
			const overrides = result.tracking?.getOverrides?.( 'test-event' );
			expect( overrides ).toEqual( {
				client: 'calypso',
			} );
		} );
	} );

	describe( 'getEarlyProvisionSiteSpecConfig', () => {
		it( 'should route confirmed specs back through the WPCOM Atomic Site Spec flow', () => {
			const result = getEarlyProvisionSiteSpecConfig();

			expect( result ).toMatchObject( {
				agentUrl: 'https://api.example.com/agent',
				agentId: 'test-agent',
				buildSiteUrl:
					'/setup/ai-site-builder-spec/site-spec?provision_target=wpcom-atomic&spec_id=',
			} );
		} );
	} );

	describe( 'getBuildWowSiteSpecConfig', () => {
		it( 'should route confirmed specs through the build-wow Site Spec flow', () => {
			const result = getBuildWowSiteSpecConfig( {
				siteSlug: 'example.wordpress.com',
				siteId: 123,
				ref: 'referrer',
				source: 'vega',
			} );
			const buildSiteUrl = new URL( result.buildSiteUrl ?? '', 'https://wordpress.com' );

			expect( buildSiteUrl.pathname ).toBe( '/setup/ai-site-builder-spec/site-spec' );
			expect( buildSiteUrl.searchParams.get( 'build_wow' ) ).toBe( '1' );
			expect( buildSiteUrl.searchParams.get( 'siteSlug' ) ).toBe( 'example.wordpress.com' );
			expect( buildSiteUrl.searchParams.get( 'siteId' ) ).toBe( '123' );
			expect( buildSiteUrl.searchParams.get( 'ref' ) ).toBe( 'referrer' );
			expect( buildSiteUrl.searchParams.get( 'source' ) ).toBe( 'vega' );
			expect( result.buildSiteUrl ).toContain( 'spec_id=' );
		} );
	} );
} );
