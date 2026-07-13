import { DomainAvailabilityStatus, type BundleSuggestion } from '@automattic/api-core';
import { act, getByText, queryByText, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buildAvailability } from '../../test-helpers/factories/availability';
import { buildCart, buildCartItem } from '../../test-helpers/factories/cart';
import { buildFreeSuggestion, buildSuggestion } from '../../test-helpers/factories/suggestions';
import { mockGetAvailabilityQuery } from '../../test-helpers/queries/availability';
import {
	mockGetBundleForDomainQuery,
	mockGetBundleSuggestionQuery,
	mockGetBundleTriggersQuery,
	mockGetFreeSuggestionQuery,
	mockGetSuggestionsQuery,
} from '../../test-helpers/queries/suggestions';
import { TestDomainSearch } from '../../test-helpers/renderer';
import { ResultsPage } from '../results';

// Mirrors the retired mock fetcher's fixture shape (mock-<sld>-group ids) so
// assertions written against it keep reading naturally.
const buildBundleSuggestion = ( sld: string ): BundleSuggestion => ( {
	sld,
	domains: [
		{ domain: `${ sld }.com`, cost: '$22.00', raw_price: 22, product_slug: 'domain_reg' },
		{ domain: `${ sld }.net`, cost: '$18.00', raw_price: 18, product_slug: 'domain_reg' },
		{ domain: `${ sld }.org`, cost: '$20.00', raw_price: 20, product_slug: 'domain_reg' },
	],
	bundle_price: 48,
	original_price: 60,
	discount_percent: 20,
	category: 'business',
	bundle_id: `mock-${ sld }`,
	bundle_group_id: `mock-${ sld }-group`,
	catalogue_version: 'mock',
} );

// The restyled bundle card renders each member domain as its SLD plus a separate
// `.tld` span, so a full member domain is no longer a single text node. Match on
// the member line's combined text, scoped to the members element so ancestor
// containers (which also contain the text) don't produce multiple matches.
const memberLineHas =
	( domain: string ) =>
	( _content: string, element: Element | null ): boolean =>
		element?.classList.contains( 'bundle-card__members' ) === true &&
		( element.textContent ?? '' ).includes( domain );

const findBundleMember = ( domain: string ) => screen.findByText( memberLineHas( domain ) );
const getBundleMember = ( domain: string ) => screen.getByText( memberLineHas( domain ) );
const queryBundleMember = ( domain: string ) => screen.queryByText( memberLineHas( domain ) );

