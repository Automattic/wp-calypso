import { render, screen } from '@testing-library/react';
import { DomainSuggestionPrice } from '..';
import { DomainSuggestionsList } from '../../domain-suggestions-list';

describe( 'DomainSuggestionPrice', () => {
	it( 'renders the price', () => {
		render(
			<DomainSuggestionsList>
				<DomainSuggestionPrice price="$15" />
			</DomainSuggestionsList>
		);

		expect( screen.getByText( '$15' ) ).toBeInTheDocument();
		expect( screen.getByText( '/year' ) ).toBeInTheDocument();
	} );

	it( 'renders the promotional price when provided', () => {
		render(
			<DomainSuggestionsList>
				<DomainSuggestionPrice originalPrice="$20" price="$15" />
			</DomainSuggestionsList>
		);

		expect( screen.getByText( '$20' ) ).toHaveStyle( { textDecoration: 'line-through' } );
		expect( screen.getByText( '$15' ) ).toBeInTheDocument();

		expect( screen.getByText( 'For first year. $20/year renewal.' ) ).toBeInTheDocument();
	} );
} );
