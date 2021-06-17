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
		render(
			<ScreenOptionsTab>
				<div>Child element</div>
			</ScreenOptionsTab>
		);

		expect( screen.getByRole( 'button' ).textContent ).toBe( 'Screen options' );
	} );

	test( 'it toggles child elements when clicked', () => {
		render(
			<ScreenOptionsTab>
				<div data-testid="target-element">Child element</div>
			</ScreenOptionsTab>
		);

		// We expect the element to not be shown by default.
		expect( screen.queryByTestId( 'target-element' ) ).toBeNull();

		// Click the button.
		fireEvent.click( screen.getByRole( 'button' ) );

		// Element should exist now it has been toggled.
		expect( screen.getByTestId( 'target-element' ) ).toBeTruthy();

		// Click the button again.
		fireEvent.click( screen.getByRole( 'button' ) );

		// Element should not be shown again after toggling it off.
		expect( screen.queryByTestId( 'target-element' ) ).toBeNull();
	} );
} );
