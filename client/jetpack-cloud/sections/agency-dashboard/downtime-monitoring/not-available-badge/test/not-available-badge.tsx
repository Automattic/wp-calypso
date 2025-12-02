/**
 * @jest-environment jsdom
 */

import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import NotAvailableBadge from '../index';

describe( 'NotAvailableBadge', () => {
	it( 'renders the badge text for free site selected', () => {
		render( <NotAvailableBadge restriction="free_site_selected" /> );
		const badge = screen.getByText( 'Not Available' );
		expect( badge ).toBeInTheDocument();
	} );

	it( 'shows tooltip on mouse hover for free site selected', () => {
		render( <NotAvailableBadge restriction="free_site_selected" /> );

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

	it( 'renders the badge text for atomic site selected', () => {
		render( <NotAvailableBadge restriction="atomic_site_selected" /> );
		const badge = screen.getByText( 'Not Available' );
		expect( badge ).toBeInTheDocument();
	} );

	it( 'shows tooltip on mouse hover for atomic site selected', () => {
		render( <NotAvailableBadge restriction="atomic_site_selected" /> );

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
