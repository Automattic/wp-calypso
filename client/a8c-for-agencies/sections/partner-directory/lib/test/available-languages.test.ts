import { availableLanguages, findIsoCodeByLanguage } from '../available-languages';

describe( 'availableLanguages', () => {
	it( 'exposes only the WPCOM-safe language compatibility set', () => {
		expect( Object.keys( availableLanguages ) ).toEqual( [
			'en',
			'es',
			'fr',
			'de',
			'pt',
			'it',
			'nl',
			'ja',
			'zh',
			'ko',
			'ar',
			'hi',
		] );
	} );

	it( 'finds language codes from the filtered language labels', () => {
		expect( findIsoCodeByLanguage( 'English' ) ).toBe( 'en' );
		expect( findIsoCodeByLanguage( 'Hindi' ) ).toBe( 'hi' );
		expect( findIsoCodeByLanguage( 'Polish' ) ).toBeNull();
	} );
} );
