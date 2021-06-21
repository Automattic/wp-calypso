/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';

/**
 * Internal dependencies
 */
import ScreenOptionsTab from '../index';

describe( 'ScreenOptionsTab', () => {
	test( 'it renders correctly', () => {
		render( <ScreenOptionsTab /> );

		expect( screen.getByRole( 'button' ) ).toBeTruthy();
	} );

	test( 'it toggles dropdown when clicked', () => {
		render( <ScreenOptionsTab /> );

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
