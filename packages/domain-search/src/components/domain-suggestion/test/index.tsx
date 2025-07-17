/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DomainSuggestion } from '..';
import { buildDomainSearchCart } from '../../../test-helpers/factories';
import { DomainSearch } from '../../domain-search';
import { DomainSuggestionBadge } from '../../domain-suggestion-badge';
import { DomainSuggestionPrice } from '../../domain-suggestion-price';
import { DomainSuggestionsList } from '../../domain-suggestions-list';

describe( 'DomainSuggestion', () => {
	it( 'renders the domain name', () => {
		render(
			<DomainSearch cart={ buildDomainSearchCart() } onContinue={ jest.fn() }>
				<DomainSuggestionsList>
					<DomainSuggestion uuid="1" domain="example" tld="com" price="$15" />
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
					<DomainSuggestion
						uuid="1"
						domain="example"
						tld="com"
						price={ <DomainSuggestionPrice price="$15" /> }
					/>
				</DomainSuggestionsList>
			</DomainSearch>
		);

		expect( screen.getByText( '$15' ) ).toBeInTheDocument();
	} );

	it( 'renders the CTA', () => {
		render(
			<DomainSearch cart={ buildDomainSearchCart() } onContinue={ jest.fn() }>
				<DomainSuggestionsList>
					<DomainSuggestion uuid="1" domain="example" tld="com" price="$15" />
				</DomainSuggestionsList>
			</DomainSearch>
		);

		expect( screen.getByRole( 'button', { name: 'Add to Cart' } ) ).toBeInTheDocument();
	} );

	it( 'calls the onClick prop when the CTA is clicked', async () => {
		const user = userEvent.setup();
		const onClick = jest.fn();

		render(
			<DomainSearch cart={ buildDomainSearchCart() } onContinue={ jest.fn() }>
				<DomainSuggestionsList>
					<DomainSuggestion uuid="1" domain="example" tld="com" price="$15" onClick={ onClick } />
				</DomainSuggestionsList>
			</DomainSearch>
		);

		await user.click( screen.getByRole( 'button', { name: 'Add to Cart' } ) );

		expect( onClick ).toHaveBeenCalledWith( 'add-to-cart' );
	} );
} );
