import { DomainAvailabilityStatus } from '@automattic/api-core';
import { domainProductSlugs } from '@automattic/calypso-products';
import { localizeUrl } from '@automattic/i18n-utils';
import { HTTPS_SSL } from '@automattic/urls';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VALID_MATCH_REASONS } from '../../../helpers/parse-match-reasons';
import { DomainPriceRule } from '../../../hooks/use-suggestion';
import { buildAvailability } from '../../../test-helpers/factories/availability';
import { buildCartItem } from '../../../test-helpers/factories/cart';
import { buildSuggestion } from '../../../test-helpers/factories/suggestions';
import { mockGetAvailabilityQuery } from '../../../test-helpers/queries/availability';
import { mockGetSuggestionsQuery } from '../../../test-helpers/queries/suggestions';
import { TestDomainSearchWithSuggestions } from '../../../test-helpers/renderer';
import { FeaturedSearchResultsItem } from '../item';

describe( 'FeaturedSearchResultsItem', () => {
	describe( 'match reasons', () => {
		it( 'renders match reasons when searching for a FQDN and there are match reasons', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test.com' },
				suggestions: [
					buildSuggestion( { domain_name: 'test.com', match_reasons: [ 'exact-match' ] } ),
				],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test.com' },
				availability: buildAvailability( {
					domain_name: 'test.com',
					status: DomainAvailabilityStatus.AVAILABLE,
				} ),
			} );

			render(
				<TestDomainSearchWithSuggestions query="test.com">
					<FeaturedSearchResultsItem
						reason="recommended"
						domainName="test.com"
						isSingleFeaturedSuggestion={ false }
					/>
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByTitle( 'test.com' ) );

			expect( screen.getByText( 'Exact match' ) ).toBeInTheDocument();
		} );

		it( 'sorts match reasons', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-all-reasons.net' },
				suggestions: [
					buildSuggestion( {
						domain_name: 'test-all-reasons.net',
						match_reasons: [ ...VALID_MATCH_REASONS ].reverse(),
					} ),
				],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-all-reasons.net' },
				availability: buildAvailability( {
					domain_name: 'test-all-reasons.net',
					status: DomainAvailabilityStatus.AVAILABLE,
				} ),
			} );

			render(
				<TestDomainSearchWithSuggestions query="test-all-reasons.net">
					<FeaturedSearchResultsItem
						reason="recommended"
						domainName="test-all-reasons.net"
						isSingleFeaturedSuggestion={ false }
					/>
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByTitle( 'test-all-reasons.net' ) );

			const list = screen.getByTestId( 'domain-suggestion-match-reasons' );

			const items = within( list ).getAllByRole( 'listitem' );

			// This isn't a possible result in real life, but it's a good test to ensure that the list is sorted correctly.
			expect( items ).toHaveLength( VALID_MATCH_REASONS.length );
			expect( items[ 0 ] ).toHaveTextContent( 'Exact match' );
			expect( items[ 1 ] ).toHaveTextContent( 'Close match' );
			expect( items[ 2 ] ).toHaveTextContent( 'Extension ".net" matches your query' );
			expect( items[ 3 ] ).toHaveTextContent( 'Extension ".net" closely matches your query' );
			expect( items[ 4 ] ).toHaveTextContent( '".net" is a common extension' );
		} );

		it( 'does not render match reasons when searching for a keyword', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test' },
				suggestions: [
					buildSuggestion( { domain_name: 'test.com', match_reasons: [ 'tld-common' ] } ),
				],
			} );

			render(
				<TestDomainSearchWithSuggestions query="test">
					<FeaturedSearchResultsItem
						reason="recommended"
						domainName="test.com"
						isSingleFeaturedSuggestion={ false }
					/>
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByTitle( 'test.com' ) );

			expect( screen.queryByText( '".com" is the most common extension' ) ).not.toBeInTheDocument();
		} );

		it( 'does not render match reasons when there are no match reasons', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-no-reasons.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test-no-reasons.com' } ) ],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-no-reasons.com' },
				availability: buildAvailability( {
					domain_name: 'test-no-reasons.com',
					status: DomainAvailabilityStatus.AVAILABLE,
				} ),
			} );

			render(
				<TestDomainSearchWithSuggestions query="test-no-reasons.com">
					<FeaturedSearchResultsItem
						reason="recommended"
						domainName="test-no-reasons.com"
						isSingleFeaturedSuggestion={ false }
					/>
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByTitle( 'test-no-reasons.com' ) );

			expect( screen.queryByText( 'Exact match' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'exact match badges', () => {
		it( 'renders the exact match badge if the reason is exact-match and it is not a move suggestion', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-exact-match.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test-exact-match.com' } ) ],
			} );

			render(
				<TestDomainSearchWithSuggestions query="test-exact-match.com">
					<FeaturedSearchResultsItem
						reason="exact-match"
						domainName="test-exact-match.com"
						isSingleFeaturedSuggestion={ false }
					/>
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByTitle( 'test-exact-match.com' ) );

			expect( screen.getByText( "It's available!" ) ).toBeInTheDocument();
		} );

		it( 'does not render the exact match badge if it is a move suggestion even if the reason is exact-match', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-move-suggestion.com' },
				suggestions: [
					buildSuggestion( {
						domain_name: 'test-move-suggestion.com',
						product_slug: domainProductSlugs.DOMAIN_MOVE_INTERNAL,
					} ),
				],
			} );

			render(
				<TestDomainSearchWithSuggestions query="test-move-suggestion.com">
					<FeaturedSearchResultsItem
						reason="exact-match"
						domainName="test-move-suggestion.com"
						isSingleFeaturedSuggestion={ false }
					/>
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByTitle( 'test-move-suggestion.com' ) );

			expect( screen.queryByText( "It's available!" ) ).not.toBeInTheDocument();
		} );

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
					<FeaturedSearchResultsItem
						reason="exact-match"
						domainName="test-policy-badges.app"
						isSingleFeaturedSuggestion={ false }
					/>
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

		it( 'renders the premium badge if the FQDN is premium and is_supported_premium_domain is true', async () => {
			mockGetAvailabilityQuery( {
				params: { domainName: 'test-premium.com' },
				availability: buildAvailability( {
					domain_name: 'test-premium.com',
					status: DomainAvailabilityStatus.AVAILABLE_PREMIUM,
					is_supported_premium_domain: true,
				} ),
			} );

			mockGetSuggestionsQuery( {
				params: { query: 'test-premium.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test.net' } ) ],
			} );

			render(
				<TestDomainSearchWithSuggestions query="test-premium.com">
					<FeaturedSearchResultsItem
						reason="exact-match"
						domainName="test-premium.com"
						isSingleFeaturedSuggestion={ false }
					/>
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByTitle( 'test-premium.com' ) );

			expect( screen.getByText( "It's available!" ) ).toBeInTheDocument();
			expect( screen.getByText( 'Premium' ) ).toBeInTheDocument();
		} );

		it( 'renders the sale badge if the FQDN has a sale cost in the availability and the price rule is PRICE', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-sale-availability.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test2.com' } ) ],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-sale-availability.com' },
				availability: buildAvailability( {
					domain_name: 'test-sale-availability.com',
					status: DomainAvailabilityStatus.AVAILABLE,
					sale_cost: 10,
				} ),
			} );

			render(
				<TestDomainSearchWithSuggestions query="test-sale-availability.com">
					<FeaturedSearchResultsItem
						reason="exact-match"
						domainName="test-sale-availability.com"
						isSingleFeaturedSuggestion={ false }
					/>
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByTitle( 'test-sale-availability.com' ) );

			expect( screen.getByText( "It's available!" ) ).toBeInTheDocument();
			expect( screen.getByText( 'Sale' ) ).toBeInTheDocument();
		} );

		it( 'renders the premium and sale badges if the FQDN is premium and on sale', async () => {
			mockGetAvailabilityQuery( {
				params: { domainName: 'test-premium-sale.com' },
				availability: buildAvailability( {
					domain_name: 'test-premium-sale.com',
					status: DomainAvailabilityStatus.AVAILABLE_PREMIUM,
					is_supported_premium_domain: true,
					sale_cost: 10,
				} ),
			} );

			mockGetSuggestionsQuery( {
				params: { query: 'test-premium-sale.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test.net' } ) ],
			} );

			render(
				<TestDomainSearchWithSuggestions query="test-premium-sale.com">
					<FeaturedSearchResultsItem
						reason="exact-match"
						domainName="test-premium-sale.com"
						isSingleFeaturedSuggestion={ false }
					/>
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByTitle( 'test-premium-sale.com' ) );

			expect( screen.getByText( "It's available!" ) ).toBeInTheDocument();
			expect( screen.getByText( 'Premium' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Sale' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'general badges', () => {
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
					<FeaturedSearchResultsItem
						reason="recommended"
						domainName="test-policy-badges.app"
						isSingleFeaturedSuggestion={ false }
					/>
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

		it( 'renders the recommended badge if the reason is recommended', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-recommended.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test-recommended.com' } ) ],
			} );

			render(
				<TestDomainSearchWithSuggestions query="test-recommended.com">
					<FeaturedSearchResultsItem
						reason="recommended"
						domainName="test-recommended.com"
						isSingleFeaturedSuggestion={ false }
					/>
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByTitle( 'test-recommended.com' ) );

			expect( screen.getByText( 'Recommended' ) ).toBeInTheDocument();
		} );

		it( 'renders the best alternative badge if the reason is best-alternative', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-best-alternative.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test-best-alternative.com' } ) ],
			} );

			render(
				<TestDomainSearchWithSuggestions query="test-best-alternative.com">
					<FeaturedSearchResultsItem
						reason="best-alternative"
						domainName="test-best-alternative.com"
						isSingleFeaturedSuggestion={ false }
					/>
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByTitle( 'test-best-alternative.com' ) );

			expect( screen.getByText( 'Best alternative' ) ).toBeInTheDocument();
		} );

		it( 'renders the sale badge if there is a sale cost in the suggestion and the price rule is PRICE', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-sale.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test-sale.com', sale_cost: 10 } ) ],
			} );

			render(
				<TestDomainSearchWithSuggestions query="test-sale.com">
					<FeaturedSearchResultsItem
						reason="recommended"
						domainName="test-sale.com"
						isSingleFeaturedSuggestion={ false }
					/>
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
					<FeaturedSearchResultsItem
						reason="recommended"
						domainName="test-sale-availability.com"
						isSingleFeaturedSuggestion={ false }
					/>
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
					<FeaturedSearchResultsItem
						reason="recommended"
						domainName="test-premium-normal-price.com"
						isSingleFeaturedSuggestion={ false }
					/>
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
					<FeaturedSearchResultsItem
						reason="recommended"
						domainName="test-premium-price-limit-exceeded.com"
						isSingleFeaturedSuggestion={ false }
					/>
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByTitle( 'test-premium-price-limit-exceeded.com' ) );

			expect( screen.getByText( 'Restricted premium' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'cta', () => {
		it( 'renders the add to cart cta as primary and with text', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-add-to-cart.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test-add-to-cart.com' } ) ],
			} );

			render(
				<TestDomainSearchWithSuggestions query="test-add-to-cart.com">
					<FeaturedSearchResultsItem
						reason="recommended"
						domainName="test-add-to-cart.com"
						isSingleFeaturedSuggestion={ false }
					/>
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByTitle( 'test-add-to-cart.com' ) );

			const cta = screen.getByRole( 'button', { name: 'Add to cart' } );

			expect( cta ).toBeInTheDocument();
			expect( cta ).toHaveClass( 'is-primary' );
			expect( cta ).toHaveTextContent( 'Add to cart' );
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
					<FeaturedSearchResultsItem
						reason="recommended"
						domainName="test-continue.com"
						isSingleFeaturedSuggestion={ false }
					/>
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByTitle( 'test-continue.com' ) );

			const cta = screen.getByRole( 'button', { name: 'Continue' } );

			expect( cta ).toBeInTheDocument();
			expect( cta ).toHaveClass( 'is-pressed' );
			expect( cta ).toHaveTextContent( 'Continue' );
		} );

		it( 'renders contact support cta as primary and with text', async () => {
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
					<FeaturedSearchResultsItem
						reason="recommended"
						domainName="test-contact-support.com"
						isSingleFeaturedSuggestion={ false }
					/>
				</TestDomainSearchWithSuggestions>
			);

			await waitFor( () => screen.getByTitle( 'test-contact-support.com' ) );

			const cta = screen.getByRole( 'link', {
				name: 'Interested in this domain? Contact support',
			} );

			expect( cta ).toBeInTheDocument();
			expect( cta ).toHaveClass( 'is-primary' );
			expect( cta ).toHaveTextContent( 'Contact support' );
		} );
	} );

	it( 'renders the suggestion as highlighted if the reason is exact-match', async () => {
		mockGetSuggestionsQuery( {
			params: { query: 'test-exact-match.com' },
			suggestions: [ buildSuggestion( { domain_name: 'test-exact-match.com' } ) ],
		} );

		render(
			<TestDomainSearchWithSuggestions query="test-exact-match.com">
				<FeaturedSearchResultsItem
					reason="exact-match"
					domainName="test-exact-match.com"
					isSingleFeaturedSuggestion={ false }
				/>
			</TestDomainSearchWithSuggestions>
		);

		await waitFor( () => screen.getByTitle( 'test-exact-match.com' ) );

		expect( screen.getByTitle( 'test-exact-match.com' ) ).toHaveClass(
			'domain-suggestion-featured--highlighted'
		);
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
				<FeaturedSearchResultsItem
					reason="recommended"
					domainName="test-suggestion-render.com"
					isSingleFeaturedSuggestion={ false }
				/>
			</TestDomainSearchWithSuggestions>
		);

		await waitFor( () => {
			expect( onSuggestionRender ).toHaveBeenCalledWith(
				{
					...suggestion,
					position: 0,
					price_rule: DomainPriceRule.PRICE,
				},
				'recommended'
			);
		} );
	} );
} );
