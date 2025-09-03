/**
 * @jest-environment jsdom
 */

import languages from '@automattic/languages';
import {
	languagesAsOptions,
	getLocaleVariantOrLanguage,
	shouldDisplayCommunityTranslator,
} from '../languages';

describe( 'languages utilities', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'languagesAsOptions', () => {
		it( 'should transform languages into options format', () => {
			// Test with real languages data
			expect( languagesAsOptions ).toBeDefined();
			expect( Array.isArray( languagesAsOptions ) ).toBe( true );

			// Check that each option has the correct structure
			languagesAsOptions.forEach( ( option ) => {
				expect( option ).toHaveProperty( 'value' );
				expect( option ).toHaveProperty( 'label' );
				expect( typeof option.value ).toBe( 'string' );
				expect( typeof option.label ).toBe( 'string' );
			} );
		} );

		it( 'should include common languages', () => {
			const languageSlugs = languagesAsOptions.map( ( option ) => option.value );

			// Test that common languages are present
			expect( languageSlugs ).toContain( 'en' );
			expect( languageSlugs ).toContain( 'es' );
			expect( languageSlugs ).toContain( 'fr' );
			expect( languageSlugs ).toContain( 'de' );
		} );

		it( 'should match the original languages array length', () => {
			expect( languagesAsOptions ).toHaveLength( languages.length );
		} );
	} );

	describe( 'getLocaleVariantOrLanguage', () => {
		it( 'should return parent language when locale is a variant (es-cl)', () => {
			// es-cl is a real locale variant in the languages package
			const result = getLocaleVariantOrLanguage( { language: 'es-cl' } );

			// Should return the parent Spanish language
			expect( result ).toBeDefined();
			expect( result?.langSlug ).toBe( 'es' );
		} );

		it( 'should return the language itself when not a variant', () => {
			const result = getLocaleVariantOrLanguage( { language: 'en' } );

			// English is not a variant, should return itself
			expect( result ).toBeDefined();
			expect( result?.langSlug ).toBe( 'en' );
		} );
	} );

	describe( 'shouldDisplayCommunityTranslator', () => {
		it( 'should return appropriate result for translatable locales using real data', () => {
			// Test with Spanish - commonly translatable
			const resultEs = shouldDisplayCommunityTranslator( { language: 'es' } );
			expect( resultEs ).toBe( true );

			const resultEn = shouldDisplayCommunityTranslator( { language: 'en' } );
			expect( resultEn ).toBe( false );

			// Test with Spanish Chile variant
			const resultEsCl = shouldDisplayCommunityTranslator( { language: 'es-cl' } );
			expect( resultEsCl ).toBe( true );
		} );

		it( 'should return false when locale is empty', () => {
			const result = shouldDisplayCommunityTranslator( { language: '' } );
			expect( result ).toBe( false );
		} );

		it( 'should return false when language is undefined', () => {
			const userSettings = {} as UserSettingsPreferences;
			const result = shouldDisplayCommunityTranslator( userSettings );
			expect( result ).toBe( false );
		} );

		it( 'should handle unknown locale', () => {
			const result = shouldDisplayCommunityTranslator( { language: 'xyz-unknown' } );
			// The actual result depends on how canBeTranslated handles unknown locales
			expect( typeof result ).toBe( 'boolean' );
		} );
	} );
} );
