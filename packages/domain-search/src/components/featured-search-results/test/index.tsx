import { DomainAvailabilityStatus } from '@automattic/api-core';
import { render, screen } from '@testing-library/react';
import { FeaturedSearchResults } from '..';
import { buildAvailability } from '../../../test-helpers/factories/availability';
import { buildSuggestion } from '../../../test-helpers/factories/suggestions';
import { mockGetAvailabilityQuery } from '../../../test-helpers/queries/availability';
import { mockGetSuggestionsQuery } from '../../../test-helpers/queries/suggestions';
import { TestDomainSearchWithSuggestionsList } from '../../../test-helpers/renderer';

describe( 'FeaturedSearchResults', () => {
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
			<TestDomainSearchWithSuggestionsList query="single-featured.com">
				<FeaturedSearchResults
					suggestions={ [ { reason: 'recommended', suggestion: 'single-featured.com' } ] }
				/>
			</TestDomainSearchWithSuggestionsList>
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
			<TestDomainSearchWithSuggestionsList query="multiple-featured">
				<FeaturedSearchResults
					suggestions={ [
						{ reason: 'recommended', suggestion: 'multiple-featured.com' },
						{ reason: 'best-alternative', suggestion: 'multiple-featured.net' },
					] }
				/>
			</TestDomainSearchWithSuggestionsList>
		);

		const dotCom = await screen.findByTitle( 'multiple-featured.com' );
		const dotNet = await screen.findByTitle( 'multiple-featured.net' );

		expect( dotCom ).toBeInTheDocument();
		expect( dotCom ).not.toHaveClass( 'domain-suggestion-featured--single' );

		expect( dotNet ).toBeInTheDocument();
		expect( dotNet ).not.toHaveClass( 'domain-suggestion-featured--single' );
	} );
} );
