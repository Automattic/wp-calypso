/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { PREFERENCE_KEY } from 'calypso/dashboard/app/color-scheme';
import ThemesColorSchemeProvider, { withThemesColorScheme } from '../color-scheme-provider';

const mockStore = configureStore();

function buildRemoteValues( { received, scheme } ) {
	if ( ! received ) {
		return null;
	}
	return scheme === undefined ? {} : { [ PREFERENCE_KEY ]: scheme };
}

function buildState( { received = true, scheme } = {} ) {
	return {
		preferences: {
			remoteValues: buildRemoteValues( { received, scheme } ),
			localValues: {},
			fetching: false,
			saving: false,
			lastFetchedTimestamp: null,
		},
	};
}

function renderWithStore( state, ui ) {
	const store = mockStore( state );
	return render( <Provider store={ store }>{ ui }</Provider> );
}

describe( 'ThemesColorSchemeProvider', () => {
	beforeEach( () => {
		delete document.documentElement.dataset.theme;
	} );

	test( 'renders children', () => {
		renderWithStore(
			buildState(),
			<ThemesColorSchemeProvider>
				<span>child</span>
			</ThemesColorSchemeProvider>
		);
		expect( screen.getByText( 'child' ) ).toBeVisible();
	} );

	test( 'does not write data-theme until remote preferences are received', () => {
		renderWithStore(
			buildState( { received: false } ),
			<ThemesColorSchemeProvider>
				<span>child</span>
			</ThemesColorSchemeProvider>
		);
		expect( document.documentElement.dataset.theme ).toBeUndefined();
	} );

	test( 'falls back to light when no scheme is saved', () => {
		renderWithStore(
			buildState(),
			<ThemesColorSchemeProvider>
				<span>child</span>
			</ThemesColorSchemeProvider>
		);
		expect( document.documentElement.dataset.theme ).toBe( 'light' );
	} );

	test( 'falls back to light for invalid saved values', () => {
		renderWithStore(
			buildState( { scheme: 'neon' } ),
			<ThemesColorSchemeProvider>
				<span>child</span>
			</ThemesColorSchemeProvider>
		);
		expect( document.documentElement.dataset.theme ).toBe( 'light' );
	} );

	test( 'applies saved dark scheme', () => {
		renderWithStore(
			buildState( { scheme: 'dark' } ),
			<ThemesColorSchemeProvider>
				<span>child</span>
			</ThemesColorSchemeProvider>
		);
		expect( document.documentElement.dataset.theme ).toBe( 'dark' );
	} );

	test( 'applies saved system scheme', () => {
		renderWithStore(
			buildState( { scheme: 'system' } ),
			<ThemesColorSchemeProvider>
				<span>child</span>
			</ThemesColorSchemeProvider>
		);
		expect( document.documentElement.dataset.theme ).toBe( 'system' );
	} );

	test( 'removes data-theme when unmounted if there was no previous value', () => {
		const { unmount } = renderWithStore(
			buildState( { scheme: 'dark' } ),
			<ThemesColorSchemeProvider>
				<span>child</span>
			</ThemesColorSchemeProvider>
		);

		unmount();

		expect( document.documentElement.dataset.theme ).toBeUndefined();
	} );

	test( 'restores the previous data-theme value when unmounted', () => {
		document.documentElement.dataset.theme = 'light';
		const { unmount } = renderWithStore(
			buildState( { scheme: 'dark' } ),
			<ThemesColorSchemeProvider>
				<span>child</span>
			</ThemesColorSchemeProvider>
		);

		unmount();

		expect( document.documentElement.dataset.theme ).toBe( 'light' );
	} );
} );

describe( 'withThemesColorScheme', () => {
	beforeEach( () => {
		delete document.documentElement.dataset.theme;
	} );

	test( 'returns children unchanged on site routes (no provider, no body class)', () => {
		renderWithStore(
			buildState( { scheme: 'dark' } ),
			withThemesColorScheme( <span>child</span>, { isSiteRoute: true, isLoggedIn: true } )
		);
		expect( screen.getByText( 'child' ) ).toBeVisible();
		expect( document.documentElement.dataset.theme ).toBeUndefined();
		expect( document.body.classList.contains( 'is-themes-dark-mode' ) ).toBe( false );
	} );

	test( 'returns children unchanged for logged-out users (no provider, no body class)', () => {
		renderWithStore(
			buildState( { scheme: 'dark' } ),
			withThemesColorScheme( <span>child</span>, { isSiteRoute: false, isLoggedIn: false } )
		);
		expect( screen.getByText( 'child' ) ).toBeVisible();
		expect( document.documentElement.dataset.theme ).toBeUndefined();
		expect( document.body.classList.contains( 'is-themes-dark-mode' ) ).toBe( false );
	} );

	test( 'wraps children with provider and body class for logged-in non-site routes', () => {
		renderWithStore(
			buildState( { scheme: 'dark' } ),
			withThemesColorScheme( <span>child</span>, { isSiteRoute: false, isLoggedIn: true } )
		);
		expect( screen.getByText( 'child' ) ).toBeVisible();
		expect( document.documentElement.dataset.theme ).toBe( 'dark' );
		expect( document.body.classList.contains( 'is-themes-dark-mode' ) ).toBe( true );
	} );
} );
