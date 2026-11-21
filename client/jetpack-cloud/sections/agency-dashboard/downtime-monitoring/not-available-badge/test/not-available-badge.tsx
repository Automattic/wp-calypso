/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import React from 'react';
import NotAvailableBadge from '../index';

describe( 'NotAvailableBadge', () => {
	it( 'renders the badge text for free site selected', () => {
		render( <NotAvailableBadge restriction="free_site_selected" /> );
		const badge = screen.getByText( 'Not Available' );
		expect( badge ).toBeInTheDocument();
	} );

	it( 'renders the badge text for atomic site selected', () => {
		render( <NotAvailableBadge restriction="atomic_site_selected" /> );
		const badge = screen.getByText( 'Not Available' );
		expect( badge ).toBeInTheDocument();
	} );
} );
