/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import {
	ClassicColorSchemeProvider,
	PREFERENCE_KEY,
	withColorScheme,
} from 'calypso/lib/color-scheme';

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

describe( 'ClassicColorSchemeProvider', () => {
	beforeEach( () => {
		delete document.documentElement.dataset.theme;
	} );

	test( 'renders children', () => {
		renderWithStore(
			buildState(),
			<ClassicColorSchemeProvider>
				<span>child</span>
			</ClassicColorSchemeProvider>
		);
		expect( screen.getByText( 'child' ) ).toBeVisible();
	} );

	test( 'does not write data-theme until remote preferences are received', () => {
		renderWithStore(
			buildState( { received: false } ),
			<ClassicColorSchemeProvider>
				<span>child</span>
			</ClassicColorSchemeProvider>
		);
		expect( document.documentElement.dataset.theme ).toBeUndefined();
	} );

	test( 'falls back to light when no scheme is saved', () => {
		renderWithStore(
			buildState(),
			<ClassicColorSchemeProvider>
				<span>child</span>
			</ClassicColorSchemeProvider>
		);
		expect( document.documentElement.dataset.theme ).toBe( 'light' );
	} );

	test( 'falls back to light for invalid saved values', () => {
		renderWithStore(
			buildState( { scheme: 'neon' } ),
			<ClassicColorSchemeProvider>
				<span>child</span>
			</ClassicColorSchemeProvider>
		);
		expect( document.documentElement.dataset.theme ).toBe( 'light' );
	} );

	test( 'applies saved dark scheme', () => {
		renderWithStore(
			buildState( { scheme: 'dark' } ),
			<ClassicColorSchemeProvider>
				<span>child</span>
			</ClassicColorSchemeProvider>
		);
		expect( document.documentElement.dataset.theme ).toBe( 'dark' );
	} );

	test( 'applies saved system scheme', () => {
		renderWithStore(
			buildState( { scheme: 'system' } ),
			<ClassicColorSchemeProvider>
				<span>child</span>
			</ClassicColorSchemeProvider>
		);
		expect( document.documentElement.dataset.theme ).toBe( 'system' );
	} );

	test( 'removes data-theme when unmounted if there was no previous value', () => {
		const { unmount } = renderWithStore(
			buildState( { scheme: 'dark' } ),
			<ClassicColorSchemeProvider>
				<span>child</span>
			</ClassicColorSchemeProvider>
		);

		unmount();

		expect( document.documentElement.dataset.theme ).toBeUndefined();
	} );

	test( 'restores the previous data-theme value when unmounted', () => {
		document.documentElement.dataset.theme = 'light';
		const { unmount } = renderWithStore(
			buildState( { scheme: 'dark' } ),
			<ClassicColorSchemeProvider>
				<span>child</span>
			</ClassicColorSchemeProvider>
		);

		unmount();

		expect( document.documentElement.dataset.theme ).toBe( 'light' );
	} );

	test( 'restores the data-theme value from when the provider first applies a scheme', () => {
		const children = (
			<ClassicColorSchemeProvider>
				<span>child</span>
			</ClassicColorSchemeProvider>
		);
		const { rerender, unmount } = renderWithStore( buildState( { received: false } ), children );

		document.documentElement.dataset.theme = 'system';

		rerender(
			<Provider store={ mockStore( buildState( { scheme: 'dark' } ) ) }>{ children }</Provider>
		);
		expect( document.documentElement.dataset.theme ).toBe( 'dark' );

		unmount();

		expect( document.documentElement.dataset.theme ).toBe( 'system' );
	} );
} );

describe( 'withColorScheme', () => {
	beforeEach( () => {
		delete document.documentElement.dataset.theme;
		document.body.classList.remove( 'is-themes-dark-mode' );
	} );

	test( 'returns children unchanged on site routes (no provider, no body class)', () => {
		renderWithStore(
			buildState( { scheme: 'dark' } ),
			withColorScheme( <span>child</span>, {
				bodyClass: 'is-themes-dark-mode',
				enabled: false,
				Provider: ClassicColorSchemeProvider,
			} )
		);
		expect( screen.getByText( 'child' ) ).toBeVisible();
		expect( document.documentElement.dataset.theme ).toBeUndefined();
		expect( document.body.classList.contains( 'is-themes-dark-mode' ) ).toBe( false );
	} );

	test( 'returns children unchanged for logged-out users (no provider, no body class)', () => {
		renderWithStore(
			buildState( { scheme: 'dark' } ),
			withColorScheme( <span>child</span>, {
				bodyClass: 'is-themes-dark-mode',
				enabled: false,
				Provider: ClassicColorSchemeProvider,
			} )
		);
		expect( screen.getByText( 'child' ) ).toBeVisible();
		expect( document.documentElement.dataset.theme ).toBeUndefined();
		expect( document.body.classList.contains( 'is-themes-dark-mode' ) ).toBe( false );
	} );

	test( 'wraps children with provider and body class for logged-in non-site routes', () => {
		const { unmount } = renderWithStore(
			buildState( { scheme: 'dark' } ),
			withColorScheme( <span>child</span>, {
				bodyClass: 'is-themes-dark-mode',
				enabled: true,
				Provider: ClassicColorSchemeProvider,
			} )
		);
		expect( screen.getByText( 'child' ) ).toBeVisible();
		expect( document.documentElement.dataset.theme ).toBe( 'dark' );
		expect( document.body.classList.contains( 'is-themes-dark-mode' ) ).toBe( true );

		unmount();

		expect( document.body.classList.contains( 'is-themes-dark-mode' ) ).toBe( false );
	} );

	test( 'keeps the body class effect stable across re-renders', () => {
		const store = mockStore( buildState( { scheme: 'dark' } ) );
		const addClass = jest.spyOn( document.body.classList, 'add' );
		const removeClass = jest.spyOn( document.body.classList, 'remove' );
		const renderWrappedColorScheme = () => (
			<Provider store={ store }>
				{ withColorScheme( <span>child</span>, {
					bodyClass: 'is-themes-dark-mode',
					enabled: true,
					Provider: ClassicColorSchemeProvider,
				} ) }
			</Provider>
		);

		const { rerender, unmount } = render( renderWrappedColorScheme() );

		expect( document.body.classList.contains( 'is-themes-dark-mode' ) ).toBe( true );
		expect( addClass ).toHaveBeenCalledWith( 'is-themes-dark-mode' );

		addClass.mockClear();
		removeClass.mockClear();
		rerender( renderWrappedColorScheme() );

		expect( addClass ).not.toHaveBeenCalled();
		expect( removeClass ).not.toHaveBeenCalled();

		unmount();
		addClass.mockRestore();
		removeClass.mockRestore();
	} );
} );
