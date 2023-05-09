/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import jetpack from 'calypso/state/jetpack/reducer';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ScreenOptionsTab from '../index';

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useDispatch: jest.fn( () => () => {} ),
} ) );

const render = ( el, options ) =>
	renderWithProvider( el, { ...options, reducers: { ui, jetpack } } );

const siteId = 1;
const adminUrl = 'https://example.wordpress.com/wp-admin';

const initialState = {
	ui: { selectedSiteId: siteId },
	sites: {
		items: {
			[ siteId ]: { options: { admin_url: adminUrl, is_wpcom_atomic: false }, jetpack: false },
		},
	},
	jetpack: {
		modules: {
			items: {
				[ siteId ]: { sso: { active: true } },
			},
		},
	},
};

describe( 'ScreenOptionsTab', () => {
	test( 'it renders correctly', () => {
		render( <ScreenOptionsTab wpAdminPath="index.php" />, { initialState } );

		expect( screen.queryByTestId( 'screen-options-tab' ) ).toBeInTheDocument();
	} );

	test( 'does not render on all-sites screens', () => {
		render( <ScreenOptionsTab wpAdminPath="index.php" />, {
			initialState: {
				...initialState,
				ui: { selectedSiteId: null },
			},
		} );

		expect( screen.queryByTestId( 'screen-options-tab' ) ).not.toBeInTheDocument();
	} );

	test( 'does not render on Jetpack sites', () => {
		render( <ScreenOptionsTab wpAdminPath="index.php" />, {
			initialState: {
				...initialState,
				sites: {
					items: {
						[ siteId ]: { options: { admin_url: adminUrl, is_wpcom_atomic: false }, jetpack: true },
					},
				},
			},
		} );

		expect( screen.queryByTestId( 'screen-options-tab' ) ).not.toBeInTheDocument();
	} );

	test( 'does render on Atomic sites', () => {
		render( <ScreenOptionsTab wpAdminPath="index.php" />, {
			initialState: {
				...initialState,
				sites: {
					items: {
						[ siteId ]: { options: { admin_url: adminUrl, is_wpcom_atomic: true }, jetpack: true },
					},
				},
			},
		} );

		expect( screen.queryByTestId( 'screen-options-tab' ) ).toBeInTheDocument();
	} );

	test( 'does not render when the SSO module is disabled', () => {
		render( <ScreenOptionsTab wpAdminPath="index.php" />, {
			initialState: {
				...initialState,
				sites: {
					items: {
						[ siteId ]: { options: { admin_url: adminUrl, is_wpcom_atomic: true }, jetpack: true },
					},
				},
				jetpack: {
					modules: {
						items: {
							[ siteId ]: { sso: { active: false } },
						},
					},
				},
			},
		} );

		expect( screen.queryByTestId( 'screen-options-tab' ) ).not.toBeInTheDocument();
	} );

	test( 'it toggles dropdown when clicked', async () => {
		const user = userEvent.setup();
		render( <ScreenOptionsTab wpAdminPath="index.php" />, { initialState } );

		// We expect the dropdown to not be shown by default.
		expect( screen.queryByTestId( 'screen-options-dropdown' ) ).not.toBeInTheDocument();

		// Click the button.
		await user.click( screen.getAllByRole( 'button' )[ 0 ] );

		// Dropdown should exist now it has been toggled.
		expect( screen.queryByTestId( 'screen-options-dropdown' ) ).toBeInTheDocument();

		// Click the button again.
		await user.click( screen.getAllByRole( 'button' )[ 0 ] );

		// Dropdown should not be shown again after toggling it off.
		expect( screen.queryByTestId( 'screen-options-dropdown' ) ).not.toBeInTheDocument();
	} );
} );
