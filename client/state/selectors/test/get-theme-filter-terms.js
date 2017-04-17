/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getThemeFilterTerms } from '../';
import { state } from './fixtures/theme-filters';

describe( 'getThemeFilterTerms()', () => {
	it( 'should return undefined for an inexistent filter slug', () => {
		const terms = getThemeFilterTerms( state, 'object' );
		expect( terms ).to.be.undefined;
	} );

	it( 'should return the filter terms for a given filter slug', () => {
		const terms = getThemeFilterTerms( state, 'subject' );
		expect( terms ).to.deep.equal( {
			artwork: {
				name: 'Artwork',
				description: ''
			},
			blog: {
				name: 'Blog',
				description: 'Whether you\'re authoring a personal blog, professional blog, or a business blog — ...'
			},
			business: {
				name: 'Business',
				description: 'WordPress business themes offer you a professional design for your company or organization. ...'
			},
		} );
	} );
} );
