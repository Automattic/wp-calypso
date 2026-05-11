/**
 * @jest-environment jsdom
 */

import { queryClient, rawUserPreferencesQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { DarkModeAnnouncement } from '..';
import { ColorSchemeProvider } from '../../../app/color-scheme';
import { AppProvider, APP_CONTEXT_DEFAULT_CONFIG } from '../../../app/context';
import { render } from '../../../test-utils';

jest.mock( '@automattic/calypso-config', () => {
	const config = jest.fn( () => 'development' );
	return Object.assign( config, {
		__esModule: true,
		default: config,
		isEnabled: jest.fn( () => false ),
	} );
} );

const API_BASE = 'https://public-api.wordpress.com';
const PREFERENCES_PATH = '/rest/v1.1/me/preferences';
const COLOR_SCHEME_PREFERENCE = 'hosting-dashboard-color-scheme';
const DISMISSED_PREFERENCE = 'hosting-dashboard-dark-mode-announcement-dismissed';

const optInPreference = {
	value: 'opt-in',
	updated_at: '2026-05-08T00:00:00.000Z',
};
const mockIsEnabled = jest.mocked( isEnabled );
const mockUpdatePreference = jest.fn();
const dashboardConfig = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	optIn: true,
	supports: {
		...APP_CONTEXT_DEFAULT_CONFIG.supports,
		darkMode: true,
	},
};

const renderAnnouncement = ( preferences: Record< string, unknown > ) => {
	queryClient.setQueryData( rawUserPreferencesQuery().queryKey, preferences );

	return render(
		<AppProvider config={ dashboardConfig }>
			<ColorSchemeProvider>
				<DarkModeAnnouncement tracksContext="sites" />
			</ColorSchemeProvider>
		</AppProvider>,
		{
			queryClient,
		}
	);
};

function mockUpdateColorScheme( colorScheme: 'light' | 'dark' | 'system' ) {
	return nock( API_BASE )
		.post( PREFERENCES_PATH, ( body ) => {
			mockUpdatePreference( body );
			expect( body.calypso_preferences ).toMatchObject( {
				[ COLOR_SCHEME_PREFERENCE ]: colorScheme,
			} );
			return true;
		} )
		.reply( 200, {
			calypso_preferences: {
				[ COLOR_SCHEME_PREFERENCE ]: colorScheme,
			},
		} );
}

beforeEach( () => {
	queryClient.clear();
	queryClient.setDefaultOptions( {
		queries: { retry: false },
	} );
	mockUpdatePreference.mockClear();
} );

afterEach( () => {
	mockIsEnabled.mockReturnValue( false );
	document.documentElement.removeAttribute( 'data-theme' );
} );

test( 'renders for an enrolled user without a saved color scheme', async () => {
	renderAnnouncement( {
		'hosting-dashboard-opt-in': optInPreference,
	} );

	expect(
		await screen.findByText( /Dark mode support is now available in the dashboard/i )
	).toBeVisible();
	expect(
		screen.getByText( /change your choice \(or set it to match your system\)/i )
	).toBeVisible();
	expect( screen.getByRole( 'button', { name: 'Try dark mode' } ) ).toBeVisible();
	expect( screen.getByRole( 'button', { name: 'Dismiss dark mode announcement' } ) ).toBeVisible();
	expect( screen.getByRole( 'link', { name: 'Appearance settings' } ) ).toHaveAttribute(
		'href',
		'/me/preferences/appearance'
	);
	expect( document.documentElement.dataset.theme ).toBe( 'light' );
} );

test( 'renders after the user has selected light mode', async () => {
	renderAnnouncement( {
		'hosting-dashboard-opt-in': optInPreference,
		[ COLOR_SCHEME_PREFERENCE ]: 'light',
	} );

	expect(
		await screen.findByText( /Dark mode support is now available in the dashboard/i )
	).toBeVisible();
} );

test( 'switches to dark mode from the notice and can revert back', async () => {
	const user = userEvent.setup();
	mockUpdateColorScheme( 'dark' );
	mockUpdateColorScheme( 'light' );

	renderAnnouncement( {
		'hosting-dashboard-opt-in': optInPreference,
		[ COLOR_SCHEME_PREFERENCE ]: 'light',
	} );

	await user.click( await screen.findByRole( 'button', { name: 'Try dark mode' } ) );

	await waitFor( () => {
		expect( document.documentElement.dataset.theme ).toBe( 'dark' );
		expect( screen.getByRole( 'button', { name: 'Go back to light mode' } ) ).toBeVisible();
	} );

	await user.click( screen.getByRole( 'button', { name: 'Go back to light mode' } ) );

	await waitFor( () => {
		expect( document.documentElement.dataset.theme ).toBe( 'light' );
		expect( screen.getByRole( 'button', { name: 'Try dark mode' } ) ).toBeVisible();
		expect( mockUpdatePreference ).toHaveBeenCalledTimes( 2 );
	} );
} );

