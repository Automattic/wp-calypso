import { DomainAvailabilityStatus } from '@automattic/api-core';
import { render, screen, waitFor } from '@testing-library/react';
import { buildAvailability } from '../../test/factories/availability';
import { buildFreeSuggestion, buildSuggestion } from '../../test/factories/suggestions';
import { mockGetAvailability } from '../../test/mocks/availability';
import { mockGetFreeSuggestion, mockGetSuggestions } from '../../test/mocks/suggestions';
import { TestDomainSearch } from '../../test/renderer';
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

	it( 'renders featured and regular suggestions', async () => {
		mockGetSuggestions( 'test', [
			buildSuggestion( { domain_name: 'test.com' } ),
			buildSuggestion( { domain_name: 'test.net' } ),
			buildSuggestion( { domain_name: 'test.org' } ),
		] );

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

	it( 'renders the before results slot if passed', () => {
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
		mockGetSuggestions( 'wordpress.com', [] );

		mockGetAvailability(
			buildAvailability( {
				domain_name: 'wordpress.com',
				tld: 'com',
				status: DomainAvailabilityStatus.SERVER_TRANSFER_PROHIBITED_NOT_TRANSFERRABLE,
				mappable: 'mapped_domain',
			} )
		);

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
		mockGetSuggestions( 'a8ctesting.com', [] );

		mockGetAvailability(
			buildAvailability( {
				domain_name: 'a8ctesting.com',
				tld: 'com',
				status: DomainAvailabilityStatus.TRANSFERRABLE,
				mappable: 'mappable',
			} )
		);

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
			mockGetSuggestions( 'site', [] );

			mockGetFreeSuggestion( 'site', buildFreeSuggestion( { domain_name: 'site.wordpress.com' } ) );

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

			mockGetSuggestions( 'test', [
				buildSuggestion( { domain_name: 'test.com' } ),
				buildSuggestion( { domain_name: 'test.net' } ),
				buildSuggestion( { domain_name: 'test.org' } ),
			] );

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

			mockGetAvailability(
				buildAvailability( { domain_name: 'test.com', status: DomainAvailabilityStatus.AVAILABLE } )
			);

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
