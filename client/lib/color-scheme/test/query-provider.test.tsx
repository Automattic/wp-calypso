/**
 * @jest-environment jsdom
 */

import { queryClient } from '@automattic/api-queries';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { ColorSchemeProvider, useColorScheme, withColorScheme } from 'calypso/lib/color-scheme';
import type { ColorScheme } from 'calypso/lib/color-scheme';

const PREFERENCE_KEY = 'hosting-dashboard-color-scheme';
const API_BASE = 'https://public-api.wordpress.com';
const PREFERENCES_PATH = '/rest/v1.1/me/preferences';
const surfaceBodyClasses = [ 'is-reader-dark-mode', 'is-themes-dark-mode' ];

const mockUpdatePreference = jest.fn();
const mockOnSaveSuccess = jest.fn();

function mockGetPreferences(
	preferences: Record< string, unknown >,
	options: { status?: number; delay?: number } = {}
) {
	const { status = 200, delay = 0 } = options;
	const scope = nock( API_BASE ).get( PREFERENCES_PATH );

	if ( delay ) {
		scope.delay( delay );
	}

	return scope.reply(
		status,
		status >= 400 ? { error: 'could_not_load_preferences' } : { calypso_preferences: preferences }
	);
}

function mockUpdateColorScheme(
	scheme: ColorScheme,
	options: { status?: number; delay?: number } = {}
) {
	const { status = 200, delay = 0 } = options;
	const scope = nock( API_BASE ).post( PREFERENCES_PATH, ( body ) => {
		mockUpdatePreference( body );
		expect( body ).toMatchObject( {
			calypso_preferences: {
				[ PREFERENCE_KEY ]: scheme,
			},
		} );
		return true;
	} );

	if ( delay ) {
		scope.delay( delay );
	}

	return scope.reply(
		status,
		status >= 400
			? { error: 'could_not_save_preferences' }
			: { calypso_preferences: { [ PREFERENCE_KEY ]: scheme } }
	);
}

function CurrentScheme() {
	const { colorScheme, setColorScheme } = useColorScheme();
	return (
		<div>
			<span data-testid="scheme">{ colorScheme }</span>
			<button onClick={ () => setColorScheme( 'light' ) } type="button">
				Light
			</button>
			<button
				onClick={ () =>
					setColorScheme( 'dark', {
						onSuccess: () => mockOnSaveSuccess( 'dark', colorScheme ),
					} )
				}
				type="button"
			>
				Dark
			</button>
			<button onClick={ () => setColorScheme( 'system' ) } type="button">
				System
			</button>
		</div>
	);
}

function renderColorSchemeProvider() {
	return render(
		<QueryClientProvider client={ queryClient }>
			<ColorSchemeProvider>
				<CurrentScheme />
			</ColorSchemeProvider>
		</QueryClientProvider>
	);
}

function renderWithColorScheme( bodyClass: string ) {
	return render(
		<QueryClientProvider client={ queryClient }>
			{ withColorScheme( <span>child</span>, { bodyClass } ) }
		</QueryClientProvider>
	);
}

function removeSurfaceBodyClasses() {
	surfaceBodyClasses.forEach( ( bodyClass ) => document.body.classList.remove( bodyClass ) );
}

beforeEach( () => {
	queryClient.clear();
	queryClient.setDefaultOptions( {
		queries: { retry: false },
	} );
	mockUpdatePreference.mockClear();
	mockOnSaveSuccess.mockClear();
	nock.cleanAll();
	document.documentElement.removeAttribute( 'data-theme' );
	removeSurfaceBodyClasses();
} );

afterEach( () => {
	nock.cleanAll();
	removeSurfaceBodyClasses();
} );

test( 'defaults to light when no server preference is available', async () => {
	mockGetPreferences( {} );

	renderColorSchemeProvider();

	await waitFor( () => {
		expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'light' );
		expect( document.documentElement.dataset.theme ).toBe( 'light' );
		expect( mockUpdatePreference ).not.toHaveBeenCalled();
		expect( mockOnSaveSuccess ).not.toHaveBeenCalled();
	} );
} );

