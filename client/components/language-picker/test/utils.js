import { getLanguageCodeLabels } from '../utils';

describe( 'language picker utils', () => {
	describe( 'getLanguageCodeLabels()', () => {
		test( 'should return empty object if no lang slug passed', () => {
			expect( getLanguageCodeLabels() ).toEqual( {} );
		} );
		test( 'should return lang code from xx', () => {
			expect( getLanguageCodeLabels( 'xx' ) ).toEqual( {
				langCode: 'xx',
			} );
		} );
		test( 'should return lang and lang sub code from xx-yy', () => {
			expect( getLanguageCodeLabels( 'xx-yy' ) ).toEqual( {
				langCode: 'xx',
				langSubcode: 'yy',
			} );
		} );
		test( 'should return lang code from xx_variant', () => {
			expect( getLanguageCodeLabels( 'xx_variant' ) ).toEqual( {
				langCode: 'xx',
			} );
		} );
		test( 'should return lang code from xx-yy_variant', () => {
			expect( getLanguageCodeLabels( 'xx-yy_variant' ) ).toEqual( {
				langCode: 'xx',
				langSubcode: 'yy',
			} );
		} );
	} );
} );
