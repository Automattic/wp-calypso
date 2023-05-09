import { getThemeFilterTerm } from 'calypso/state/themes/selectors';
import { state } from './fixtures/theme-filters';

describe( 'getThemeFilterTerm()', () => {
	test( 'should return undefined for an inexistent filter slug', () => {
		const term = getThemeFilterTerm( state, 'object', 'blog' );
		expect( term ).toBeUndefined();
	} );

	test( 'should return undefined for an inexistent term slug', () => {
		const term = getThemeFilterTerm( state, 'subject', 'blahg' );
		expect( term ).toBeUndefined();
	} );

	test( 'should return the filter term object for a given filter and term slug', () => {
		const term = getThemeFilterTerm( state, 'subject', 'blog' );
		expect( term ).toEqual( {
			name: 'Blog',
			description:
				"Whether you're authoring a personal blog, professional blog, or a business blog — ...",
		} );
	} );
} );
