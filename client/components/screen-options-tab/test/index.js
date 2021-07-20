/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { fireEvent, screen } from '@testing-library/react';

/**
 * Internal dependencies
 */
import ScreenOptionsTab from '../index';
import { render as rtlRender } from 'config/testing-library';
import { reducer as ui } from 'calypso/state/ui/reducer';

jest.mock( 'calypso/state/preferences/selectors', () => ( {
	hasReceivedRemotePreferences: jest.fn( () => true ),
	getPreference: jest.fn( () => true ),
} ) );

const render = ( el, options ) => rtlRender( el, { ...options, reducers: { ui } } );

const siteId = 1;
const adminUrl = 'https://example.wordpress.com/wp-admin';

const initialState = {
	ui: { selectedSiteId: siteId },
	sites: {
		items: {
			[ siteId ]: { options: { admin_url: adminUrl }, jetpack: false },
		},
	},
};

describe( 'ScreenOptionsTab', () => {
	test( 'it renders correctly', () => {
		render( <ScreenOptionsTab wpAdminPath="index.php" />, { initialState } );

		expect( screen.getByRole( 'button' ) ).toBeTruthy();
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
						[ siteId ]: { options: { admin_url: adminUrl }, jetpack: true },
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
