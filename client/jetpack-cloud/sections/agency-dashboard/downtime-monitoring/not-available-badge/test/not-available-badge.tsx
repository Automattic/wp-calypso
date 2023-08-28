/**
 * @jest-environment jsdom
 */

import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import NotAvailableBadge from '../index';

describe( 'NotAvailableBadge', () => {
	it( 'renders the badge text', () => {
		render( <NotAvailableBadge /> );
		const badge = screen.getByText( 'Not Available' );
		expect( badge ).toBeInTheDocument();
	} );

	it( 'shows tooltip on mouse hover', () => {
		render( <NotAvailableBadge /> );

		const badgeWrapper = screen.getByRole( 'button', { name: 'Not Available' } );
		act( () => {
			userEvent.hover( badgeWrapper );
		} );
		waitFor( () => {
			expect(
				screen.getByText( 'One of the selected sites does not have a Basic plan.' )
			).toBeInTheDocument();
		} );
	} );
} );
