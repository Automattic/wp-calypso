/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { renderHook } from '@testing-library/react';
import useShouldLoadAgentsManager from '../use-should-load-agents-manager';

jest.mock( '@automattic/calypso-config', () => {
	const mockConfig = Object.assign( jest.fn(), { isEnabled: jest.fn() } );
	return mockConfig;
} );

const mockedIsEnabled = jest.mocked( config.isEnabled );

describe( 'useShouldLoadAgentsManager', () => {
	beforeEach( () => {
		mockedIsEnabled.mockReturnValue( true );
	} );

	it( 'loads Agents Manager on a site overview', () => {
		const { result } = renderHook( () =>
			useShouldLoadAgentsManager( 'sites-dashboard', '/sites/example.wordpress.com' )
		);

		expect( result.current ).toBe( true );
	} );

	it( 'does not load Agents Manager when the feature is disabled', () => {
		mockedIsEnabled.mockReturnValue( false );
		const { result } = renderHook( () =>
			useShouldLoadAgentsManager( 'sites-dashboard', '/sites/example.wordpress.com' )
		);

		expect( result.current ).toBe( false );
	} );

	it.each( [
		[ 'sites-dashboard', '/sites' ],
		[ 'sites-dashboard', '/sites/example.wordpress.com/settings' ],
		[ 'home', '/home/example.wordpress.com' ],
		[ 'help', '/help' ],
		[ undefined, '/sites/example.wordpress.com' ],
		[ 'sites-dashboard', null ],
	] )( 'does not load Agents Manager for %s at %s', ( sectionName, currentRoute ) => {
		const { result } = renderHook( () => useShouldLoadAgentsManager( sectionName, currentRoute ) );

		expect( result.current ).toBe( false );
	} );
} );
