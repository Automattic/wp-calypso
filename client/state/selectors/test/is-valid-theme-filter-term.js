import { isValidThemeFilterTerm } from 'calypso/state/themes/selectors';
import { state } from './fixtures/theme-filters';

describe( 'isValidThemeFilterTerm()', () => {
	test( 'should return true for a valid term string', () => {
		expect( isValidThemeFilterTerm( state, 'music' ) ).toBe( true );
		expect( isValidThemeFilterTerm( state, 'feature:video' ) ).toBe( true );
	} );

	test( 'should return false for an invalid filter string', () => {
		expect( isValidThemeFilterTerm( state, 'video' ) ).toBe( false );
		expect( isValidThemeFilterTerm( state, '' ) ).toBe( false );
		expect( isValidThemeFilterTerm( state, ':video' ) ).toBe( false );
		expect( isValidThemeFilterTerm( state, ':' ) ).toBe( false );
	} );
} );