test( 'renders after the user has selected system mode', async () => {
	renderAnnouncement( {
		'hosting-dashboard-opt-in': optInPreference,
		[ COLOR_SCHEME_PREFERENCE ]: 'system',
	} );

	expect(
		await screen.findByText( /Dark mode support is now available in the dashboard/i )
	).toBeVisible();
	expect( screen.getByRole( 'button', { name: 'Try dark mode' } ) ).toBeVisible();
} );

test( 'renders a revert action when dark mode is already active', async () => {
	renderAnnouncement( {
		'hosting-dashboard-opt-in': optInPreference,
		[ COLOR_SCHEME_PREFERENCE ]: 'dark',
	} );

	expect( await screen.findByRole( 'button', { name: 'Go back to light mode' } ) ).toBeVisible();
} );

test( 'goes back to light mode from a previously active dark mode', async () => {
	const user = userEvent.setup();
	mockUpdateColorScheme( 'light' );

	renderAnnouncement( {
		'hosting-dashboard-opt-in': optInPreference,
		[ COLOR_SCHEME_PREFERENCE ]: 'dark',
	} );

	await user.click( await screen.findByRole( 'button', { name: 'Go back to light mode' } ) );

	await waitFor( () => {
		expect( document.documentElement.dataset.theme ).toBe( 'light' );
		expect( screen.getByRole( 'button', { name: 'Try dark mode' } ) ).toBeVisible();
		expect( mockUpdatePreference ).toHaveBeenCalledTimes( 1 );
	} );
} );

test( 'renders when the saved color scheme is invalid', async () => {
	renderAnnouncement( {
		'hosting-dashboard-opt-in': optInPreference,
		[ COLOR_SCHEME_PREFERENCE ]: 'blue',
	} );

	expect(
		await screen.findByText( /Dark mode support is now available in the dashboard/i )
	).toBeVisible();
	expect( document.documentElement.dataset.theme ).toBe( 'light' );
} );

test( 'renders for a forced opted-in user without a saved color scheme', async () => {
	renderAnnouncement( {
		'hosting-dashboard-opt-in': {
			value: 'forced-opt-in',
			updated_at: '2026-05-08T00:00:00.000Z',
		},
	} );

	expect(
		await screen.findByText( /Dark mode support is now available in the dashboard/i )
	).toBeVisible();
} );

test( 'renders when the forced opt-in flag enrolls the user', async () => {
	mockIsEnabled.mockReturnValue( true );

	renderAnnouncement( {
		'hosting-dashboard-opt-in': {
			value: 'unset',
			updated_at: '',
		},
	} );

	expect(
		await screen.findByText( /Dark mode support is now available in the dashboard/i )
	).toBeVisible();
} );

test( 'does not render when the announcement was already dismissed', async () => {
	renderAnnouncement( {
		'hosting-dashboard-opt-in': optInPreference,
		[ DISMISSED_PREFERENCE ]: '2026-05-08T00:00:00.000Z',
	} );

	await waitFor( () => {
		expect(
			screen.queryByText( /Dark mode support is now available in the dashboard/i )
		).not.toBeInTheDocument();
	} );
} );

test( 'does not render when the user is not enrolled in the Hosting Dashboard', async () => {
	renderAnnouncement( {
		'hosting-dashboard-opt-in': {
			value: 'opt-out',
			updated_at: '2026-05-08T00:00:00.000Z',
		},
	} );

	await waitFor( () => {
		expect(
			screen.queryByText( /Dark mode support is now available in the dashboard/i )
		).not.toBeInTheDocument();
	} );
} );

test( 'dismisses without saving a color-scheme preference', async () => {
	const user = userEvent.setup();
	nock( API_BASE )
		.post( PREFERENCES_PATH, ( body ) => {
			mockUpdatePreference( body );
			expect( body.calypso_preferences ).toHaveProperty( DISMISSED_PREFERENCE );
			expect( body.calypso_preferences ).not.toHaveProperty( COLOR_SCHEME_PREFERENCE );
			return true;
		} )
		.reply( 200, {
			calypso_preferences: {
				[ DISMISSED_PREFERENCE ]: '2026-05-08T00:00:00.000Z',
			},
		} );

	renderAnnouncement( {
		'hosting-dashboard-opt-in': optInPreference,
	} );

	await user.click(
		await screen.findByRole( 'button', { name: 'Dismiss dark mode announcement' } )
	);

	await waitFor( () => {
		expect( mockUpdatePreference ).toHaveBeenCalledTimes( 1 );
		expect( nock.isDone() ).toBe( true );
		expect(
			queryClient.getQueryData< Record< string, unknown > >( rawUserPreferencesQuery().queryKey )
		).toHaveProperty( DISMISSED_PREFERENCE );
		expect(
			screen.queryByText( /Dark mode support is now available in the dashboard/i )
		).not.toBeInTheDocument();
	} );
} );
