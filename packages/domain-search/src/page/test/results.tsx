import { DomainAvailabilityStatus } from '@automattic/api-core';
import { render, screen, waitFor } from '@testing-library/react';
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
	} );

	describe( 'TLD deemphasis', () => {
		it( 'removes deemphasized TLDs from featured suggestions if searching for a FQDN', async () => {
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
			expect( testCom ).not.toHaveTextContent( "It's available!" );
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

	describe( 'premium domain suggestions', () => {
		it( 'renders premium suggestion if the availability query is successful', async () => {
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

	it( 'renders the search notice when applicable', async () => {
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

		const [ , notice ] = await screen.findAllByText(
			'This domain is already connected to a WordPress.com site.'
		);

		expect( notice ).toBeInTheDocument();
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
