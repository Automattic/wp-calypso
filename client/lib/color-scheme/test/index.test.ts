/**
 * @jest-environment jsdom
 */

import { COLOR_SCHEME_STORAGE_KEY, readStoredColorScheme, updateColorSchemePreference } from '..';

describe( 'color scheme storage', () => {
	beforeEach( () => {
		window.localStorage.clear();
		delete document.documentElement.dataset.theme;
	} );

	it( 'falls back to light when no valid stored scheme exists', () => {
		expect( readStoredColorScheme() ).toBe( 'light' );

		window.localStorage.setItem( COLOR_SCHEME_STORAGE_KEY, 'invalid' );

		expect( readStoredColorScheme() ).toBe( 'light' );
	} );

	it( 'updates local storage and the document theme', () => {
		updateColorSchemePreference( 'dark' );

		expect( window.localStorage.getItem( COLOR_SCHEME_STORAGE_KEY ) ).toBe( 'dark' );
		expect( document.documentElement.dataset.theme ).toBe( 'dark' );
	} );
} );