describe( 'ResultsPage', () => {
	it( 'renders the search bar, filters and cart', () => {
		render(
			<TestDomainSearch cart={ buildCart( { items: [ buildCartItem() ], total: '$100' } ) }>
				<ResultsPage />
			</TestDomainSearch>
		);

		expect( screen.getByLabelText( 'Search for a domain' ) ).toBeInTheDocument();
		expect( screen.getByLabelText( 'Filter, no filters applied' ) ).toBeInTheDocument();
		expect(
			screen.getByLabelText( '1 domain selected. $100 total price. Click to view the cart' )
		).toBeInTheDocument();
	} );

	describe( 'suggestion partitioning', () => {
		it( 'renders featured and regular suggestions', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test' },
				suggestions: [
					buildSuggestion( { domain_name: 'test.com' } ),
					buildSuggestion( { domain_name: 'test.net' } ),
					buildSuggestion( { domain_name: 'test.org' } ),
				],
			} );

			render(
				<TestDomainSearch query="test">
					<ResultsPage />
				</TestDomainSearch>
			);

			const recommended = await screen.findByTitle( 'test.com' );

			expect( recommended ).toBeInTheDocument();
			expect( recommended ).toHaveTextContent( 'Recommended' );

			const bestAlternative = await screen.findByTitle( 'test.net' );

			expect( bestAlternative ).toBeInTheDocument();
			expect( bestAlternative ).toHaveTextContent( 'Best alternative' );

			const regular = await screen.findByTitle( 'test.org' );

			expect( regular ).toBeInTheDocument();
			expect( regular ).not.toHaveTextContent( 'Recommended' );
			expect( regular ).not.toHaveTextContent( 'Best alternative' );
		} );

		it( 'renders a single featured suggestion if searching for a FQDN', async () => {
			mockGetAvailabilityQuery( {
				params: { domainName: 'test.com' },
				availability: buildAvailability( {
					domain_name: 'test.com',
					status: DomainAvailabilityStatus.AVAILABLE,
				} ),
			} );

			mockGetSuggestionsQuery( {
				params: { query: 'test.com' },
				suggestions: [
					buildSuggestion( { domain_name: 'test.com' } ),
					buildSuggestion( { domain_name: 'test.net' } ),
					buildSuggestion( { domain_name: 'test.org' } ),
				],
			} );

			render(
				<TestDomainSearch query="test.com">
					<ResultsPage />
				</TestDomainSearch>
			);

			const exactMatch = await screen.findByTitle( 'test.com' );

			expect( exactMatch ).toBeInTheDocument();
			expect( exactMatch ).toHaveTextContent( "It's available!" );

			const testNet = await screen.findByTitle( 'test.net' );

			expect( testNet ).toBeInTheDocument();
			expect( testNet ).not.toHaveTextContent( 'Recommended' );
			expect( testNet ).not.toHaveTextContent( 'Best alternative' );

			const testOrg = await screen.findByTitle( 'test.org' );

			expect( testOrg ).toBeInTheDocument();
			expect( testOrg ).not.toHaveTextContent( 'Recommended' );
			expect( testOrg ).not.toHaveTextContent( 'Best alternative' );
		} );

		it( 'renders the "show more results" button if there are more than config.numberOfDomainsResultsPerPage suggestions', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test' },
				suggestions: [
					buildSuggestion( { domain_name: 'test1.com' } ),
					buildSuggestion( { domain_name: 'test2.com' } ),
					buildSuggestion( { domain_name: 'test3.com' } ),
				],
			} );

			render(
				<TestDomainSearch config={ { numberOfDomainsResultsPerPage: 2 } } query="test">
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await screen.findByText( 'Show more results' ) ).toBeInTheDocument();
		} );

		it( 'does not render the "show more results" button if there are config.numberOfDomainsResultsPerPage or less suggestions', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test' },
				suggestions: [
					buildSuggestion( { domain_name: 'test1.com' } ),
					buildSuggestion( { domain_name: 'test2.com' } ),
				],
			} );

			render(
				<TestDomainSearch config={ { numberOfDomainsResultsPerPage: 2 } } query="test">
					<ResultsPage />
				</TestDomainSearch>
			);

			// This is just to wait for the suggestions to be loaded
			await screen.findByTitle( 'test1.com' );
			expect( screen.queryByText( 'Show more results' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'TLD deemphasis', () => {
		it( 'does not remove deemphasized TLDs from featured suggestions if searching for a FQDN', async () => {
			mockGetAvailabilityQuery( {
				params: { domainName: 'test.com' },
				availability: buildAvailability( {
					domain_name: 'test.com',
					status: DomainAvailabilityStatus.AVAILABLE,
				} ),
			} );

			mockGetSuggestionsQuery( {
				params: { query: 'test.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test.com' } ) ],
			} );

			render(
				<TestDomainSearch query="test.com" config={ { deemphasizedTlds: [ 'com' ] } }>
					<ResultsPage />
				</TestDomainSearch>
			);

			const testCom = await screen.findByTitle( 'test.com' );

			expect( testCom ).toBeInTheDocument();
			expect( testCom ).toHaveTextContent( "It's available!" );
			expect( testCom ).not.toHaveTextContent( 'Recommended' );
			expect( testCom ).not.toHaveTextContent( 'Best alternative' );
		} );

		it( 'removes deemphasized TLDs from featured suggestions', async () => {
			mockGetAvailabilityQuery( {
				params: { domainName: 'test.com' },
				availability: buildAvailability( {
					domain_name: 'test.com',
					status: DomainAvailabilityStatus.AVAILABLE,
				} ),
			} );

			mockGetSuggestionsQuery( {
				params: { query: 'test' },
				suggestions: [
					buildSuggestion( { domain_name: 'test.com' } ),
					buildSuggestion( { domain_name: 'test.net' } ),
					buildSuggestion( { domain_name: 'test.org' } ),
				],
			} );

			render(
				<TestDomainSearch query="test" config={ { deemphasizedTlds: [ 'com' ] } }>
					<ResultsPage />
				</TestDomainSearch>
			);

			const testCom = await screen.findByTitle( 'test.com' );

			expect( testCom ).toBeInTheDocument();
			expect( testCom ).not.toHaveTextContent( "It's available!" );
			expect( testCom ).not.toHaveTextContent( 'Recommended' );
			expect( testCom ).not.toHaveTextContent( 'Best alternative' );

			const recommended = await screen.findByTitle( 'test.net' );

			expect( recommended ).toBeInTheDocument();
			expect( recommended ).toHaveTextContent( 'Recommended' );

			const bestAlternative = await screen.findByTitle( 'test.org' );

			expect( bestAlternative ).toBeInTheDocument();
			expect( bestAlternative ).toHaveTextContent( 'Best alternative' );
		} );
	} );

	describe( 'FQDN suggestion', () => {
		it( 'adds FQDN suggestion to the suggestions list if the availability query is successful and it is available', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-available.com' },
				suggestions: [
					buildSuggestion( { domain_name: 'test-available.blog' } ),
					buildSuggestion( { domain_name: 'test-available.org' } ),
				],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-available.com' },
				availability: buildAvailability( {
					domain_name: 'test-available.com',
					status: DomainAvailabilityStatus.AVAILABLE,
				} ),
			} );

			render(
				<TestDomainSearch query="test-available.com" config={ { deemphasizedTlds: [ 'com' ] } }>
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await screen.findByTitle( 'test-available.com' ) ).toBeInTheDocument();
			expect( screen.queryByTitle( 'test-available.blog' ) ).toBeInTheDocument();
			expect( screen.queryByTitle( 'test-available.org' ) ).toBeInTheDocument();
		} );

		it( 'does not add FQDN suggestion to the suggestions list if the availability query is successful but it is not available', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-unavailable.com' },
				suggestions: [
					buildSuggestion( { domain_name: 'test-available.blog' } ),
					buildSuggestion( { domain_name: 'test-available.org' } ),
				],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-unavailable.com' },
				availability: buildAvailability( {
					domain_name: 'test-unavailable.com',
					status: DomainAvailabilityStatus.NOT_AVAILABLE,
				} ),
			} );

			render(
				<TestDomainSearch query="test-unavailable.com">
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await screen.findByTitle( 'test-available.blog' ) ).toBeInTheDocument();
			expect( screen.queryByTitle( 'test-available.org' ) ).toBeInTheDocument();
			expect( screen.queryByTitle( 'test-unavailable.com' ) ).not.toBeInTheDocument();
		} );

		it( 'does not add FQDN suggestion to the suggestions list if the availability query fails', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-unavailable.com' },
				suggestions: [
					buildSuggestion( { domain_name: 'test-available.blog' } ),
					buildSuggestion( { domain_name: 'test-available.org' } ),
				],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-unavailable.com' },
				availability: new Error( 'Test error' ),
			} );

			render(
				<TestDomainSearch query="test-unavailable.com">
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await screen.findByTitle( 'test-available.blog' ) ).toBeInTheDocument();
			expect( screen.queryByTitle( 'test-available.org' ) ).toBeInTheDocument();
			expect( screen.queryByTitle( 'test-unavailable.com' ) ).not.toBeInTheDocument();
		} );

		it( 'removes FQDN suggestion from the list if availability query is not successful', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-unavailable.com' },
				suggestions: [
					buildSuggestion( { domain_name: 'test-unavailable.com' } ),
					buildSuggestion( { domain_name: 'test-available.com' } ),
				],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-unavailable.com' },
				availability: new Error( 'Test error' ),
			} );

			render(
				<TestDomainSearch query="test-unavailable.com">
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await screen.findByTitle( 'test-available.com' ) ).toBeInTheDocument();

			expect( screen.queryByTitle( 'test-unavailable.com' ) ).not.toBeInTheDocument();
		} );

		it( 'removes FQDN suggestion from the list if availability query is successful but the status is not available', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-unavailable.com' },
				suggestions: [
					buildSuggestion( { domain_name: 'test-unavailable.com' } ),
					buildSuggestion( { domain_name: 'test-available.com' } ),
				],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-unavailable.com' },
				availability: buildAvailability( {
					domain_name: 'test-unavailable.com',
					status: DomainAvailabilityStatus.NOT_AVAILABLE,
				} ),
			} );

			render(
				<TestDomainSearch query="test-unavailable.com">
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await screen.findByTitle( 'test-available.com' ) ).toBeInTheDocument();

			expect( screen.queryByTitle( 'test-unavailable.com' ) ).not.toBeInTheDocument();
		} );

		it( 'removes FQDN suggestion if its registered in another site by the same user and config.includeOwnedDomainInSuggestions is false', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-unavailable.com' },
				suggestions: [
					buildSuggestion( { domain_name: 'test-unavailable.com' } ),
					buildSuggestion( { domain_name: 'test-available.com' } ),
				],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-unavailable.com' },
				availability: buildAvailability( {
					domain_name: 'test-unavailable.com',
					status: DomainAvailabilityStatus.REGISTERED_OTHER_SITE_SAME_USER,
				} ),
			} );

			render(
				<TestDomainSearch
					query="test-unavailable.com"
					config={ { includeOwnedDomainInSuggestions: false } }
				>
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await screen.findByTitle( 'test-available.com' ) ).toBeInTheDocument();

			expect( screen.queryByTitle( 'test-unavailable.com' ) ).not.toBeInTheDocument();
		} );

		it( 'keeps FQDN suggestion if its registered in another site by the same user and config.includeOwnedDomainInSuggestions is true', async () => {
			mockGetSuggestionsQuery( {
				params: {
					query: 'test-registered-in-another-site.com',
					include_internal_move_eligible: true,
				},
				suggestions: [
					buildSuggestion( { domain_name: 'test-registered-in-another-site.com' } ),
					buildSuggestion( { domain_name: 'test-available.com' } ),
				],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-registered-in-another-site.com' },
				availability: buildAvailability( {
					domain_name: 'test-registered-in-another-site.com',
					status: DomainAvailabilityStatus.REGISTERED_OTHER_SITE_SAME_USER,
				} ),
			} );

			render(
				<TestDomainSearch
					query="test-registered-in-another-site.com"
					config={ { includeOwnedDomainInSuggestions: true } }
				>
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await screen.findByTitle( 'test-available.com' ) ).toBeInTheDocument();

			expect( screen.getByTitle( 'test-registered-in-another-site.com' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'premium domain suggestions', () => {
		it( 'renders premium suggestion if its a supported premium domain', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-premium' },
				suggestions: [ buildSuggestion( { domain_name: 'test-premium.com', is_premium: true } ) ],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-premium.com' },
				availability: buildAvailability( {
					domain_name: 'test-premium.com',
					status: DomainAvailabilityStatus.AVAILABLE_PREMIUM,
					is_supported_premium_domain: true,
				} ),
			} );

			render(
				<TestDomainSearch query="test-premium">
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await screen.findByTitle( 'test-premium.com' ) ).toBeInTheDocument();
		} );

		it( 'removes premium suggestion if the availability query fails', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-failed' },
				suggestions: [
					buildSuggestion( { domain_name: 'test-failed.com', is_premium: true } ),
					buildSuggestion( { domain_name: 'test-supported.com' } ),
				],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-failed.com' },
				availability: new Error( 'Test error' ),
			} );

			render(
				<TestDomainSearch query="test-failed">
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await screen.findByTitle( 'test-supported.com' ) ).toBeInTheDocument();

			expect( screen.queryByTitle( 'test-failed.com' ) ).not.toBeInTheDocument();
		} );

		it( 'removes premium suggestion if is_supported_premium_domain is not present in the availability query', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-unsupported' },
				suggestions: [
					buildSuggestion( { domain_name: 'test-unsupported.com', is_premium: true } ),
					buildSuggestion( { domain_name: 'test-supported.com' } ),
				],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-unsupported.com' },
				availability: buildAvailability( {
					domain_name: 'test-unsupported.com',
					status: DomainAvailabilityStatus.AVAILABLE_PREMIUM,
				} ),
			} );

			render(
				<TestDomainSearch query="test-unsupported">
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await screen.findByTitle( 'test-supported.com' ) ).toBeInTheDocument();

			expect( screen.queryByTitle( 'test-unsupported.com' ) ).not.toBeInTheDocument();
		} );

		it( 'removes premium suggestion if the availability status is different from available premium', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-wrong-status' },
				suggestions: [
					buildSuggestion( { domain_name: 'test-wrong-status.com', is_premium: true } ),
					buildSuggestion( { domain_name: 'test-supported.com' } ),
				],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-wrong-status.com' },
				availability: buildAvailability( {
					domain_name: 'test-wrong-status.com',
					status: DomainAvailabilityStatus.NOT_REGISTRABLE,
				} ),
			} );

			render(
				<TestDomainSearch query="test-wrong-status">
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await screen.findByTitle( 'test-supported.com' ) ).toBeInTheDocument();

			expect( screen.queryByTitle( 'test-wrong-status.com' ) ).not.toBeInTheDocument();
		} );

		it( 'removes FQDN premium suggestion if its available but not supported', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test-unsupported.com' },
				suggestions: [
					buildSuggestion( { domain_name: 'test-unsupported.com' } ),
					buildSuggestion( { domain_name: 'test-supported.com' } ),
				],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-unsupported.com' },
				availability: buildAvailability( {
					domain_name: 'test-unsupported.com',
					status: DomainAvailabilityStatus.AVAILABLE_PREMIUM,
					is_supported_premium_domain: false,
				} ),
			} );

			render(
				<TestDomainSearch query="test-unsupported.com">
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await screen.findByTitle( 'test-supported.com' ) ).toBeInTheDocument();

			expect( screen.queryByTitle( 'test-unsupported.com' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'renders the BeforeResults slot if passed', () => {
		render(
			<TestDomainSearch slots={ { BeforeResults: () => <div>Before Results</div> } }>
				<ResultsPage />
			</TestDomainSearch>
		);

		expect( screen.getByText( 'Before Results' ) ).toBeInTheDocument();
	} );

	describe( 'compact banner', () => {
		it( 'toggles the expanded subtitle when clicked', async () => {
			const user = userEvent.setup();

			render(
				<TestDomainSearch slots={ { BeforeResults: () => <div>Before Results</div> } }>
					<ResultsPage />
				</TestDomainSearch>
			);

			const banner = screen.getByRole( 'button', {
				name: /Claim your free domain name with a paid plan/,
			} );

			expect( banner ).toHaveAttribute( 'aria-expanded', 'false' );
			expect( screen.queryByText( /Choose a domain name/ ) ).not.toBeInTheDocument();

			await user.click( banner );

			expect( banner ).toHaveAttribute( 'aria-expanded', 'true' );
			expect( screen.getByText( /Choose a domain name/ ) ).toBeInTheDocument();

			await user.click( banner );

			expect( banner ).toHaveAttribute( 'aria-expanded', 'false' );
			expect( screen.queryByText( /Choose a domain name/ ) ).not.toBeInTheDocument();
		} );

		it( 'is not rendered when no BeforeResults slot is passed', () => {
			render(
				<TestDomainSearch>
					<ResultsPage />
				</TestDomainSearch>
			);

			expect(
				screen.queryByRole( 'button', {
					name: /Claim your free domain name with a paid plan/,
				} )
			).not.toBeInTheDocument();
		} );
	} );

	it( 'renders the placeholders while loading', () => {
		render(
			<TestDomainSearch>
				<ResultsPage />
			</TestDomainSearch>
		);

		expect( screen.getAllByLabelText( 'Loading featured domain suggestion' ) ).toHaveLength( 2 );
		expect( screen.queryByLabelText( 'Loading free domain suggestion' ) ).not.toBeInTheDocument();
		expect( screen.getAllByLabelText( 'Loading domain suggestion' ) ).toHaveLength( 10 );
	} );

	describe( 'search notice', () => {
		it( 'does not render the search notice when not searching for a FQDN', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'wordpress' },
				suggestions: [ buildSuggestion( { domain_name: 'wordpress-not-fqdn.com' } ) ],
			} );

			/**
			 * Because the user is not searching for a FQDN, the general availability query
			 * for the search notice never gets triggered. If it does then this test would fail.
			 */
			mockGetAvailabilityQuery( {
				params: { domainName: 'wordpress-not-fqdn.com' },
				availability: new Error( 'This would fail if the availability query was triggered.' ),
			} );

			render(
				<TestDomainSearch query="wordpress">
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await screen.findByTitle( 'wordpress-not-fqdn.com' ) ).toBeInTheDocument();
			expect(
				screen.queryByText( 'This domain is already connected to a WordPress.com site.' )
			).not.toBeInTheDocument();
		} );

		it( 'renders the search notice when searching for a FQDN', async () => {
			mockGetSuggestionsQuery( { params: { query: 'wordpress.com' }, suggestions: [] } );

			mockGetAvailabilityQuery( {
				params: { domainName: 'wordpress.com' },
				availability: buildAvailability( {
					domain_name: 'wordpress.com',
					tld: 'com',
					status: DomainAvailabilityStatus.SERVER_TRANSFER_PROHIBITED_NOT_TRANSFERRABLE,
					mappable: 'mapped_domain',
				} ),
			} );

			render(
				<TestDomainSearch query="wordpress.com">
					<ResultsPage />
				</TestDomainSearch>
			);

			const [ notice ] = await screen.findAllByText(
				'This domain is already connected to a WordPress.com site.'
			);

			expect( notice ).toBeInTheDocument();
		} );
	} );

	it( 'renders the unavailable search result when applicable', async () => {
		mockGetSuggestionsQuery( { params: { query: 'a8ctesting.com' }, suggestions: [] } );

		mockGetAvailabilityQuery( {
			params: { domainName: 'a8ctesting.com' },
			availability: buildAvailability( {
				domain_name: 'a8ctesting.com',
				tld: 'com',
				status: DomainAvailabilityStatus.TRANSFERRABLE,
				mappable: 'mappable',
			} ),
		} );

		render(
			<TestDomainSearch query="a8ctesting.com">
				<ResultsPage />
			</TestDomainSearch>
		);

		expect( await screen.findByText( /is already registered./ ) ).toHaveTextContent(
			'a8ctesting.com is already registered.'
		);
	} );

	describe( 'free suggestion', () => {
		it( 'renders the skip suggestion placeholder when eligible and loading', () => {
			render(
				<TestDomainSearch config={ { skippable: true } }>
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( screen.getByLabelText( 'Loading free domain suggestion' ) ).toBeInTheDocument();
		} );

		it( 'renders the free suggestion', async () => {
			mockGetSuggestionsQuery( { params: { query: 'site' }, suggestions: [] } );

			mockGetFreeSuggestionQuery( {
				params: { query: 'site' },
				freeSuggestion: buildFreeSuggestion( { domain_name: 'site.wordpress.com' } ),
			} );

			render(
				<TestDomainSearch config={ { skippable: true } } query="site">
					<ResultsPage />
				</TestDomainSearch>
			);

			expect(
				await screen.findByLabelText( 'Skip purchase and continue with site.wordpress.com' )
			).toBeInTheDocument();
		} );

		it( 'does not render the skip suggestion when searching for a FQDN', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'test.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test.com' } ) ],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test.com' },
				availability: buildAvailability( {
					domain_name: 'test.com',
					status: DomainAvailabilityStatus.AVAILABLE,
				} ),
			} );

			const freeSuggestionQuery = mockGetFreeSuggestionQuery( {
				params: { query: 'test.com' },
				freeSuggestion: buildFreeSuggestion( { domain_name: 'testcom.wordpress.com' } ),
			} );

			render(
				<TestDomainSearch config={ { skippable: true } } query="test.com">
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await screen.findByTitle( 'test.com' ) ).toBeInTheDocument();
			// Ensure the free suggestion query does not get triggered
			expect( freeSuggestionQuery.isDone() ).toBe( false );
			expect( screen.queryByLabelText( 'Loading free domain suggestion' ) ).not.toBeInTheDocument();
			expect(
				screen.queryByLabelText( 'Skip purchase and continue with testcom.wordpress.com' )
			).not.toBeInTheDocument();
		} );

		it( 'renders the skip suggestion when searching for an available WordPress.com subdomain', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'mysite.wordpress.com' },
				suggestions: [ buildSuggestion( { domain_name: 'mysite.com' } ) ],
			} );

			mockGetFreeSuggestionQuery( {
				params: { query: 'mysite' },
				freeSuggestion: buildFreeSuggestion( { domain_name: 'mysite.wordpress.com' } ),
			} );

			render(
				<TestDomainSearch config={ { skippable: true } } query="mysite.wordpress.com">
					<ResultsPage />
				</TestDomainSearch>
			);

			expect(
				await screen.findByText( 'Start free with mysite.wordpress.com' )
			).toBeInTheDocument();
			expect(
				screen.getByLabelText( 'Skip purchase and continue with mysite.wordpress.com' )
			).toBeInTheDocument();
		} );

		it( 'renders unavailable notice when the searched WordPress.com subdomain is taken', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'taken.wordpress.com' },
				suggestions: [ buildSuggestion( { domain_name: 'taken.com' } ) ],
			} );

			mockGetFreeSuggestionQuery( {
				params: { query: 'taken' },
				freeSuggestion: buildFreeSuggestion( { domain_name: 'taken123.wordpress.com' } ),
			} );

			render(
				<TestDomainSearch config={ { skippable: true } } query="taken.wordpress.com">
					<ResultsPage />
				</TestDomainSearch>
			);

			expect(
				await screen.findByText( 'taken.wordpress.com is not available' )
			).toBeInTheDocument();
			expect(
				screen.getByRole( 'button', { name: 'taken123.wordpress.com' } )
			).toBeInTheDocument();
			expect( screen.queryByLabelText( /Skip purchase/ ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'free .blog subdomain suggestion', () => {
		it( 'renders the skip suggestion when searching for an available .blog subdomain', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'mysite.tech.blog' },
				suggestions: [ buildSuggestion( { domain_name: 'mysite.com' } ) ],
			} );

			mockGetFreeSuggestionQuery( {
				params: { query: 'mysite.tech.blog', include_dotblogsubdomain: true },
				freeSuggestion: buildFreeSuggestion( { domain_name: 'mysite.tech.blog' } ),
			} );

			render(
				<TestDomainSearch
					config={ { skippable: true, includeDotBlogSubdomain: true } }
					query="mysite.tech.blog"
				>
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await screen.findByText( 'Start free with mysite.tech.blog' ) ).toBeInTheDocument();
			expect(
				screen.getByLabelText( 'Skip purchase and continue with mysite.tech.blog' )
			).toBeInTheDocument();
		} );

		it( 'renders unavailable notice when the searched .blog subdomain is taken', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'taken.photo.blog' },
				suggestions: [ buildSuggestion( { domain_name: 'taken.com' } ) ],
			} );

			mockGetFreeSuggestionQuery( {
				params: { query: 'taken.photo.blog', include_dotblogsubdomain: true },
				freeSuggestion: buildFreeSuggestion( { domain_name: 'taken123.photo.blog' } ),
			} );

			render(
				<TestDomainSearch
					config={ { skippable: true, includeDotBlogSubdomain: true } }
					query="taken.photo.blog"
				>
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await screen.findByText( 'taken.photo.blog is not available' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'taken123.photo.blog' } ) ).toBeInTheDocument();
			expect( screen.queryByLabelText( /Skip purchase/ ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'bundle suggestion', () => {
		it( 'calls cart.onAddBundle once with the bundle suggestion when "Get bundle" is clicked', async () => {
			const user = userEvent.setup();
			const onAddBundle = jest.fn().mockResolvedValue( undefined );

			mockGetSuggestionsQuery( {
				params: { query: 'test-bundle-add.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test-bundle-add.com' } ) ],
			} );
			mockGetBundleSuggestionQuery( {
				params: { query: 'test-bundle-add.com' },
				bundleSuggestion: buildBundleSuggestion( 'test-bundle-add' ),
			} );

			render(
				<TestDomainSearch
					cart={ buildCart( { onAddBundle } ) }
					config={ { showBundleSuggestions: true } }
					query="test-bundle-add.com"
				>
					<ResultsPage />
				</TestDomainSearch>
			);

			await user.click( await screen.findByRole( 'button', { name: 'Get bundle' } ) );

			await waitFor( () => {
				expect( onAddBundle ).toHaveBeenCalledTimes( 1 );
			} );

			// The mock fetcher issues the bundle for the searched SLD; the whole
			// suggestion (including the server-issued group id) is handed to the
			// app layer untouched.
			expect( onAddBundle ).toHaveBeenCalledWith(
				expect.objectContaining( {
					sld: 'test-bundle-add',
					bundle_group_id: 'mock-test-bundle-add-group',
					domains: expect.arrayContaining( [
						expect.objectContaining( { domain: 'test-bundle-add.com' } ),
						expect.objectContaining( { domain: 'test-bundle-add.net' } ),
						expect.objectContaining( { domain: 'test-bundle-add.org' } ),
					] ),
				} )
			);
		} );

		it( 'shows the server error message on the bundle card when adding the bundle fails', async () => {
			const user = userEvent.setup();
			const onAddBundle = jest
				.fn()
				.mockRejectedValue(
					new Error(
						'We can’t determine the availability of the domain you’re trying to register.'
					)
				);

			mockGetSuggestionsQuery( {
				params: { query: 'test-bundle-error.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test-bundle-error.com' } ) ],
			} );
			mockGetBundleSuggestionQuery( {
				params: { query: 'test-bundle-error.com' },
				bundleSuggestion: buildBundleSuggestion( 'test-bundle-error' ),
			} );

			// Scoped to the render container because the error Notice also announces
			// the message through the a11y-speak live region on document.body.
			const { container } = render(
				<TestDomainSearch
					cart={ buildCart( { onAddBundle } ) }
					config={ { showBundleSuggestions: true } }
					query="test-bundle-error.com"
				>
					<ResultsPage />
				</TestDomainSearch>
			);

			await user.click( await screen.findByRole( 'button', { name: 'Get bundle' } ) );

			await waitFor( () => {
				expect(
					getByText(
						container,
						'We can’t determine the availability of the domain you’re trying to register.'
					)
				).toBeInTheDocument();
			} );
		} );

		it( 'shows a generic error message when the rejection has no usable message', async () => {
			const user = userEvent.setup();
			const onAddBundle = jest.fn().mockRejectedValue( new Error( '' ) );

			mockGetSuggestionsQuery( {
				params: { query: 'test-bundle-fallback.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test-bundle-fallback.com' } ) ],
			} );
			mockGetBundleSuggestionQuery( {
				params: { query: 'test-bundle-fallback.com' },
				bundleSuggestion: buildBundleSuggestion( 'test-bundle-fallback' ),
			} );

			const { container } = render(
				<TestDomainSearch
					cart={ buildCart( { onAddBundle } ) }
					config={ { showBundleSuggestions: true } }
					query="test-bundle-fallback.com"
				>
					<ResultsPage />
				</TestDomainSearch>
			);

			await user.click( await screen.findByRole( 'button', { name: 'Get bundle' } ) );

			await waitFor( () => {
				expect(
					getByText(
						container,
						'Sorry, we couldn’t add the bundle to your cart. Please try again.'
					)
				).toBeInTheDocument();
			} );
		} );

		it( 'clears the bundle card and refetches the bundle suggestion when the bundle is permanently unavailable', async () => {
			const user = userEvent.setup();
			const onAddBundle = jest.fn().mockRejectedValue(
				Object.assign( new Error( 'The domain bundle could not be added to the cart.' ), {
					code: 'domain_bundle_unavailable',
				} )
			);

			mockGetSuggestionsQuery( {
				params: { query: 'test-bundle-permanent.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test-bundle-permanent.com' } ) ],
			} );
			mockGetBundleSuggestionQuery( {
				params: { query: 'test-bundle-permanent.com' },
				bundleSuggestion: buildBundleSuggestion( 'test-bundle-permanent' ),
			} );
			const refetchRequest = mockGetBundleSuggestionQuery( {
				params: { query: 'test-bundle-permanent.com' },
				bundleSuggestion: null,
			} );

			render(
				<TestDomainSearch
					cart={ buildCart( { onAddBundle } ) }
					config={ { showBundleSuggestions: true } }
					query="test-bundle-permanent.com"
				>
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await findBundleMember( 'test-bundle-permanent.net' ) ).toBeInTheDocument();

			await user.click( screen.getByRole( 'button', { name: 'Get bundle' } ) );

			await waitFor( () => {
				expect( refetchRequest.isDone() ).toBe( true );
			} );

			await waitFor( () => {
				expect( screen.queryByRole( 'button', { name: 'Get bundle' } ) ).not.toBeInTheDocument();
			} );
			expect( queryBundleMember( 'test-bundle-permanent.net' ) ).not.toBeInTheDocument();
		} );

		it( 'keeps the stale bundle hidden when the permanent-failure refetch returns the same bundle group', async () => {
			const user = userEvent.setup();
			const unavailableBundle = buildBundleSuggestion( 'test-bundle-same-group' );
			const onAddBundle = jest.fn().mockRejectedValue(
				Object.assign( new Error( 'The domain bundle could not be added to the cart.' ), {
					code: 'domain_bundle_unavailable',
				} )
			);

			mockGetSuggestionsQuery( {
				params: { query: 'test-bundle-same-group.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test-bundle-same-group.com' } ) ],
			} );
			mockGetBundleSuggestionQuery( {
				params: { query: 'test-bundle-same-group.com' },
				bundleSuggestion: unavailableBundle,
			} );
			const refetchRequest = mockGetBundleSuggestionQuery( {
				params: { query: 'test-bundle-same-group.com' },
				bundleSuggestion: unavailableBundle,
			} );

			render(
				<TestDomainSearch
					cart={ buildCart( { onAddBundle } ) }
					config={ { showBundleSuggestions: true } }
					query="test-bundle-same-group.com"
				>
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await findBundleMember( 'test-bundle-same-group.net' ) ).toBeInTheDocument();

			await user.click( screen.getByRole( 'button', { name: 'Get bundle' } ) );

			await waitFor( () => {
				expect( refetchRequest.isDone() ).toBe( true );
			} );

			await waitFor( () => {
				expect( screen.queryByRole( 'button', { name: 'Get bundle' } ) ).not.toBeInTheDocument();
			} );
			expect( queryBundleMember( 'test-bundle-same-group.net' ) ).not.toBeInTheDocument();
		} );

		it( 'does not hide or refetch the next query when an old bundle add fails permanently', async () => {
			const user = userEvent.setup();
			let rejectAddBundle: ( error: Error ) => void = () => {};
			const staleBundle = buildBundleSuggestion( 'test-bundle-late-stale' );
			const freshBundle = {
				...buildBundleSuggestion( 'test-bundle-late-fresh' ),
				bundle_group_id: staleBundle.bundle_group_id,
			};
			const onAddBundle = jest.fn(
				() =>
					new Promise< void >( ( _resolve, reject ) => {
						rejectAddBundle = reject;
					} )
			);

			mockGetSuggestionsQuery( {
				params: { query: 'test-bundle-late-stale.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test-bundle-late-stale.com' } ) ],
			} );
			mockGetBundleSuggestionQuery( {
				params: { query: 'test-bundle-late-stale.com' },
				bundleSuggestion: staleBundle,
			} );

			mockGetSuggestionsQuery( {
				params: { query: 'test-bundle-late-fresh.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test-bundle-late-fresh.com' } ) ],
			} );
			mockGetBundleSuggestionQuery( {
				params: { query: 'test-bundle-late-fresh.com' },
				bundleSuggestion: freshBundle,
			} );
			const freshRefetchRequest = mockGetBundleSuggestionQuery( {
				params: { query: 'test-bundle-late-fresh.com' },
				bundleSuggestion: null,
			} );

			const { rerender } = render(
				<TestDomainSearch
					cart={ buildCart( { onAddBundle } ) }
					config={ { showBundleSuggestions: true } }
					query="test-bundle-late-stale.com"
				>
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await findBundleMember( 'test-bundle-late-stale.net' ) ).toBeInTheDocument();

			await user.click( screen.getByRole( 'button', { name: 'Get bundle' } ) );

			rerender(
				<TestDomainSearch
					cart={ buildCart( { onAddBundle } ) }
					config={ { showBundleSuggestions: true } }
					query="test-bundle-late-fresh.com"
				>
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await findBundleMember( 'test-bundle-late-fresh.net' ) ).toBeInTheDocument();

			await act( async () => {
				rejectAddBundle(
					Object.assign( new Error( 'The domain bundle could not be added to the cart.' ), {
						code: 'domain_bundle_unavailable',
					} )
				);
			} );

			expect( freshRefetchRequest.isDone() ).toBe( false );
			expect( getBundleMember( 'test-bundle-late-fresh.net' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'Get bundle' } ) ).toBeEnabled();
		} );

		it( 'clears the error when retrying succeeds', async () => {
			const user = userEvent.setup();
			const onAddBundle = jest
				.fn()
				.mockRejectedValueOnce( new Error( 'Transient bundle error' ) )
				.mockResolvedValueOnce( undefined );

			mockGetSuggestionsQuery( {
				params: { query: 'test-bundle-retry.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test-bundle-retry.com' } ) ],
			} );
			mockGetBundleSuggestionQuery( {
				params: { query: 'test-bundle-retry.com' },
				bundleSuggestion: buildBundleSuggestion( 'test-bundle-retry' ),
			} );

			const { container } = render(
				<TestDomainSearch
					cart={ buildCart( { onAddBundle } ) }
					config={ { showBundleSuggestions: true } }
					query="test-bundle-retry.com"
				>
					<ResultsPage />
				</TestDomainSearch>
			);

			await user.click( await screen.findByRole( 'button', { name: 'Get bundle' } ) );

			await waitFor( () => {
				expect( getByText( container, 'Transient bundle error' ) ).toBeInTheDocument();
			} );

			await user.click( screen.getByRole( 'button', { name: 'Get bundle' } ) );

			await waitFor( () => {
				expect( queryByText( container, 'Transient bundle error' ) ).not.toBeInTheDocument();
			} );

			expect( onAddBundle ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'clears the error when the search query changes', async () => {
			const user = userEvent.setup();
			const onAddBundle = jest.fn().mockRejectedValue( new Error( 'Stale bundle error' ) );
			const cart = buildCart( { onAddBundle } );

			mockGetSuggestionsQuery( {
				params: { query: 'test-bundle-stale.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test-bundle-stale.com' } ) ],
			} );
			mockGetBundleSuggestionQuery( {
				params: { query: 'test-bundle-stale.com' },
				bundleSuggestion: buildBundleSuggestion( 'test-bundle-stale' ),
			} );
			mockGetSuggestionsQuery( {
				params: { query: 'test-bundle-fresh.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test-bundle-fresh.com' } ) ],
			} );
			mockGetBundleSuggestionQuery( {
				params: { query: 'test-bundle-fresh.com' },
				bundleSuggestion: buildBundleSuggestion( 'test-bundle-fresh' ),
			} );

			const { container, rerender } = render(
				<TestDomainSearch
					cart={ cart }
					config={ { showBundleSuggestions: true } }
					query="test-bundle-stale.com"
				>
					<ResultsPage />
				</TestDomainSearch>
			);

			await user.click( await screen.findByRole( 'button', { name: 'Get bundle' } ) );

			await waitFor( () => {
				expect( getByText( container, 'Stale bundle error' ) ).toBeInTheDocument();
			} );

			// A new search renders a new bundle suggestion; the old failure
			// shouldn't be pinned to it.
			rerender(
				<TestDomainSearch
					cart={ cart }
					config={ { showBundleSuggestions: true } }
					query="test-bundle-fresh.com"
				>
					<ResultsPage />
				</TestDomainSearch>
			);

			await waitFor( () => {
				expect( queryByText( container, 'Stale bundle error' ) ).not.toBeInTheDocument();
			} );

			expect( await screen.findByRole( 'button', { name: 'Get bundle' } ) ).toBeEnabled();
		} );

		it( 'disables the CTA while the bundle add is pending', async () => {
			const user = userEvent.setup();
			let resolveAdd = () => {};
			const onAddBundle = jest.fn().mockImplementation(
				() =>
					new Promise< void >( ( resolve ) => {
						resolveAdd = resolve;
					} )
			);

			mockGetSuggestionsQuery( {
				params: { query: 'test-bundle-pending.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test-bundle-pending.com' } ) ],
			} );
			mockGetBundleSuggestionQuery( {
				params: { query: 'test-bundle-pending.com' },
				bundleSuggestion: buildBundleSuggestion( 'test-bundle-pending' ),
			} );

			render(
				<TestDomainSearch
					cart={ buildCart( { onAddBundle } ) }
					config={ { showBundleSuggestions: true } }
					query="test-bundle-pending.com"
				>
					<ResultsPage />
				</TestDomainSearch>
			);

			await user.click( await screen.findByRole( 'button', { name: 'Get bundle' } ) );

			await waitFor( () => {
				expect( screen.getByRole( 'button', { name: 'Get bundle' } ) ).toBeDisabled();
			} );

			resolveAdd();

			await waitFor( () => {
				expect( screen.getByRole( 'button', { name: 'Get bundle' } ) ).toBeEnabled();
			} );

			expect( onAddBundle ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'yields the bundle error when another add-to-cart mutation starts', async () => {
			const user = userEvent.setup();
			const onAddBundle = jest.fn().mockRejectedValue( new Error( 'Bundle add failed' ) );

			mockGetSuggestionsQuery( {
				params: { query: 'test-bundle-supersede.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test-bundle-supersede.com' } ) ],
			} );
			mockGetBundleSuggestionQuery( {
				params: { query: 'test-bundle-supersede.com' },
				bundleSuggestion: buildBundleSuggestion( 'test-bundle-supersede' ),
			} );
			mockGetAvailabilityQuery( {
				params: { domainName: 'test-bundle-supersede.com' },
				availability: buildAvailability( {
					domain_name: 'test-bundle-supersede.com',
					status: DomainAvailabilityStatus.AVAILABLE,
				} ),
			} );

			const { container } = render(
				<TestDomainSearch
					cart={ buildCart( { onAddBundle } ) }
					config={ { showBundleSuggestions: true } }
					query="test-bundle-supersede.com"
				>
					<ResultsPage />
				</TestDomainSearch>
			);

			await user.click( await screen.findByRole( 'button', { name: 'Get bundle' } ) );

			await waitFor( () => {
				expect( getByText( container, 'Bundle add failed' ) ).toBeInTheDocument();
			} );

			// The most recent mutation owns the error surface: starting a
			// single-domain add supersedes the bundle failure.
			await user.click( screen.getByRole( 'button', { name: 'Add to cart' } ) );

			await waitFor( () => {
				expect( queryByText( container, 'Bundle add failed' ) ).not.toBeInTheDocument();
			} );
		} );
	} );

	describe( 'bundle continue state', () => {
		it( 'shows Continue instead of Get bundle when every bundle member is in the cart', async () => {
			const user = userEvent.setup();
			const onContinue = jest.fn();

			mockGetSuggestionsQuery( {
				params: { query: 'bundle-added.com' },
				suggestions: [ buildSuggestion( { domain_name: 'bundle-added.com' } ) ],
			} );
			mockGetBundleSuggestionQuery( {
				params: { query: 'bundle-added.com' },
				bundleSuggestion: buildBundleSuggestion( 'bundle-added' ),
			} );

			const { container } = render(
				<TestDomainSearch
					cart={ buildCart( { hasItem: ( domain ) => domain.startsWith( 'bundle-added.' ) } ) }
					config={ { showBundleSuggestions: true } }
					events={ { onContinue } }
					query="bundle-added.com"
				>
					<ResultsPage />
				</TestDomainSearch>
			);

			await waitFor( () => {
				expect( container.querySelector( '.bundle-card__cta' ) ).toBeInTheDocument();
			} );
			const bundleCta = container.querySelector( '.bundle-card__cta' ) as HTMLElement;

			expect( bundleCta ).toHaveTextContent( 'Continue' );
			expect( screen.queryByRole( 'button', { name: 'Get bundle' } ) ).not.toBeInTheDocument();

			await user.click( bundleCta );
			expect( onContinue ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'keeps Get bundle when only some members are in the cart', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'bundle-partial.com' },
				suggestions: [ buildSuggestion( { domain_name: 'bundle-partial.com' } ) ],
			} );
			mockGetBundleSuggestionQuery( {
				params: { query: 'bundle-partial.com' },
				bundleSuggestion: buildBundleSuggestion( 'bundle-partial' ),
			} );

			render(
				<TestDomainSearch
					cart={ buildCart( { hasItem: ( domain ) => domain === 'bundle-partial.com' } ) }
					config={ { showBundleSuggestions: true } }
					query="bundle-partial.com"
				>
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await screen.findByRole( 'button', { name: 'Get bundle' } ) ).toBeInTheDocument();
		} );
	} );

	describe( 'inline bundle', () => {
		// A bare-term search whose cart holds a trigger domain (flowers.com) shows an
		// inline bundle row beneath that domain's suggestion row, offering the
		// companion extensions while pricing the full bundle.
		const flowersBundle: BundleSuggestion = {
			sld: 'flowers',
			domains: [
				{
					domain: 'flowers.com',
					cost: '$22.00',
					raw_price: 22,
					product_slug: 'domain_reg',
					role: 'primary',
				},
				{
					domain: 'flowers.net',
					cost: '$18.00',
					raw_price: 18,
					product_slug: 'domain_reg',
					role: 'companion',
				},
			],
			bundle_price: 36,
			original_price: 44,
			discount_percent: 18,
			category: 'business',
			bundle_id: 'flowers-bundle',
			bundle_group_id: 'v1.flowers.deadbeef',
			catalogue_version: '1',
		};

		it( 'renders an inline bundle row beneath a trigger domain that is in the cart', async () => {
			// Two other suggestions come first so flowers.com lands in the regular
			// list (where the inline row is injected), not the featured grid.
			mockGetSuggestionsQuery( {
				params: { query: 'flowers' },
				suggestions: [
					buildSuggestion( { domain_name: 'flowers.io' } ),
					buildSuggestion( { domain_name: 'flowers.co' } ),
					buildSuggestion( { domain_name: 'flowers.com' } ),
				],
			} );
			mockGetBundleTriggersQuery( { params: { query: 'flowers' }, bundleTriggers: [ 'com' ] } );
			mockGetBundleForDomainQuery( { fqdn: 'flowers.com', bundleSuggestion: flowersBundle } );

			render(
				<TestDomainSearch
					cart={ buildCart( {
						items: [ buildCartItem( { domain: 'flowers', tld: 'com' } ) ],
					} ) }
					config={ { showBundleSuggestions: true } }
					query="flowers"
				>
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await screen.findByRole( 'button', { name: 'Get bundle' } ) ).toBeInTheDocument();
			// The companion (.net) is offered; the primary (.com) is not chipped.
			expect( screen.getByText( '.net' ) ).toBeInTheDocument();
			expect(
				screen.getByText( 'Secure popular domain extensions and protect your brand' )
			).toBeInTheDocument();
		} );

		it( 'does not render an inline bundle row when no trigger domain is in the cart', async () => {
			mockGetSuggestionsQuery( {
				params: { query: 'flowers' },
				suggestions: [
					buildSuggestion( { domain_name: 'flowers.io' } ),
					buildSuggestion( { domain_name: 'flowers.co' } ),
					buildSuggestion( { domain_name: 'flowers.com' } ),
				],
			} );
			mockGetBundleTriggersQuery( { params: { query: 'flowers' }, bundleTriggers: [ 'com' ] } );

			render(
				<TestDomainSearch config={ { showBundleSuggestions: true } } query="flowers">
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await screen.findByTitle( 'flowers.com' ) ).toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: 'Get bundle' } ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'tracking', () => {
		it( 'fires the onSuggestionsReceive event when the suggestions are received', async () => {
			const onSuggestionsReceive = jest.fn();

			mockGetSuggestionsQuery( {
				params: { query: 'test-receive' },
				suggestions: [
					buildSuggestion( { domain_name: 'test.com' } ),
					buildSuggestion( { domain_name: 'test.net' } ),
					buildSuggestion( { domain_name: 'test.org' } ),
				],
			} );

			render(
				<TestDomainSearch events={ { onSuggestionsReceive } } query="test-receive">
					<ResultsPage />
				</TestDomainSearch>
			);

			await waitFor( () => {
				expect( onSuggestionsReceive ).toHaveBeenCalledWith(
					'test-receive',
					[ 'test.com', 'test.net', 'test.org' ],
					expect.any( Number )
				);
			} );
		} );

		it( 'fires the onShowMoreResults event when the show more results button is clicked', async () => {
			const user = userEvent.setup();
			const onShowMoreResults = jest.fn();

			mockGetSuggestionsQuery( {
				params: { query: 'test query' },
				suggestions: [
					buildSuggestion( { domain_name: 'test1.com' } ),
					buildSuggestion( { domain_name: 'test2.com' } ),
					buildSuggestion( { domain_name: 'test3.com' } ),
					buildSuggestion( { domain_name: 'test4.com' } ),
					buildSuggestion( { domain_name: 'test5.com' } ),
					buildSuggestion( { domain_name: 'test6.com' } ),
					buildSuggestion( { domain_name: 'test7.com' } ),
					buildSuggestion( { domain_name: 'test8.com' } ),
					buildSuggestion( { domain_name: 'test9.com' } ),
					buildSuggestion( { domain_name: 'test10.com' } ),
					buildSuggestion( { domain_name: 'test11.com' } ),
				],
			} );

			render(
				<TestDomainSearch events={ { onShowMoreResults } } query="test query">
					<ResultsPage />
				</TestDomainSearch>
			);

			await user.click( await screen.findByText( 'Show more results' ) );

			await waitFor( () => {
				expect( onShowMoreResults ).toHaveBeenCalledWith( 2 ); // show second page of results
			} );
		} );

		it( 'fires the onBundleShown event once when a bundle suggestion renders', async () => {
			const onBundleShown = jest.fn();

			mockGetSuggestionsQuery( {
				params: { query: 'bundle-shown.com' },
				suggestions: [ buildSuggestion( { domain_name: 'bundle-shown.com' } ) ],
			} );
			mockGetBundleSuggestionQuery( {
				params: { query: 'bundle-shown.com' },
				bundleSuggestion: buildBundleSuggestion( 'bundle-shown' ),
			} );

			render(
				<TestDomainSearch
					events={ { onBundleShown } }
					config={ { showBundleSuggestions: true } }
					query="bundle-shown.com"
				>
					<ResultsPage />
				</TestDomainSearch>
			);

			await waitFor( () => {
				expect( onBundleShown ).toHaveBeenCalledTimes( 1 );
			} );

			expect( onBundleShown ).toHaveBeenCalledWith(
				expect.objectContaining( {
					bundle_group_id: 'mock-bundle-shown-group',
					domains: expect.arrayContaining( [
						expect.objectContaining( { domain: 'bundle-shown.com' } ),
					] ),
				} )
			);
		} );

		it( 'does not fire the onBundleShown event when bundles are disabled', async () => {
			const onBundleShown = jest.fn();

			mockGetSuggestionsQuery( {
				params: { query: 'bundle-off' },
				suggestions: [ buildSuggestion( { domain_name: 'bundle-off.com' } ) ],
			} );

			render(
				<TestDomainSearch events={ { onBundleShown } } query="bundle-off">
					<ResultsPage />
				</TestDomainSearch>
			);

			expect( await screen.findByTitle( 'bundle-off.com' ) ).toBeInTheDocument();
			expect( onBundleShown ).not.toHaveBeenCalled();
		} );

		it( 'fires the onBundleAddToCart event after the bundle add succeeds', async () => {
			const user = userEvent.setup();
			let resolveAddBundle: () => void = () => {};
			const onAddBundle = jest.fn(
				() =>
					new Promise< void >( ( resolve ) => {
						resolveAddBundle = resolve;
					} )
			);
			const onBundleAddToCart = jest.fn();

			mockGetSuggestionsQuery( {
				params: { query: 'bundle-accept.com' },
				suggestions: [ buildSuggestion( { domain_name: 'bundle-accept.com' } ) ],
			} );
			mockGetBundleSuggestionQuery( {
				params: { query: 'bundle-accept.com' },
				bundleSuggestion: buildBundleSuggestion( 'bundle-accept' ),
			} );

			render(
				<TestDomainSearch
					cart={ buildCart( { onAddBundle } ) }
					events={ { onBundleAddToCart } }
					config={ { showBundleSuggestions: true } }
					query="bundle-accept.com"
				>
					<ResultsPage />
				</TestDomainSearch>
			);

			await user.click( await screen.findByRole( 'button', { name: 'Get bundle' } ) );

			expect( onAddBundle ).toHaveBeenCalledTimes( 1 );
			expect( onBundleAddToCart ).not.toHaveBeenCalled();

			await act( async () => {
				resolveAddBundle();
			} );

			await waitFor( () => {
				expect( onBundleAddToCart ).toHaveBeenCalledTimes( 1 );
			} );
			expect( onBundleAddToCart ).toHaveBeenCalledWith(
				expect.objectContaining( { bundle_group_id: 'mock-bundle-accept-group' } )
			);
		} );

		it( 'does not fire the onBundleAddToCart event when the bundle add fails', async () => {
			const user = userEvent.setup();
			const onAddBundle = jest.fn().mockRejectedValue( new Error( 'Bundle add failed' ) );
			const onBundleAddToCart = jest.fn();

			mockGetSuggestionsQuery( {
				params: { query: 'bundle-reject.com' },
				suggestions: [ buildSuggestion( { domain_name: 'bundle-reject.com' } ) ],
			} );
			mockGetBundleSuggestionQuery( {
				params: { query: 'bundle-reject.com' },
				bundleSuggestion: buildBundleSuggestion( 'bundle-reject' ),
			} );

			const { container } = render(
				<TestDomainSearch
					cart={ buildCart( { onAddBundle } ) }
					events={ { onBundleAddToCart } }
					config={ { showBundleSuggestions: true } }
					query="bundle-reject.com"
				>
					<ResultsPage />
				</TestDomainSearch>
			);

			await user.click( await screen.findByRole( 'button', { name: 'Get bundle' } ) );

			await waitFor( () => {
				expect( onAddBundle ).toHaveBeenCalledTimes( 1 );
			} );
			await waitFor( () => {
				expect( getByText( container, 'Bundle add failed' ) ).toBeInTheDocument();
			} );
			expect( onBundleAddToCart ).not.toHaveBeenCalled();
		} );

		it( 'does not fire the onBundleAddToCart event when no bundle add handler exists', async () => {
			const user = userEvent.setup();
			const onBundleAddToCart = jest.fn();

			mockGetSuggestionsQuery( {
				params: { query: 'bundle-no-handler.com' },
				suggestions: [ buildSuggestion( { domain_name: 'bundle-no-handler.com' } ) ],
			} );
			mockGetBundleSuggestionQuery( {
				params: { query: 'bundle-no-handler.com' },
				bundleSuggestion: buildBundleSuggestion( 'bundle-no-handler' ),
			} );

			render(
				<TestDomainSearch
					cart={ buildCart( { onAddBundle: undefined } ) }
					events={ { onBundleAddToCart } }
					config={ { showBundleSuggestions: true } }
					query="bundle-no-handler.com"
				>
					<ResultsPage />
				</TestDomainSearch>
			);

			await user.click( await screen.findByRole( 'button', { name: 'Get bundle' } ) );
			await act( async () => {
				await Promise.resolve();
			} );

			expect( onBundleAddToCart ).not.toHaveBeenCalled();
		} );

		it( 'fires the onQueryAvailabilityCheck event when the availability is checked', async () => {
			const onQueryAvailabilityCheck = jest.fn();

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-available.com' },
				availability: buildAvailability( {
					domain_name: 'test-available.com',
					status: DomainAvailabilityStatus.AVAILABLE,
				} ),
			} );

			mockGetSuggestionsQuery( {
				params: { query: 'test-available.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test-available.com' } ) ],
			} );

			render(
				<TestDomainSearch events={ { onQueryAvailabilityCheck } } query="test-available.com">
					<ResultsPage />
				</TestDomainSearch>
			);

			await waitFor( () => {
				expect( onQueryAvailabilityCheck ).toHaveBeenCalledWith(
					DomainAvailabilityStatus.AVAILABLE,
					'test-available.com',
					expect.any( Number )
				);
			} );
		} );
	} );
} );
