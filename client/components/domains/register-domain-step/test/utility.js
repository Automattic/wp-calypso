/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { markFeaturedSuggestions } from '../utility';

describe( 'markFeaturedSuggestions', () => {
	describe( 'featuredSuggestionsAtTop = false', () => {
		test( 'when strippedDomainBase does not match any domain, it should assume the recomendation is the top result, also it should identify best alternative and move it to second position', () => {
			const input = [
				{ domain_name: 'test.com' },
				{ domain_name: 'test.press' },
				{ domain_name: 'test.live' },
			];

			const output = markFeaturedSuggestions( input, '', 'abc', false, [] );

			expect( output ).toEqual( [
				{ domain_name: 'test.com', isRecommended: true },
				{ domain_name: 'test.press', isBestAlternative: true },
				{ domain_name: 'test.live' },
			] );
		} );

		test(
			'when strippedDomainBase matches every domain, it should identify recommendation as the first domain and move it to top of the list,' +
				'and it should assume the best alternative',
			() => {
				const input = [
					{ domain_name: 'test.com' },
					{ domain_name: 'test.press' },
					{ domain_name: 'test.live' },
				];

				const output = markFeaturedSuggestions( input, '', 'test', false, [] );

				expect( output ).toEqual( [
					{ domain_name: 'test.com', isRecommended: true },
					{ domain_name: 'test.press', isBestAlternative: true },
					{ domain_name: 'test.live' },
				] );
			}
		);

		test(
			'when exactMatchDomain matches some domain, it should identify recommendation as that domain and move it to top of the list,' +
				'and it should assume the best alternative',
			() => {
				const input = [
					{ domain_name: 'test.com' },
					{ domain_name: 'test.press' },
					{ domain_name: 'test.live' },
				];

				const output = markFeaturedSuggestions( input, 'test.live', 'unrelated', false, [] );

				expect( output ).toEqual( [
					{ domain_name: 'test.live', isRecommended: true },
					{ domain_name: 'test.com', isBestAlternative: true },
					{ domain_name: 'test.press' },
				] );
			}
		);

		test( 'when exactMatchDomain matches some domain and strippedDomainBase matches other domain, it should identify recommendation as whichever one matches first (1)', () => {
			const input = [
				{ domain_name: 'test.com' },
				{ domain_name: 'test.press' },
				{ domain_name: 'test.live' },
				{ domain_name: 'domainbase.live' },
			];

			const output = markFeaturedSuggestions( input, 'test.live', 'domainbase', false, [] );

			expect( output ).toEqual( [
				{ domain_name: 'test.live', isRecommended: true },
				{ domain_name: 'test.com', isBestAlternative: true },
				{ domain_name: 'test.press' },
				{ domain_name: 'domainbase.live' },
			] );
		} );

		test( 'when exactMatchDomain matches some domain and strippedDomainBase matches other domain, it should identify recommendation as whichever one matches first (2)', () => {
			const input = [
				{ domain_name: 'test.com' },
				{ domain_name: 'test.press' },
				{ domain_name: 'domainbase.live' },
				{ domain_name: 'test.live' },
			];

			const output = markFeaturedSuggestions( input, 'test.live', 'domainbase', false, [] );

			expect( output ).toEqual( [
				{ domain_name: 'domainbase.live', isRecommended: true },
				{ domain_name: 'test.com', isBestAlternative: true },
				{ domain_name: 'test.press' },
				{ domain_name: 'test.live' },
			] );
		} );

		test( 'when strippedDomainBase matches some domains, it should identify recommendation as the first matching domain, and the best alternative as first non-matching domain', () => {
			const input = [
				{ domain_name: 'alternative.com' },
				{ domain_name: 'test.press' },
				{ domain_name: 'test.live' },
				{ domain_name: 'alternative2.com' },
			];

			const output = markFeaturedSuggestions( input, '', 'test', false, [] );

			expect( output ).toEqual( [
				{ domain_name: 'test.press', isRecommended: true },
				{ domain_name: 'alternative.com', isBestAlternative: true },
				{ domain_name: 'test.live' },
				{ domain_name: 'alternative2.com' },
			] );
		} );
	} );
	describe( 'featuredSuggestionsAtTop = true', () => {
		test( 'it should always mark first domain as recommendation and second as best alternative', () => {
			const input = [
				{ domain_name: 'unrelated.com' },
				{ domain_name: 'test.press' },
				{ domain_name: 'test.live' },
			];

			const output = markFeaturedSuggestions( input, '', 'test', true, [] );

			expect( output ).toEqual( [
				{ domain_name: 'unrelated.com', isRecommended: true },
				{ domain_name: 'test.press', isBestAlternative: true },
				{ domain_name: 'test.live' },
			] );
		} );
	} );
} );
