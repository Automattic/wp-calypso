import { DomainAvailabilityStatus } from '@automattic/api-core';
import { render, screen } from '@testing-library/react';
import { FeaturedSearchResults } from '..';
import { buildAvailability } from '../../../test-helpers/factories/availability';
import { buildSuggestion } from '../../../test-helpers/factories/suggestions';
import { mockGetAvailabilityQuery } from '../../../test-helpers/queries/availability';
import { mockGetSuggestionsQuery } from '../../../test-helpers/queries/suggestions';
import { TestDomainSearchWithSuggestions } from '../../../test-helpers/renderer';

describe( 'FeaturedSearchResults', () => {
	it( 'keeps rendering the other featured results if one of them throws', async () => {
		// React logs the error caught by the boundary.
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		const onSuggestionNotFound = jest.fn();

		mockGetSuggestionsQuery( {
			params: { query: 'test' },
			suggestions: [ buildSuggestion( { domain_name: 'test-featured.com' } ) ],
		} );

		render(
			<TestDomainSearchWithSuggestions query="test" events={ { onSuggestionNotFound } }>
				<FeaturedSearchResults
					suggestions={ [
						{ reason: 'recommended', suggestion: 'test-missing.com' },
						{ reason: 'best-alternative', suggestion: 'test-featured.com' },
					] }
				/>
			</TestDomainSearchWithSuggestions>
		);

		expect( await screen.findByTitle( 'test-featured.com' ) ).toBeInTheDocument();
		expect( screen.queryByTitle( 'test-missing.com' ) ).not.toBeInTheDocument();
		expect( onSuggestionNotFound ).toHaveBeenCalledWith( 'test-missing.com' );

		consoleError.mockRestore();
	} );

	it( 'renders a single featured suggestion', async () => {
		mockGetSuggestionsQuery( {
			params: { query: 'single-featured.com' },
			suggestions: [ buildSuggestion( { domain_name: 'single-featured.com' } ) ],
		} );

		mockGetAvailabilityQuery( {
			params: { domainName: 'single-featured.com' },
			availability: buildAvailability( {
				domain_name: 'single-featured.com',
				status: DomainAvailabilityStatus.AVAILABLE,
			} ),
		} );

		render(
			<TestDomainSearchWithSuggestions query="single-featured.com">
				<FeaturedSearchResults
					suggestions={ [ { reason: 'recommended', suggestion: 'single-featured.com' } ] }
				/>
			</TestDomainSearchWithSuggestions>
		);

		const featuredSuggestion = await screen.findByTitle( 'single-featured.com' );

		expect( featuredSuggestion ).toBeInTheDocument();
		expect( featuredSuggestion ).toHaveClass( 'domain-suggestion-featured--single' );
	} );

	it( 'renders multiple featured suggestions', async () => {
		mockGetSuggestionsQuery( {
			params: { query: 'multiple-featured' },
			suggestions: [
				buildSuggestion( { domain_name: 'multiple-featured.com' } ),
				buildSuggestion( { domain_name: 'multiple-featured.net' } ),
			],
		} );

		render(
			<TestDomainSearchWithSuggestions query="multiple-featured">
				<FeaturedSearchResults
					suggestions={ [
						{ reason: 'recommended', suggestion: 'multiple-featured.com' },
						{ reason: 'best-alternative', suggestion: 'multiple-featured.net' },
					] }
				/>
			</TestDomainSearchWithSuggestions>
		);

		const dotCom = await screen.findByTitle( 'multiple-featured.com' );
		const dotNet = await screen.findByTitle( 'multiple-featured.net' );

		expect( dotCom ).toBeInTheDocument();
		expect( dotCom ).not.toHaveClass( 'domain-suggestion-featured--single' );

		expect( dotNet ).toBeInTheDocument();
		expect( dotNet ).not.toHaveClass( 'domain-suggestion-featured--single' );
	} );
} );
