/**
 * @jest-environment jsdom
 */

import { queryClient, rawUserPreferencesQuery } from '@automattic/api-queries';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import { ColorSchemeProvider } from 'calypso/lib/color-scheme';
import PreferencesAppearance from '..';
import { AppProvider, APP_CONTEXT_DEFAULT_CONFIG } from '../../../app/context';
import { render } from '../../../test-utils';
import { isDashboardBackport } from '../../../utils/is-dashboard-backport';

jest.mock( '../../../utils/is-dashboard-backport', () => ( {
	isDashboardBackport: jest.fn( () => false ),
} ) );

const mockIsDashboardBackport = jest.mocked( isDashboardBackport );

const dashboardConfig = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	supports: {
		...APP_CONTEXT_DEFAULT_CONFIG.supports,
		colorScheme: true,
		darkMode: true,
	},
};

function renderPreferencesAppearance( config = dashboardConfig ) {
	queryClient.setQueryData( rawUserPreferencesQuery().queryKey, {
		'hosting-dashboard-opt-in': {
			value: 'opt-out',
			updated_at: '2026-05-11T00:00:00.000Z',
		},
		'hosting-dashboard-color-scheme': 'dark',
	} );

	return render(
		<AppProvider config={ config }>
			<ColorSchemeProvider>
				<PreferencesAppearance />
			</ColorSchemeProvider>
		</AppProvider>,
		{ queryClient }
	);
}

beforeEach( () => {
	queryClient.clear();
	queryClient.setDefaultOptions( {
		queries: { retry: false },
	} );
	mockIsDashboardBackport.mockReturnValue( false );
} );

afterEach( () => {
	document.documentElement.removeAttribute( 'data-theme' );
} );

test( 'renders when dark mode is supported regardless of opt-in preference', async () => {
	renderPreferencesAppearance();

	expect( await screen.findByRole( 'link', { name: /Appearance/i } ) ).toHaveAttribute(
		'href',
		'/me/preferences/appearance'
	);
	expect( screen.getByText( 'Dark' ) ).toBeVisible();
} );

test( 'does not render in the Dashboard backport', async () => {
	mockIsDashboardBackport.mockReturnValue( true );

	renderPreferencesAppearance();

	await waitFor( () => {
		expect( screen.queryByRole( 'link', { name: /Appearance/i } ) ).not.toBeInTheDocument();
	} );
} );

test( 'does not render when dark mode is not supported', async () => {
	renderPreferencesAppearance( {
		...dashboardConfig,
		supports: {
			...dashboardConfig.supports,
			darkMode: false,
		},
	} );

	await waitFor( () => {
		expect( screen.queryByRole( 'link', { name: /Appearance/i } ) ).not.toBeInTheDocument();
	} );
} );

test( 'does not render when color scheme is not supported', async () => {
	renderPreferencesAppearance( {
		...dashboardConfig,
		supports: {
			...dashboardConfig.supports,
			colorScheme: false,
			darkMode: true,
		},
	} );

	await waitFor( () => {
		expect( screen.queryByRole( 'link', { name: /Appearance/i } ) ).not.toBeInTheDocument();
	} );
} );
