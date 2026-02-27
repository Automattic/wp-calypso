/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { renderHook } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { useIsThemeShowcaseModernEnabled } from '../use-is-theme-showcase-modern-enabled';

jest.mock( '@automattic/calypso-config', () => {
	const original = jest.requireActual( '@automattic/calypso-config' );
	return {
		...original,
		isEnabled: jest.fn(),
	};
} );

jest.mock( 'react-redux', () => ( {
	useSelector: jest.fn(),
} ) );

describe( 'useIsThemeShowcaseModernEnabled', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'returns true when feature flag is on and user is logged out', () => {
		( config.isEnabled as jest.Mock ).mockReturnValue( true );
		( useSelector as unknown as jest.Mock ).mockImplementation( ( selector ) =>
			selector( { currentUser: { id: null } } )
		);
		const { result } = renderHook( () => useIsThemeShowcaseModernEnabled() );
		expect( result.current ).toBe( true );
	} );

	test( 'returns false when feature flag is off', () => {
		( config.isEnabled as jest.Mock ).mockReturnValue( false );
		( useSelector as unknown as jest.Mock ).mockImplementation( ( selector ) =>
			selector( { currentUser: { id: null } } )
		);
		const { result } = renderHook( () => useIsThemeShowcaseModernEnabled() );
		expect( result.current ).toBe( false );
	} );

	test( 'returns false when user is logged in', () => {
		( config.isEnabled as jest.Mock ).mockReturnValue( true );
		( useSelector as unknown as jest.Mock ).mockImplementation( ( selector ) =>
			selector( { currentUser: { id: 123, user: { ID: 123 } } } )
		);
		const { result } = renderHook( () => useIsThemeShowcaseModernEnabled() );
		expect( result.current ).toBe( false );
	} );
} );