test( 'defaults to light when the loaded server preference is invalid', async () => {
	mockGetPreferences( { [ PREFERENCE_KEY ]: 'blue' } );

	renderColorSchemeProvider();

	await waitFor( () => {
		expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'light' );
		expect( document.documentElement.dataset.theme ).toBe( 'light' );
		expect( mockUpdatePreference ).not.toHaveBeenCalled();
		expect( mockOnSaveSuccess ).not.toHaveBeenCalled();
	} );
} );

test( 'uses a valid loaded server preference', async () => {
	mockGetPreferences( { [ PREFERENCE_KEY ]: 'dark' } );

	renderColorSchemeProvider();

	await waitFor( () => {
		expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'dark' );
		expect( document.documentElement.dataset.theme ).toBe( 'dark' );
		expect( mockUpdatePreference ).not.toHaveBeenCalled();
		expect( mockOnSaveSuccess ).not.toHaveBeenCalled();
	} );
} );

test( 'waits for preferences before rendering when no cached preference is available', async () => {
	mockGetPreferences( { [ PREFERENCE_KEY ]: 'dark' }, { delay: 50 } );

	renderColorSchemeProvider();

	expect( screen.queryByTestId( 'scheme' ) ).not.toBeInTheDocument();

	await waitFor( () => {
		expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'dark' );
		expect( document.documentElement.dataset.theme ).toBe( 'dark' );
		expect( mockUpdatePreference ).not.toHaveBeenCalled();
		expect( mockOnSaveSuccess ).not.toHaveBeenCalled();
	} );
} );

test( 'uses cached preferences while the query refetches', async () => {
	const user = userEvent.setup();
	queryClient.setQueryData( [ 'me', 'preferences' ], { [ PREFERENCE_KEY ]: 'dark' } );
	mockGetPreferences( { [ PREFERENCE_KEY ]: 'dark' }, { delay: 50 } );

	renderColorSchemeProvider();

	expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'dark' );

	await user.click( screen.getByRole( 'button', { name: 'Dark' } ) );

	expect( mockUpdatePreference ).not.toHaveBeenCalled();
	expect( mockOnSaveSuccess ).not.toHaveBeenCalled();
} );

test( 'keeps cached preferences when the query refetch fails', async () => {
	queryClient.setQueryData( [ 'me', 'preferences' ], { [ PREFERENCE_KEY ]: 'dark' } );
	mockGetPreferences( {}, { status: 500 } );

	renderColorSchemeProvider();

	await waitFor( () => {
		expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'dark' );
		expect( document.documentElement.dataset.theme ).toBe( 'dark' );
		expect( mockUpdatePreference ).not.toHaveBeenCalled();
		expect( mockOnSaveSuccess ).not.toHaveBeenCalled();
	} );
} );

test( 'defaults to light when loading preferences fails without cached preferences', async () => {
	mockGetPreferences( {}, { status: 500 } );

	renderColorSchemeProvider();

	await waitFor( () => {
		expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'light' );
		expect( document.documentElement.dataset.theme ).toBe( 'light' );
		expect( mockUpdatePreference ).not.toHaveBeenCalled();
		expect( mockOnSaveSuccess ).not.toHaveBeenCalled();
	} );
} );

test( 'optimistically applies a user-initiated color scheme change', async () => {
	const user = userEvent.setup();
	mockGetPreferences( { [ PREFERENCE_KEY ]: 'light' } );
	mockUpdateColorScheme( 'dark', { delay: 50 } );

	renderColorSchemeProvider();

	await waitFor( () => expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'light' ) );

	await user.click( screen.getByRole( 'button', { name: 'Dark' } ) );

	await waitFor( () => {
		expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'dark' );
		expect( document.documentElement.dataset.theme ).toBe( 'dark' );
		expect( mockUpdatePreference ).toHaveBeenCalledTimes( 1 );
		expect( mockOnSaveSuccess ).not.toHaveBeenCalled();
	} );
} );

