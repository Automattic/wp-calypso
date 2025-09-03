import { isSiteSpecEnabled, getSiteSpecUrl, getSiteSpecConfig } from '../utils';

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
			site_spec_url: 'https://example.com/site-spec.js',
			site_spec_agent_url: 'https://api.example.com/agent',
			site_spec_agent_id: 'test-agent',
			site_spec_build_site_url: 'https://example.com/build?spec_id=',
		};
		return configValues[ key ];
	} );

	return mockConfig;
} );

describe( 'SiteSpec Utils', () => {
	let config;

	beforeEach( () => {
		config = require( '@automattic/calypso-config' );
		config.mockReset();
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
		it( 'should return URL when feature flag is enabled', () => {
			config.isEnabled.mockReturnValue( true );
			config.mockReturnValueOnce( 'https://example.com/site-spec.js' );
			expect( getSiteSpecUrl() ).toBe( 'https://example.com/site-spec.js' );
		} );

		it( 'should return null when feature flag is disabled', () => {
			config.isEnabled.mockReturnValue( false );
			expect( getSiteSpecUrl() ).toBe( null );
		} );

		it( 'should return null when URL is not configured', () => {
			config.isEnabled.mockReturnValue( true );
			config.mockReturnValueOnce( undefined );
			expect( getSiteSpecUrl() ).toBe( null );
		} );
	} );

	describe( 'getSiteSpecConfig', () => {
		it( 'should return configuration object with all values', () => {
			config
				.mockReturnValueOnce( 'https://api.example.com/agent' ) // site_spec_agent_url
				.mockReturnValueOnce( 'test-agent-id' ) // site_spec_agent_id
				.mockReturnValueOnce( 'https://example.com/build?spec_id=' ); // site_spec_build_site_url

			const result = getSiteSpecConfig();

			expect( result ).toEqual( {
				agentUrl: 'https://api.example.com/agent',
				agentId: 'test-agent-id',
				buildSiteUrl: 'https://example.com/build?spec_id=',
			} );
		} );
	} );
} );
