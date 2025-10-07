import { DomainAvailabilityStatus } from '@automattic/api-core';
import { render, screen, waitFor } from '@testing-library/react';
import { buildAvailability } from '../../test-helpers/factories/availability';
import { buildFreeSuggestion, buildSuggestion } from '../../test-helpers/factories/suggestions';
import { mockGetAvailabilityQuery } from '../../test-helpers/queries/availability';
import {
	mockGetFreeSuggestionQuery,
	mockGetSuggestionsQuery,
} from '../../test-helpers/queries/suggestions';
import { TestDomainSearch } from '../../test-helpers/renderer';
import { ResultsPage } from '../results';

describe( 'ResultsPage', () => {
	it( 'renders the search bar and filters', () => {
		render(
			<TestDomainSearch>
				<ResultsPage />
			</TestDomainSearch>
		);

		expect( screen.getByLabelText( 'Search for a domain' ) ).toBeInTheDocument();
		expect( screen.getByLabelText( 'Filter, no filters applied' ) ).toBeInTheDocument();
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
			expect( recommended ).toHaveAttribute( 'data-testid', 'featured-suggestion' );
			expect( recommended ).toHaveTextContent( 'Recommended' );

			const bestAlternative = await screen.findByTitle( 'test.net' );

			expect( bestAlternative ).toBeInTheDocument();
			expect( bestAlternative ).toHaveAttribute( 'data-testid', 'featured-suggestion' );
			expect( bestAlternative ).toHaveTextContent( 'Best alternative' );

			const regular = await screen.findByTitle( 'test.org' );

			expect( regular ).toBeInTheDocument();
			expect( regular ).toHaveAttribute( 'data-testid', 'suggestion' );
			expect( regular ).not.toHaveTextContent( 'Recommended' );
			expect( regular ).not.toHaveTextContent( 'Best alternative' );
		} );

		it( 'renders a single featured suggestion if searching for a FQDN', async () => {
			mockGetAvailabilityQuery( {
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
			expect( exactMatch ).toHaveAttribute( 'data-testid', 'featured-suggestion' );

			const testNet = await screen.findByTitle( 'test.net' );

			expect( testNet ).toBeInTheDocument();
			expect( testNet ).toHaveAttribute( 'data-testid', 'suggestion' );

			const testOrg = await screen.findByTitle( 'test.org' );

			expect( testOrg ).toBeInTheDocument();
			expect( testOrg ).toHaveAttribute( 'data-testid', 'suggestion' );
		} );

		it( 'removes deemphasized TLDs from featured suggestions if searching for a FQDN', async () => {
			mockGetAvailabilityQuery( {
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
			expect( testCom ).toHaveAttribute( 'data-testid', 'suggestion' );
		} );

		it( 'removes deemphasized TLDs from featured suggestions', async () => {
			mockGetAvailabilityQuery( {
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
			expect( testCom ).toHaveAttribute( 'data-testid', 'suggestion' );

			const recommended = await screen.findByTitle( 'test.net' );

			expect( recommended ).toBeInTheDocument();
			expect( recommended ).toHaveAttribute( 'data-testid', 'featured-suggestion' );
			expect( recommended ).toHaveTextContent( 'Recommended' );

			const bestAlternative = await screen.findByTitle( 'test.org' );

			expect( bestAlternative ).toBeInTheDocument();
			expect( bestAlternative ).toHaveAttribute( 'data-testid', 'featured-suggestion' );
			expect( bestAlternative ).toHaveTextContent( 'Best alternative' );
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
			'This domain is already mapped to a WordPress.com site.'
		);

		expect( notice ).toBeInTheDocument();
	} );

	it( 'renders the unavailable search result when applicable', async () => {
		mockGetSuggestionsQuery( { params: { query: 'a8ctesting.com' }, suggestions: [] } );

		mockGetAvailabilityQuery( {
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
				params: { query: 'test' },
				suggestions: [
					buildSuggestion( { domain_name: 'test.com' } ),
					buildSuggestion( { domain_name: 'test.net' } ),
					buildSuggestion( { domain_name: 'test.org' } ),
				],
			} );

			render(
				<TestDomainSearch events={ { onSuggestionsReceive } } query="test">
					<ResultsPage />
				</TestDomainSearch>
			);

			await waitFor( () => {
				expect( onSuggestionsReceive ).toHaveBeenCalledWith(
					'test',
					[ 'test.com', 'test.net', 'test.org' ],
					expect.any( Number )
				);
			} );
		} );

		it( 'fires the onQueryAvailabilityCheck event when the availability is checked', async () => {
			const onQueryAvailabilityCheck = jest.fn();

			mockGetAvailabilityQuery( {
				availability: buildAvailability( {
					domain_name: 'test.com',
					status: DomainAvailabilityStatus.AVAILABLE,
				} ),
			} );

			render(
				<TestDomainSearch events={ { onQueryAvailabilityCheck } } query="test.com">
					<ResultsPage />
				</TestDomainSearch>
			);

			await waitFor( () => {
				expect( onQueryAvailabilityCheck ).toHaveBeenCalledWith(
					DomainAvailabilityStatus.AVAILABLE,
					'test.com',
					expect.any( Number )
				);
			} );
		} );
	} );
} );
