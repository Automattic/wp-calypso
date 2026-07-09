import { domainProductSlugs } from '@automattic/calypso-products';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { DomainSuggestionPrice } from '..';
import { buildAvailability } from '../../../test-helpers/factories/availability';
import { buildSuggestion } from '../../../test-helpers/factories/suggestions';
import { mockGetAvailabilityQuery } from '../../../test-helpers/queries/availability';
import { mockGetSuggestionsQuery } from '../../../test-helpers/queries/suggestions';
import { TestDomainSearchWithSuggestions } from '../../../test-helpers/renderer';
import { DomainSuggestionsList } from '../../../ui';

describe( 'DomainSuggestionPrice', () => {
	it( 'renders the regular price rules by default', async () => {
		mockGetSuggestionsQuery( {
			params: { query: 'test-regular-price.com' },
			suggestions: [
				buildSuggestion( {
					domain_name: 'test-regular-price.com',
					cost: '$5',
					sale_cost: 1,
					renew_cost: '$10',
				} ),
			],
		} );

		render(
			<TestDomainSearchWithSuggestions query="test-regular-price.com">
				<DomainSuggestionsList>
					<DomainSuggestionPrice domainName="test-regular-price.com" />
				</DomainSuggestionsList>
			</TestDomainSearchWithSuggestions>
		);

		expect( await screen.findByLabelText( 'Original price: $5' ) ).toBeInTheDocument();
		expect( await screen.findByLabelText( 'Sale price: $1' ) ).toBeInTheDocument();
		expect( await screen.findByText( /For first year/ ) ).toHaveTextContent(
			'For first year. $10/year renewal.'
		);
	} );

	it( 'renders nothing if priceRule is HIDE_PRICE', async () => {
		mockGetSuggestionsQuery( {
			params: { query: 'test-hide-price.com' },
			suggestions: [ buildSuggestion( { domain_name: 'test-hide-price.com' } ) ],
		} );

		const { container } = render(
			<TestDomainSearchWithSuggestions
				config={ {
					priceRules: {
						hidePrice: true,
					},
				} }
				query="test-hide-price.com"
			>
				<DomainSuggestionPrice domainName="test-hide-price.com" />
			</TestDomainSearchWithSuggestions>
		);

		await waitForElementToBeRemoved( () => screen.getByText( 'LOADING_TEST_CONTENT' ) );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders the cost if priceRule is ONE_TIME_PRICE', async () => {
		mockGetSuggestionsQuery( {
			params: { query: 'test-one-time-price.com' },
			suggestions: [ buildSuggestion( { domain_name: 'test-one-time-price.com' } ) ],
		} );

		render(
			<TestDomainSearchWithSuggestions
				config={ {
					priceRules: {
						oneTimePrice: true,
					},
				} }
				query="test-one-time-price.com"
			>
				<DomainSuggestionsList>
					<DomainSuggestionPrice domainName="test-one-time-price.com" />
				</DomainSuggestionsList>
			</TestDomainSearchWithSuggestions>
		);

		expect( await screen.findByText( '$5' ) ).toBeInTheDocument();
	} );

	it( 'renders "Move your existing domain" if priceRule is DOMAIN_MOVE_PRICE', async () => {
		mockGetSuggestionsQuery( {
			params: { query: 'test-domain-move-price.com' },
			suggestions: [
				buildSuggestion( {
					domain_name: 'test-domain-move-price.com',
					product_slug: domainProductSlugs.DOMAIN_MOVE_INTERNAL,
				} ),
			],
		} );

		render(
			<TestDomainSearchWithSuggestions query="test-domain-move-price.com">
				<DomainSuggestionsList>
					<DomainSuggestionPrice domainName="test-domain-move-price.com" />
				</DomainSuggestionsList>
			</TestDomainSearchWithSuggestions>
		);

		expect( await screen.findByText( 'Move your existing domain' ) ).toBeInTheDocument();
	} );

	it( 'renders the sale cost as zero and the original price as if priceRule is FREE_FOR_FIRST_YEAR', async () => {
		mockGetSuggestionsQuery( {
			params: { query: 'test-free-for-first-year.com' },
			suggestions: [
				buildSuggestion( {
					domain_name: 'test-free-for-first-year.com',
					cost: '$5',
				} ),
			],
		} );

		render(
			<TestDomainSearchWithSuggestions
				query="test-free-for-first-year.com"
				config={ {
					priceRules: {
						freeForFirstYear: true,
					},
				} }
			>
				<DomainSuggestionsList>
					<DomainSuggestionPrice domainName="test-free-for-first-year.com" />
				</DomainSuggestionsList>
			</TestDomainSearchWithSuggestions>
		);

		expect( await screen.findByLabelText( 'Original price: $5' ) ).toBeInTheDocument();
		expect( await screen.findByLabelText( 'Sale price: $0' ) ).toBeInTheDocument();
	} );

	it( 'renders the renew price if priceRule is FREE_FOR_FIRST_YEAR and renew cost is provided', async () => {
		mockGetSuggestionsQuery( {
			params: { query: 'test-free-for-first-year-renew-cost.com' },
			suggestions: [
				buildSuggestion( {
					domain_name: 'test-free-for-first-year-renew-cost.com',
					renew_cost: '$10',
				} ),
			],
		} );

		render(
			<TestDomainSearchWithSuggestions
				query="test-free-for-first-year-renew-cost.com"
				config={ {
					priceRules: {
						freeForFirstYear: true,
					},
				} }
			>
				<DomainSuggestionsList>
					<DomainSuggestionPrice domainName="test-free-for-first-year-renew-cost.com" />
				</DomainSuggestionsList>
			</TestDomainSearchWithSuggestions>
		);

		expect( await screen.findByLabelText( 'Original price: $5' ) ).toBeInTheDocument();
		expect( await screen.findByLabelText( 'Sale price: $0' ) ).toBeInTheDocument();
		expect( await screen.findByText( /For first year/ ) ).toHaveTextContent(
			'For first year. $10/year renewal.'
		);
	} );

	it( 'forces regular price rule if it is a premium domain, using the price from the availability endpoint', async () => {
		mockGetSuggestionsQuery( {
			params: { query: 'test-premium-domain.com' },
			suggestions: [
				buildSuggestion( {
					domain_name: 'test-premium-domain.com',
					is_premium: true,
				} ),
			],
		} );

		mockGetAvailabilityQuery( {
			params: { domainName: 'test-premium-domain.com' },
			availability: buildAvailability( {
				domain_name: 'test-premium-domain.com',
				cost: '$5',
				sale_cost: 2,
				renew_cost: '$10',
			} ),
		} );

		render(
			<TestDomainSearchWithSuggestions query="test-premium-domain.com">
				<DomainSuggestionsList>
					<DomainSuggestionPrice domainName="test-premium-domain.com" />
				</DomainSuggestionsList>
			</TestDomainSearchWithSuggestions>
		);

		expect( await screen.findByLabelText( 'Original price: $5' ) ).toBeInTheDocument();
		expect( await screen.findByLabelText( 'Sale price: $2' ) ).toBeInTheDocument();
		expect( await screen.findByText( /For first year/ ) ).toHaveTextContent(
			'For first year. $10/year renewal.'
		);
	} );
} );
