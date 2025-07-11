/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { DomainSuggestion } from '..';
import { buildDomainSearchCart } from '../../../test-helpers/factories';
import { DomainSearch } from '../../domain-search';
import { DomainSuggestionBadge } from '../../domain-suggestion-badge';
import { DomainSuggestionsList } from '../../domain-suggestions-list';

describe( 'DomainSuggestion', () => {
	it( 'renders the domain name', () => {
		render(
			<DomainSearch cart={ buildDomainSearchCart() } onContinue={ jest.fn() }>
				<DomainSuggestionsList>
					<DomainSuggestion uuid="1" domain="example" tld="com" price="$15" originalPrice="$20" />
				</DomainSuggestionsList>
			</DomainSearch>
		);

		expect( screen.getByLabelText( 'example.com' ) ).toBeInTheDocument();
	} );

	it( 'renders the badges when provided', () => {
		render(
			<DomainSearch cart={ buildDomainSearchCart() } onContinue={ jest.fn() }>
				<DomainSuggestionsList>
					<DomainSuggestion
						uuid="1"
						domain="example"
						tld="com"
						price="$15"
						originalPrice="$20"
						badges={ <DomainSuggestionBadge>Test Badge</DomainSuggestionBadge> }
					/>
				</DomainSuggestionsList>
			</DomainSearch>
		);

		expect( screen.getByText( 'Test Badge' ) ).toBeInTheDocument();
	} );

	it( 'renders the price', () => {
		render(
			<DomainSearch cart={ buildDomainSearchCart() } onContinue={ jest.fn() }>
				<DomainSuggestionsList>
					<DomainSuggestion uuid="1" domain="example" tld="com" price="$15" originalPrice="$20" />
				</DomainSuggestionsList>
			</DomainSearch>
		);

		expect( screen.getByText( '$15' ) ).toBeInTheDocument();
		expect( screen.getByText( '$20' ) ).toBeInTheDocument();
	} );

	it( 'renders the CTA', () => {
		render(
			<DomainSearch cart={ buildDomainSearchCart() } onContinue={ jest.fn() }>
				<DomainSuggestionsList>
					<DomainSuggestion uuid="1" domain="example" tld="com" price="$15" originalPrice="$20" />
				</DomainSuggestionsList>
			</DomainSearch>
		);

		expect( screen.getByRole( 'button', { name: 'Add to Cart' } ) ).toBeInTheDocument();
	} );
} );
