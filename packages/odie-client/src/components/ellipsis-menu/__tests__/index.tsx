/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { EllipsisMenu } from './../';

describe( 'EllipsisMenu', () => {
	test( 'renders correctly', () => {
		const { getByRole } = render( <EllipsisMenu /> );
		const button = getByRole( 'button' );
		expect( button ).toBeInTheDocument();
	} );

	test( 'toggles menu visibility when button is clicked', () => {
		const { getByRole, queryByRole } = render( <EllipsisMenu /> );
		const button = getByRole( 'button' );

		// Initially, the menu should not be visible
		expect( queryByRole( 'menu' ) ).not.toBeInTheDocument();

		// After clicking the button, the menu should be visible
		fireEvent.click( button );
		expect( queryByRole( 'menu' ) ).toBeInTheDocument();

		// After clicking the button again, the menu should not be visible
		fireEvent.click( button );
		expect( queryByRole( 'menu' ) ).not.toBeInTheDocument();
	} );
} );
