import { isSiteSpecEnabled, getSiteSpecUrl, getSiteSpecCssUrl, getSiteSpecConfig } from '../utils';

// Mock the calypso-config module
jest.mock( '@automattic/calypso-config', () => {
	const mockConfig = jest.fn();

	// Mock the isEnabled method
	mockConfig.isEnabled = jest.fn( ( feature ) => {
		if ( feature === 'site-spec' ) {
			return true;
		}
		return false;
	} );

	// Mock the default function for config keys
	mockConfig.mockImplementation( ( key ) => {
		const configValues = {
			site_spec: {
				url: 'https://example.com/site-spec.js',
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
	let config;

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
		it( 'should return the configured URL', () => {
			const url = getSiteSpecUrl();
			expect( url ).toBe( 'https://example.com/site-spec.js' );
			expect( config ).toHaveBeenCalledWith( 'site_spec' );
		} );

		it( 'should return null when URL is not configured', () => {
			config.mockReturnValueOnce( undefined );
			expect( getSiteSpecUrl() ).toBe( null );
		} );
	} );

	describe( 'getSiteSpecCssUrl', () => {
		it( 'should return the configured CSS URL', () => {
			const url = getSiteSpecCssUrl();
			expect( url ).toBe( 'https://example.com/style.css' );
			expect( config ).toHaveBeenCalledWith( 'site_spec' );
		} );

		it( 'should return null when CSS URL is not configured', () => {
			config.mockReturnValue( null );
			const url = getSiteSpecCssUrl();
			expect( url ).toBeNull();
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
	} );
} );
