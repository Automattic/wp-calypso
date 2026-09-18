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

	it( 'loads Agents Manager on site home', () => {
		const { result } = renderHook( () => useShouldLoadAgentsManager( 'home' ) );

		expect( result.current ).toBe( true );
	} );

	it( 'does not load Agents Manager when the feature is disabled', () => {
		mockedIsEnabled.mockReturnValue( false );
		const { result } = renderHook( () => useShouldLoadAgentsManager( 'home' ) );

		expect( result.current ).toBe( false );
	} );

	it.each( [ 'help', 'plugins', 'reader', undefined, null ] )(
		'does not load Agents Manager for %s',
		( sectionName ) => {
			const { result } = renderHook( () => useShouldLoadAgentsManager( sectionName ) );

			expect( result.current ).toBe( false );
		}
	);
} );
