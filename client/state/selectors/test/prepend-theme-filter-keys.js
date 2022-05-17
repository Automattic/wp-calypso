import { prependThemeFilterKeys } from 'calypso/state/themes/selectors';
import { state } from './fixtures/theme-filters';

describe( 'getThemeFilterStringFromTerm', () => {
	test( 'should handle invalid input', () => {
		expect( prependThemeFilterKeys( state, '' ) ).toEqual( '' );
		expect( prependThemeFilterKeys( state, '     ' ) ).toEqual( '' );
		expect( prependThemeFilterKeys( state, ' tsr tsr .' ) ).toEqual( '' );
	} );

	test( 'should prepend keys for valid terms and leave a trailing space', () => {
		const result = prependThemeFilterKeys( state, 'business subject:video blog clean' );
		expect( result ).toEqual( 'subject:business subject:video subject:blog style:clean ' );
	} );
} );
