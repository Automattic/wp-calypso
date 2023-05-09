import { getThemeFilterTermFromString } from 'calypso/state/themes/selectors';
import { state } from './fixtures/theme-filters';

describe( 'getThemeFilterTermFromString()', () => {
	test( 'should drop taxonomy prefix from unambiguous filter term', () => {
		const term = getThemeFilterTermFromString( state, 'subject:business' );
		expect( term ).toEqual( 'business' );
	} );

	test( 'should retain taxonomy prefix for ambiguous filter term', () => {
		const term = getThemeFilterTermFromString( state, 'subject:video' );
		expect( term ).toEqual( 'subject:video' );
	} );
} );
