import { getForcedPriceAlignment } from '../featured';

describe( 'Featured#getForcedPriceAlignment', () => {
	it( 'should return right alignment for large single featured suggestion', () => {
		const result = getForcedPriceAlignment( {
			activeQuery: 'large',
			isSingleFeaturedSuggestion: true,
			matchReasons: undefined,
		} );

		expect( result ).toBe( 'right' );
	} );

	it( 'should return left alignment when no match reasons provided', () => {
		const result = getForcedPriceAlignment( {
			activeQuery: 'small',
			isSingleFeaturedSuggestion: false,
			matchReasons: undefined,
		} );

		expect( result ).toBe( 'left' );
	} );

	it( 'should return undefined when match reasons are provided', () => {
		const result = getForcedPriceAlignment( {
			activeQuery: 'small',
			isSingleFeaturedSuggestion: false,
			matchReasons: [ 'some-reason' ],
		} );

		expect( result ).toBeUndefined();
	} );

	it( 'should return left alignment for large non-single featured suggestion without match reasons', () => {
		const result = getForcedPriceAlignment( {
			activeQuery: 'large',
			isSingleFeaturedSuggestion: false,
			matchReasons: undefined,
		} );

		expect( result ).toBe( 'left' );
	} );
} );
