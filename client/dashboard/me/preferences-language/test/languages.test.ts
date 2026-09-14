/**
 * @jest-environment jsdom
 */
import { getLocaleVariantOrLanguage, shouldDisplayCommunityTranslator } from '../languages';

describe( 'languages utilities', () => {
	describe( 'getLocaleVariantOrLanguage', () => {
		it( 'should return parent language when locale is a variant (es-cl)', () => {
			// es-cl is a real locale variant in the languages package
			const result = getLocaleVariantOrLanguage( 'es-cl' );

			// Should return the parent Spanish language
			expect( result ).toBeDefined();
			expect( result?.langSlug ).toBe( 'es' );
		} );

		it( 'should return the language itself when not a variant', () => {
			const result = getLocaleVariantOrLanguage( 'en' );

			// English is not a variant, should return itself
			expect( result ).toBeDefined();
			expect( result?.langSlug ).toBe( 'en' );
		} );
	} );

	describe( 'shouldDisplayCommunityTranslator', () => {
		it( 'should return appropriate result for translatable locales using real data', () => {
			// Test with Spanish - commonly translatable
			const resultEs = shouldDisplayCommunityTranslator( 'es' );
			expect( resultEs ).toBe( true );

			const resultEn = shouldDisplayCommunityTranslator( 'en' );
			expect( resultEn ).toBe( false );

			// Test with Spanish Chile variant
			const resultEsCl = shouldDisplayCommunityTranslator( 'es-cl' );
			expect( resultEsCl ).toBe( true );
		} );

		it( 'should return false when locale is empty', () => {
			const result = shouldDisplayCommunityTranslator( '' );
			expect( result ).toBe( false );
		} );

		it( 'should return false when language is undefined', () => {
			const result = shouldDisplayCommunityTranslator( undefined );
			expect( result ).toBe( false );
		} );

		it( 'should return true for an unknown locale (canBeTranslated defaults to true)', () => {
			const result = shouldDisplayCommunityTranslator( 'xyz-unknown' );
			expect( result ).toBe( true );
		} );
	} );
} );