test( 'rolls back an optimistic color scheme change when saving fails', async () => {
	const user = userEvent.setup();
	mockGetPreferences( { [ PREFERENCE_KEY ]: 'light' } );
	mockUpdateColorScheme( 'dark', { status: 500 } );

	renderColorSchemeProvider();

	await waitFor( () => expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'light' ) );

	await user.click( screen.getByRole( 'button', { name: 'Dark' } ) );
	await waitFor( () => expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'dark' ) );

	await waitFor( () => {
		expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'light' );
		expect( mockOnSaveSuccess ).not.toHaveBeenCalled();
	} );
} );

test( 'ignores additional color scheme changes while a save is pending', async () => {
	const user = userEvent.setup();
	mockGetPreferences( { [ PREFERENCE_KEY ]: 'light' } );
	mockUpdateColorScheme( 'dark', { delay: 50 } );

	renderColorSchemeProvider();

	await waitFor( () => expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'light' ) );

	await user.click( screen.getByRole( 'button', { name: 'Dark' } ) );
	await waitFor( () => expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'dark' ) );

	await user.click( screen.getByRole( 'button', { name: 'System' } ) );

	expect( mockUpdatePreference ).toHaveBeenCalledTimes( 1 );
	expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'dark' );

	await waitFor( () => {
		expect( mockOnSaveSuccess ).toHaveBeenCalledTimes( 1 );
		expect( mockOnSaveSuccess ).toHaveBeenCalledWith( 'dark', 'light' );
		expect(
			queryClient.getQueryData< Record< string, unknown > >( [ 'me', 'preferences' ] )
		).toMatchObject( {
			[ PREFERENCE_KEY ]: 'dark',
		} );
	} );
} );

test( 'runs the success callback after saving a user-initiated color scheme change', async () => {
	const user = userEvent.setup();
	mockGetPreferences( { [ PREFERENCE_KEY ]: 'light' } );
	mockUpdateColorScheme( 'dark' );

	renderColorSchemeProvider();

	await waitFor( () => expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'light' ) );

	await user.click( screen.getByRole( 'button', { name: 'Dark' } ) );

	await waitFor( () => {
		expect( mockOnSaveSuccess ).toHaveBeenCalledWith( 'dark', 'light' );
	} );
} );

test( 'does not run the success callback after a failed color scheme change', async () => {
	const user = userEvent.setup();
	mockGetPreferences( { [ PREFERENCE_KEY ]: 'light' } );
	mockUpdateColorScheme( 'dark', { status: 500 } );

	renderColorSchemeProvider();

	await waitFor( () => expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'light' ) );

	await user.click( screen.getByRole( 'button', { name: 'Dark' } ) );

	await waitFor( () => {
		expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'light' );
		expect( mockOnSaveSuccess ).not.toHaveBeenCalled();
	} );
} );

test( 'does not save when selecting the current color scheme', async () => {
	const user = userEvent.setup();
	mockGetPreferences( { [ PREFERENCE_KEY ]: 'light' } );

	renderColorSchemeProvider();

	await waitFor( () => expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'light' ) );

	await user.click( screen.getByRole( 'button', { name: 'Light' } ) );

	expect( mockUpdatePreference ).not.toHaveBeenCalled();
	expect( mockOnSaveSuccess ).not.toHaveBeenCalled();
} );

describe.each( surfaceBodyClasses )( 'withColorScheme body class %s', ( bodyClass ) => {
	test( 'applies the dark scheme and cleans up the body class on unmount', async () => {
		mockGetPreferences( { [ PREFERENCE_KEY ]: 'dark' } );

		const { unmount } = renderWithColorScheme( bodyClass );

		await waitFor( () => {
			expect( screen.getByText( 'child' ) ).toBeVisible();
			expect( document.documentElement.dataset.theme ).toBe( 'dark' );
			expect( document.body.classList.contains( bodyClass ) ).toBe( true );
		} );

		unmount();

		expect( document.body.classList.contains( bodyClass ) ).toBe( false );
	} );
} );
