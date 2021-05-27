/**
 * @jest-environment node
 */
/**
 * External dependencies
 */
import { act, renderHook } from '@testing-library/react-hooks';

/**
 * Internal dependencies
 */
import { useLocalStorage } from '../';

// We don't want `useLocalStorage` to break components that are running in tests
test( 'behaves like useState when window is undefined', () => {
	const { result } = renderHook( () => useLocalStorage( 'key', 113 ) );
	const updateState = result.current[ 1 ];

	expect( result.current[ 0 ] ).toBe( 113 );

	act( () => updateState( 114 ) );

	expect( result.current[ 0 ] ).toBe( 114 );
} );
