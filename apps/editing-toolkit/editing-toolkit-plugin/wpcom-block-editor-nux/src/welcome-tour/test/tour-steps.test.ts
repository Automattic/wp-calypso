import { hasTranslation } from '@wordpress/i18n';
import getTourSteps from '../tour-steps';

jest.mock( '@automattic/i18n-utils', () => ( {
	localizeUrl: jest.fn(),
} ) );

jest.mock( '@wordpress/i18n', () => {
	const originalModule = jest.requireActual( '@wordpress/i18n' );
	return {
		__esModule: true,
		...originalModule,
		hasTranslation: jest.fn(),
	};
} );

const MOCK_DEFAULT_LOCALE_SLUG = 'en';
const MOCK_REFERENCE_POSITIONING = true;

describe( 'Welcome Tour', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Tour Steps', () => {
		it( 'should retrieve the "Find your way" slide when on English Locale and translations are available', () => {
			hasTranslation.mockImplementation( () => true );

			expect( getTourSteps( MOCK_DEFAULT_LOCALE_SLUG, MOCK_REFERENCE_POSITIONING ) ).toEqual(
				expect.arrayContaining( [
					expect.objectContaining( {
						meta: expect.objectContaining( { heading: 'Find your way' } ),
					} ),
				] )
			);
		} );

		it( 'should not retrieve the "Find your way" slide when on non-English Locale but translations are available', () => {
			hasTranslation.mockImplementation( () => true );

			expect( getTourSteps( 'nl', MOCK_REFERENCE_POSITIONING ) ).not.toEqual(
				expect.arrayContaining( [
					expect.objectContaining( {
						meta: expect.objectContaining( { heading: 'Find your way' } ),
					} ),
				] )
			);
		} );

		it( 'should not retrieve the "Find your way" slide when on English Locale but translations ar not available', () => {
			hasTranslation.mockImplementation( () => false );

			expect( getTourSteps( MOCK_DEFAULT_LOCALE_SLUG, MOCK_REFERENCE_POSITIONING ) ).not.toEqual(
				expect.arrayContaining( [
					expect.objectContaining( {
						meta: expect.objectContaining( { heading: 'Find your way' } ),
					} ),
				] )
			);
		} );
	} );
} );
