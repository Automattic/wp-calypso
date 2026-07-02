import {
	SPACE_LANGUAGE_OPTIONS,
	SPACE_LANGUAGE_SUGGESTIONS,
	getLanguageCodeByName,
	getLanguageName,
	isKnownLanguageCode,
	resolveLanguageTokens,
	toBaseLanguageCode,
} from '../languages';

describe( 'spaces languages helpers', () => {
	describe( 'toBaseLanguageCode', () => {
		it( 'strips the region and lowercases', () => {
			expect( toBaseLanguageCode( 'pt-br' ) ).toBe( 'pt' );
			expect( toBaseLanguageCode( 'en_US' ) ).toBe( 'en' );
			expect( toBaseLanguageCode( 'EN' ) ).toBe( 'en' );
		} );

		it( 'leaves a bare base code unchanged', () => {
			expect( toBaseLanguageCode( 'pt' ) ).toBe( 'pt' );
		} );
	} );

	describe( 'the base-language list', () => {
		it( 'collapses regional variants onto one base option with the base name', () => {
			const pt = SPACE_LANGUAGE_OPTIONS.filter( ( option ) => option.code === 'pt' );
			expect( pt ).toHaveLength( 1 );
			// The canonical base name ("Português"), not a variant ("Português do Brasil").
			expect( pt[ 0 ].name ).toBe( 'Português' );
		} );

		it( 'has no duplicate codes', () => {
			const codes = SPACE_LANGUAGE_OPTIONS.map( ( option ) => option.code );
			expect( new Set( codes ).size ).toBe( codes.length );
		} );

		it( 'is sorted by display name', () => {
			const names = SPACE_LANGUAGE_OPTIONS.map( ( option ) => option.name );
			expect( names ).toEqual( [ ...names ].sort( ( a, b ) => a.localeCompare( b ) ) );
		} );

		it( 'exposes the names as suggestions', () => {
			expect( SPACE_LANGUAGE_SUGGESTIONS ).toContain( 'English' );
			expect( SPACE_LANGUAGE_SUGGESTIONS ).toContain( 'Português' );
		} );
	} );

	describe( 'getLanguageName', () => {
		it( 'maps a known base code to its display name', () => {
			expect( getLanguageName( 'en' ) ).toBe( 'English' );
			expect( getLanguageName( 'pt' ) ).toBe( 'Português' );
		} );

		it( 'falls back to the code itself when unknown', () => {
			expect( getLanguageName( 'zz' ) ).toBe( 'zz' );
		} );
	} );

	describe( 'getLanguageCodeByName', () => {
		it( 'resolves a display name back to its base code, case-insensitively', () => {
			expect( getLanguageCodeByName( 'English' ) ).toBe( 'en' );
			expect( getLanguageCodeByName( 'english' ) ).toBe( 'en' );
			expect( getLanguageCodeByName( '  Português  ' ) ).toBe( 'pt' );
		} );

		it( 'returns undefined for an unknown name', () => {
			expect( getLanguageCodeByName( 'Klingon' ) ).toBeUndefined();
		} );
	} );

	describe( 'isKnownLanguageCode', () => {
		it( 'distinguishes known base codes from junk', () => {
			expect( isKnownLanguageCode( 'pt' ) ).toBe( true );
			expect( isKnownLanguageCode( 'zz' ) ).toBe( false );
		} );
	} );

	describe( 'resolveLanguageTokens', () => {
		it( 'maps display-name tokens back to base codes', () => {
			expect( resolveLanguageTokens( [ 'English', 'Português' ], [] ) ).toEqual( [ 'en', 'pt' ] );
		} );

		it( 'accepts the object token shape from FormTokenField', () => {
			expect( resolveLanguageTokens( [ { value: 'English' } ], [] ) ).toEqual( [ 'en' ] );
		} );

		it( 'de-dupes while preserving order', () => {
			expect( resolveLanguageTokens( [ 'English', 'Português', 'English' ], [] ) ).toEqual( [
				'en',
				'pt',
			] );
		} );

		it( 'preserves an existing unknown code rather than dropping it on edit', () => {
			// `zz` is not in the known list; its display falls back to the code itself,
			// so the token comes back as `zz` and must round-trip rather than vanish.
			expect( resolveLanguageTokens( [ 'zz', 'English' ], [ 'zz' ] ) ).toEqual( [ 'zz', 'en' ] );
		} );

		it( 'drops a token that is neither a known language nor an existing code', () => {
			expect( resolveLanguageTokens( [ 'Klingon' ], [] ) ).toEqual( [] );
		} );
	} );
} );
