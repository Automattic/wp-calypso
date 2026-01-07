import { DomainAvailabilityStatus } from '@automattic/api-core';
import { localizeUrl } from '@automattic/i18n-utils';
import { HTTPS_SSL } from '@automattic/urls';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DomainPriceRule } from '../../../hooks/use-suggestion';
import { buildAvailability } from '../../../test-helpers/factories/availability';
import { buildCartItem } from '../../../test-helpers/factories/cart';
import { buildSuggestion } from '../../../test-helpers/factories/suggestions';
import { mockGetAvailabilityQuery } from '../../../test-helpers/queries/availability';
import { mockGetSuggestionsQuery } from '../../../test-helpers/queries/suggestions';
import { TestDomainSearchWithSuggestions } from '../../../test-helpers/renderer';
import { SearchResultsItem } from '../item';

describe( 'SearchResultsItem', () => {
	describe( 'badges', () => {
		it( 'renders the policy badges', async () => {
			const user = userEvent.setup();

			mockGetSuggestionsQuery( {
				params: { query: 'test-policy-badges.app' },
				suggestions: [
					buildSuggestion( {
						domain_name: 'test-policy-badges.app',
						policy_notices: [
							{
								type: 'hsts',
								message:
									'All domains with this ending require an SSL certificate to host a website.',
								label: 'HSTS required',
							},
							{
								type: 'another-one',
								message: 'Another message',
								label: 'Another badge',
							},
						],
					} ),
				],
			} );

			render(
				<TestDomainSearchWithSuggestions query="test-policy-badges.app">
					<SearchResultsItem domainName="test-policy-badges.app" />
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByTitle( 'test-policy-badges.app' ) );

			const hstsBadge = screen.getByText( 'HSTS required' );
			expect( hstsBadge ).toBeInTheDocument();

			await user.click( within( hstsBadge ).getByRole( 'button' ) );
			const popoverContent = screen.getByText(
				/All domains with this ending require an SSL certificate to host a website/
			);
			expect( popoverContent ).toBeInTheDocument();
			expect( within( popoverContent ).getByRole( 'link' ) ).toHaveAttribute(
				'href',
				localizeUrl( HTTPS_SSL )
			);

			const anotherOneBadge = screen.getByText( 'Another badge' );
			expect( anotherOneBadge ).toBeInTheDocument();

			await user.click( within( anotherOneBadge ).getByRole( 'button' ) );
			const anotherOnePopoverContent = screen.getByText( 'Another message' );
			expect( anotherOnePopoverContent ).toBeInTheDocument();
		} );

		it( 'renders the sale badge if there is a sale cost in the suggestion and the price rule is PRICE', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-sale.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test-sale.com', sale_cost: 10 } ) ],
			} );

			render(
				<TestDomainSearchWithSuggestions query="test-sale.com">
					<SearchResultsItem domainName="test-sale.com" />
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByTitle( 'test-sale.com' ) );

			expect( screen.getByText( 'Sale' ) ).toBeInTheDocument();
		} );

		it( 'renders the sale badge if there is a sale cost in the availability and the price rule is PRICE', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-sale-availability.com' },
				suggestions: [
					buildSuggestion( {
						domain_name: 'test-sale-availability.com',
						sale_cost: undefined,
					} ),
				],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-sale-availability.com' },
				availability: buildAvailability( {
					domain_name: 'test-sale-availability.com',
					status: DomainAvailabilityStatus.AVAILABLE,
					sale_cost: 10,
					currency_code: 'USD',
				} ),
			} );

			render(
				<TestDomainSearchWithSuggestions query="test-sale-availability.com">
					<SearchResultsItem domainName="test-sale-availability.com" />
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByTitle( 'test-sale-availability.com' ) );

			expect( screen.getByText( 'Sale' ) ).toBeInTheDocument();
		} );

		it( 'renders the premium badge if the suggestion is premium and the price does not exceed the limit', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-premium-normal-price.com' },
				suggestions: [
					buildSuggestion( {
						domain_name: 'test-premium-normal-price.com',
						is_premium: true,
					} ),
				],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-premium-normal-price.com' },
				availability: buildAvailability( {
					domain_name: 'test-premium-normal-price.com',
					status: DomainAvailabilityStatus.AVAILABLE_PREMIUM,
				} ),
			} );

			render(
				<TestDomainSearchWithSuggestions query="test-premium-normal-price.com">
					<SearchResultsItem domainName="test-premium-normal-price.com" />
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByTitle( 'test-premium-normal-price.com' ) );

			expect( screen.getByText( 'Premium' ) ).toBeInTheDocument();
		} );

		it( 'renders the restricted premium badge if the suggestion is premium and the price exceeds the limit', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-premium-price-limit-exceeded.com' },
				suggestions: [
					buildSuggestion( {
						domain_name: 'test-premium-price-limit-exceeded.com',
						is_premium: true,
					} ),
				],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-premium-price-limit-exceeded.com' },
				availability: buildAvailability( {
					domain_name: 'test-premium-price-limit-exceeded.com',
					status: DomainAvailabilityStatus.AVAILABLE_PREMIUM,
					is_price_limit_exceeded: true,
				} ),
			} );

			render(
				<TestDomainSearchWithSuggestions query="test-premium-price-limit-exceeded.com">
					<SearchResultsItem domainName="test-premium-price-limit-exceeded.com" />
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByTitle( 'test-premium-price-limit-exceeded.com' ) );

			expect( screen.getByText( 'Restricted premium' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'cta', () => {
		it( 'renders the add to cart cta as secondary and without text', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-add-to-cart.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test-add-to-cart.com' } ) ],
			} );

			render(
				<TestDomainSearchWithSuggestions query="test-add-to-cart.com">
					<SearchResultsItem domainName="test-add-to-cart.com" />
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByTitle( 'test-add-to-cart.com' ) );

			const cta = screen.getByRole( 'button', { name: 'Add to cart' } );

			expect( cta ).toBeInTheDocument();
			expect( cta ).toHaveClass( 'is-secondary' );
			expect( cta ).toHaveTextContent( '' );
		} );

		it( 'renders continue cta with text', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-continue.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test-continue.com' } ) ],
			} );

			render(
				<TestDomainSearchWithSuggestions
					initialCartItems={ [ buildCartItem( { domain: 'test-continue', tld: 'com' } ) ] }
					query="test-continue.com"
				>
					<SearchResultsItem domainName="test-continue.com" />
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByTitle( 'test-continue.com' ) );

			const cta = screen.getByRole( 'button', { name: 'Continue' } );

			expect( cta ).toBeInTheDocument();
			expect( cta ).toHaveClass( 'is-pressed' );
			expect( cta ).toHaveTextContent( '' );
		} );

		it( 'renders contact support cta as secondary and without text', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-contact-support.com' },
				suggestions: [
					buildSuggestion( { domain_name: 'test-contact-support.com', is_premium: true } ),
				],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-contact-support.com' },
				availability: buildAvailability( {
					domain_name: 'test-contact-support.com',
					status: DomainAvailabilityStatus.AVAILABLE_PREMIUM,
					is_price_limit_exceeded: true,
				} ),
			} );

			render(
				<TestDomainSearchWithSuggestions query="test-contact-support.com">
					<SearchResultsItem domainName="test-contact-support.com" />
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByTitle( 'test-contact-support.com' ) );

			const cta = screen.getByRole( 'link', {
				name: 'Interested in this domain? Contact support',
			} );

			expect( cta ).toBeInTheDocument();
			expect( cta ).toHaveClass( 'is-secondary' );
			expect( cta ).toHaveTextContent( '' );
		} );
	} );

	it( 'triggers the suggestion render event when the suggestion is rendered', async () => {
		const suggestion = buildSuggestion( { domain_name: 'test-suggestion-render.com' } );

		mockGetSuggestionsQuery( {
			params: { query: 'test-suggestion-render.com' },
			suggestions: [ suggestion ],
		} );

		const onSuggestionRender = jest.fn();

		render(
			<TestDomainSearchWithSuggestions
				events={ { onSuggestionRender } }
				query="test-suggestion-render.com"
			>
				<SearchResultsItem domainName="test-suggestion-render.com" />
			</TestDomainSearchWithSuggestions>
		);

		await waitFor( () => {
			expect( onSuggestionRender ).toHaveBeenCalledWith( {
				...suggestion,
				position: 0,
				price_rule: DomainPriceRule.PRICE,
			} );
		} );
	} );
} );
