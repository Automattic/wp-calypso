import { findThemeFilterTerm } from 'calypso/state/themes/selectors';
import { state } from './fixtures/theme-filters';

describe( 'findThemeFilterTerm()', () => {
	test( 'should return null for an inexistent term slug', () => {
		const term = findThemeFilterTerm( state, 'blahg' );
		expect( term ).toBeNull();
	} );

	test( 'should return the filter term object for a given term slug', () => {
		const term = findThemeFilterTerm( state, 'blog' );
		expect( term ).toEqual( {
			name: 'Blog',
			description:
				"Whether you're authoring a personal blog, professional blog, or a business blog — ...",
		} );
	} );

	test( 'should return the filter term object for a given tax:term slug', () => {
		const term = findThemeFilterTerm( state, 'style:bright' );
		expect( term ).toEqual( {
			name: 'Bright',
			description: '',
		} );
	} );
} );
