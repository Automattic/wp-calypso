/**
 * @vitest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { renderHook } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import useWPAdminTheme from '../use-wp-admin-theme';

vi.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	default: { isEnabled: vi.fn() },
} ) );

const mockIsEnabled = config.isEnabled as Mock;

describe( 'useWPAdminTheme', () => {
	beforeEach( () => {
		document.body.className = '';
		mockIsEnabled.mockReturnValue( true );
	} );

	it( 'returns null when not running in wp-admin', () => {
		mockIsEnabled.mockReturnValue( false );
		document.body.className = 'admin-color-midnight';

		const { result } = renderHook( () => useWPAdminTheme() );

		expect( result.current ).toBeNull();
	} );

	it( 'maps the admin colour scheme body class to a Calypso scheme class', () => {
		document.body.className = 'wp-admin admin-color-midnight';

		const { result } = renderHook( () => useWPAdminTheme() );

		expect( result.current ).toBe( 'is-midnight' );
	} );

	it( 'maps the default fresh scheme rather than forcing Jetpack colours', () => {
		document.body.className = 'wp-admin admin-color-fresh';

		const { result } = renderHook( () => useWPAdminTheme() );

		expect( result.current ).toBe( 'is-fresh' );
	} );

	it( 'returns null when no admin colour class is present', () => {
		document.body.className = 'wp-admin';

		const { result } = renderHook( () => useWPAdminTheme() );

		expect( result.current ).toBeNull();
	} );
} );
