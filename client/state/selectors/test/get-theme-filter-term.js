/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getThemeFilterTerm } from '../';
import { state } from './fixtures/theme-filters';

describe( 'getThemeFilterTerm()', () => {
	it( 'should return undefined for an inexistent filter slug', () => {
		const term = getThemeFilterTerm( state, 'object', 'blog' );
		expect( term ).to.be.undefined;
	} );

	it( 'should return undefined for an inexistent term slug', () => {
		const term = getThemeFilterTerm( state, 'subject', 'blahg' );
		expect( term ).to.be.undefined;
	} );

	it( 'should return the filter term object for a given filter and term slug', () => {
		const term = getThemeFilterTerm( state, 'subject', 'blog' );
		expect( term ).to.deep.equal( {
			name: 'Blog',
			description: 'Whether you\'re authoring a personal blog, professional blog, or a business blog — ...'
		} );
	} );
} );
