/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { renderHook } from '@testing-library/react';
import useShouldLoadAgentsManager from '../use-should-load-agents-manager';

jest.mock( '@automattic/calypso-config', () => jest.fn() );

const mockedConfig = jest.mocked( config );

describe( 'useShouldLoadAgentsManager', () => {
	beforeEach( () => {
		mockedConfig.mockReturnValue( 'stage' );
	} );

	it( 'loads Agents Manager on site home', () => {
		const { result } = renderHook( () => useShouldLoadAgentsManager( 'home' ) );

		expect( result.current ).toBe( true );
	} );

	it.each( [ 'production', 'development', 'horizon' ] )(
		'does not load Agents Manager in the %s environment',
		( environment ) => {
			mockedConfig.mockReturnValue( environment );
			const { result } = renderHook( () => useShouldLoadAgentsManager( 'home' ) );

			expect( result.current ).toBe( false );
		}
	);

	it.each( [ 'help', 'plugins', 'reader', undefined, null ] )(
		'does not load Agents Manager for %s',
		( sectionName ) => {
			const { result } = renderHook( () => useShouldLoadAgentsManager( sectionName ) );

			expect( result.current ).toBe( false );
		}
	);
} );
