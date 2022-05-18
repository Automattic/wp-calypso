import { isAmbiguousThemeFilterTerm } from 'calypso/state/themes/selectors';
import { state } from './fixtures/theme-filters';

describe( 'isAmbiguousThemeFilterTerm()', () => {
	test( 'should return false for an unambiguous term', () => {
		expect( isAmbiguousThemeFilterTerm( state, 'music' ) ).toBe( false );
	} );

	test( 'should return true for an ambiguous term', () => {
		expect( isAmbiguousThemeFilterTerm( state, 'video' ) ).toBe( true );
	} );
} );
