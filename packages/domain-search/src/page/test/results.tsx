import { DomainAvailabilityStatus } from '@automattic/api-core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buildAvailability } from '../../test-helpers/factories/availability';
import { buildCart, buildCartItem } from '../../test-helpers/factories/cart';
import { buildFreeSuggestion, buildSuggestion } from '../../test-helpers/factories/suggestions';
import { mockGetAvailabilityQuery } from '../../test-helpers/queries/availability';
import {
	mockGetFreeSuggestionQuery,
	mockGetSuggestionsQuery,
} from '../../test-helpers/queries/suggestions';
import { TestDomainSearch } from '../../test-helpers/renderer';
import { ResultsPage } from '../results';

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
