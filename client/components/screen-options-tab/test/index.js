/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from '@testing-library/react';
import jetpack from 'calypso/state/jetpack/reducer';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { render as rtlRender } from 'calypso/test-helpers/config/testing-library';
import ScreenOptionsTab from '../index';

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useDispatch: jest.fn( () => () => {} ),
} ) );

const render = ( el, options ) => rtlRender( el, { ...options, reducers: { ui, jetpack } } );

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

		expect( screen.queryByTestId( 'screen-options-tab' ) ).toBeTruthy();
	} );

	test( 'does not render on all-sites screens', () => {
		render( <ScreenOptionsTab wpAdminPath="index.php" />, {
			initialState: {
				...initialState,
				ui: { selectedSiteId: null },
			},
		} );

		expect( screen.queryByTestId( 'screen-options-tab' ) ).toBeNull();
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

		expect( screen.queryByTestId( 'screen-options-tab' ) ).toBeNull();
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

		expect( screen.queryByTestId( 'screen-options-tab' ) ).toBeTruthy();
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

		expect( screen.queryByTestId( 'screen-options-tab' ) ).toBeNull();
	} );

	test( 'it toggles dropdown when clicked', () => {
		render( <ScreenOptionsTab wpAdminPath="index.php" />, { initialState } );

		// We expect the dropdown to not be shown by default.
		expect( screen.queryByTestId( 'screen-options-dropdown' ) ).toBeNull();

		// Click the button.
		fireEvent.click( screen.getAllByRole( 'button' )[ 0 ] );

		// Dropdown should exist now it has been toggled.
		expect( screen.queryByTestId( 'screen-options-dropdown' ) ).toBeTruthy();

		// Click the button again.
		fireEvent.click( screen.getAllByRole( 'button' )[ 0 ] );

		// Dropdown should not be shown again after toggling it off.
		expect( screen.queryByTestId( 'screen-options-dropdown' ) ).toBeNull();
	} );
} );
