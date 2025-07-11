import { render, screen } from '@testing-library/react';
import { DomainSuggestionPrice } from '..';

describe( 'DomainSuggestionPrice', () => {
	it( 'renders the price', () => {
		render( <DomainSuggestionPrice price="$15" /> );

		expect( screen.getByText( '$15' ) ).toBeInTheDocument();
		expect( screen.getByText( '/year' ) ).toBeInTheDocument();
	} );

	it( 'renders the promotional price when provided', () => {
		render( <DomainSuggestionPrice originalPrice="$20" price="$15" /> );

		expect( screen.getByText( '$20' ) ).toHaveStyle( { textDecoration: 'line-through' } );
		expect( screen.getByText( '$15' ) ).toBeInTheDocument();

		expect( screen.getByText( 'For first year. $20/year renewal.' ) ).toBeInTheDocument();
	} );
} );
