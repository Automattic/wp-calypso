/**
 * @jest-environment jsdom
 */

import { queryClient, rawUserPreferencesQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import { ColorSchemeProvider } from 'calypso/lib/color-scheme';
import PreferencesAppearance from '..';
import { AppProvider, APP_CONTEXT_DEFAULT_CONFIG } from '../../../app/context';
import { render } from '../../../test-utils';
import { isDashboardBackport } from '../../../utils/is-dashboard-backport';

jest.mock( '@automattic/calypso-config', () => {
	const actual = jest.requireActual( '@automattic/calypso-config' );
	return {
		...actual,
		__esModule: true,
		isEnabled: jest.fn( actual.isEnabled ),
	};
} );

jest.mock( '../../../utils/is-dashboard-backport', () => ( {
	isDashboardBackport: jest.fn( () => false ),
} ) );

const mockIsDashboardBackport = jest.mocked( isDashboardBackport );
const mockIsEnabled = jest.mocked( isEnabled );

const dashboardConfig = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	supports: {
		...APP_CONTEXT_DEFAULT_CONFIG.supports,
		colorScheme: true,
		darkMode: true,
	},
};

function renderPreferencesAppearance( {
	config = dashboardConfig,
	colorScheme = 'dark',
	hasUsedColorScheme = true,
	isDarkModeRollout = false,
}: {
	config?: typeof dashboardConfig;
	colorScheme?: string;
	hasUsedColorScheme?: boolean;
	isDarkModeRollout?: boolean;
} = {} ) {
	mockIsEnabled.mockImplementation(
		( flag ) => flag === 'dashboard/dark-mode-rollout' && isDarkModeRollout
	);

	const preferences: Record< string, unknown > = {
		'hosting-dashboard-opt-in': {
			value: 'opt-out',
			updated_at: '2026-05-11T00:00:00.000Z',
		},
	};
	if ( hasUsedColorScheme ) {
		preferences[ 'hosting-dashboard-color-scheme' ] = colorScheme;
	}
	queryClient.setQueryData( rawUserPreferencesQuery().queryKey, preferences );

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

test( 'renders when the user has used the color scheme before', async () => {
	renderPreferencesAppearance();

	expect( await screen.findByRole( 'link', { name: /Appearance/i } ) ).toHaveAttribute(
		'href',
		'/me/preferences/appearance'
	);
	expect( screen.getByText( 'Dark' ) ).toBeVisible();
} );

test( 'does not render when the rollout flag is off and the user has never used the color scheme', async () => {
	renderPreferencesAppearance( { hasUsedColorScheme: false } );

	await waitFor( () => {
		expect( screen.queryByRole( 'link', { name: /Appearance/i } ) ).not.toBeInTheDocument();
	} );
} );

test( 'renders when the dark mode rollout flag is enabled, even without prior use', async () => {
	renderPreferencesAppearance( { hasUsedColorScheme: false, isDarkModeRollout: true } );

	expect( await screen.findByRole( 'link', { name: /Appearance/i } ) ).toHaveAttribute(
		'href',
		'/me/preferences/appearance'
	);
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
		config: {
			...dashboardConfig,
			supports: {
				...dashboardConfig.supports,
				darkMode: false,
			},
		},
	} );

	await waitFor( () => {
		expect( screen.queryByRole( 'link', { name: /Appearance/i } ) ).not.toBeInTheDocument();
	} );
} );

test( 'does not render when color scheme is not supported', async () => {
	renderPreferencesAppearance( {
		config: {
			...dashboardConfig,
			supports: {
				...dashboardConfig.supports,
				colorScheme: false,
				darkMode: true,
			},
		},
	} );

	await waitFor( () => {
		expect( screen.queryByRole( 'link', { name: /Appearance/i } ) ).not.toBeInTheDocument();
	} );
} );
