import getTourSteps from '../tour-steps';

jest.mock( '@automattic/i18n-utils', () => ( {
	localizeUrl: jest.fn(),
} ) );

describe( 'Welcome Tour', () => {
	describe( 'Tour Steps', () => {
		it( 'should retrieve the "Find your way" slide when on English Locale', () => {
			expect( getTourSteps( 'en', true ) ).toEqual(
				expect.arrayContaining( [
					expect.objectContaining( {
						meta: expect.objectContaining( { heading: 'Find your way' } ),
					} ),
				] )
			);
		} );

		it( 'should not retrieve the "Find your way" slide when on non-English Locale', () => {
			expect( getTourSteps( 'nl', true ) ).not.toEqual(
				expect.arrayContaining( [
					expect.objectContaining( {
						meta: expect.objectContaining( { heading: 'Find your way' } ),
					} ),
				] )
			);
		} );
	} );
} );
