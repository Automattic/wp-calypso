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
	} );

	it( 'renders the price and yearly renewal suffix if renewPrice is the same as the price', () => {
		render(
			<DomainSuggestionsList>
				<DomainSuggestionPrice price="$15" renewPrice="$15" />
			</DomainSuggestionsList>
		);

		expect( screen.getByText( '$15' ) ).toBeInTheDocument();
		expect( screen.queryByText( '/year' ) ).toBeInTheDocument();
	} );

	it( 'renders the price and yearly renewal notice if renewPrice is different from the price', () => {
		const { container } = render(
			<DomainSuggestionsList>
				<DomainSuggestionPrice price="$15" renewPrice="$20" />
			</DomainSuggestionsList>
		);

		expect( screen.getByText( '$15' ) ).toBeInTheDocument();
		expect( screen.queryByText( '/year' ) ).not.toBeInTheDocument();
		expect( container ).toHaveTextContent( 'For first year. $20/year renewal.' );
	} );

	it( 'renders the sale price when provided', () => {
		render(
			<DomainSuggestionsList>
				<DomainSuggestionPrice salePrice="$15" price="$20" />
			</DomainSuggestionsList>
		);

		expect( screen.getByText( '$20' ) ).toHaveStyle( { textDecoration: 'line-through' } );
		expect( screen.getByText( '$15' ) ).toBeInTheDocument();
	} );

	it( 'renders the yearly renewal notice if there is a sale price, even if the initial price is the same as the renewal price', () => {
		const { container } = render(
			<DomainSuggestionsList>
				<DomainSuggestionPrice salePrice="$10" price="$15" renewPrice="$15" />
			</DomainSuggestionsList>
		);

		expect( screen.getByText( '$10' ) ).toBeInTheDocument();
		expect( screen.getByText( '$15' ) ).toBeInTheDocument();
		expect( screen.queryByText( '/year' ) ).not.toBeInTheDocument();
		expect( container ).toHaveTextContent( 'For first year. $15/year renewal.' );
	} );
} );
