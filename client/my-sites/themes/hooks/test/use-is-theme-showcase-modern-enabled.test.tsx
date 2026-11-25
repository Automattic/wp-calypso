/**
 * @vitest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { renderHook } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { type Mock, vi } from 'vitest';
import { useIsThemeShowcaseModernEnabled } from '../use-is-theme-showcase-modern-enabled';

vi.mock( '@automattic/calypso-config', async () => {
	const original = await vi.importActual< typeof import( '@automattic/calypso-config' ) >(
		'@automattic/calypso-config'
	);
	const config = Object.assign( ( key: string ) => original.default( key ), {
		...original.default,
		isEnabled: vi.fn(),
	} );
	return { ...config, default: config };
} );

vi.mock( 'react-redux', () => ( {
	useSelector: vi.fn(),
} ) );

describe( 'useIsThemeShowcaseModernEnabled', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );

	test( 'returns true when feature flag is on and user is logged out', () => {
		( config.isEnabled as Mock ).mockReturnValue( true );
		( useSelector as unknown as Mock ).mockImplementation( ( selector ) =>
			selector( { currentUser: { id: null } } )
		);
		const { result } = renderHook( () => useIsThemeShowcaseModernEnabled() );
		expect( result.current ).toBe( true );
	} );

	test( 'returns false when feature flag is off', () => {
		( config.isEnabled as Mock ).mockReturnValue( false );
		( useSelector as unknown as Mock ).mockImplementation( ( selector ) =>
			selector( { currentUser: { id: null } } )
		);
		const { result } = renderHook( () => useIsThemeShowcaseModernEnabled() );
		expect( result.current ).toBe( false );
	} );

	test( 'returns false when user is logged in', () => {
		( config.isEnabled as Mock ).mockReturnValue( true );
		( useSelector as unknown as Mock ).mockImplementation( ( selector ) =>
			selector( { currentUser: { id: 123, user: { ID: 123 } } } )
		);
		const { result } = renderHook( () => useIsThemeShowcaseModernEnabled() );
		expect( result.current ).toBe( false );
	} );
} );
