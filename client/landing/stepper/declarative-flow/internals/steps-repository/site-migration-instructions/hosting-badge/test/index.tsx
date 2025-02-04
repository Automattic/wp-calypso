/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { HostingBadge } from '..';

describe( 'HostingBadge', () => {
	it( 'renders the hosting badge', () => {
		render( <HostingBadge hostingName="WordPress.com" /> );

		expect( screen.queryByText( /WordPress.com/ ) ).toBeInTheDocument();
	} );
} );
