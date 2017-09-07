/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getThemeFilterTermsTable } from 'state/selectors';
import { state } from './fixtures/theme-filters';

describe( 'getThemeFilterTermsTable()', () => {
	it( 'should return a dictionary mapping terms to taxonomies', () => {
		const table = getThemeFilterTermsTable( state );
		expect( table ).to.deep.equal( {
			artwork: 'subject',
			blog: 'subject',
			business: 'subject',
			music: 'subject',
			'subject:video': 'subject',
			artistic: 'style',
			bright: 'style',
			clean: 'style',
			minimal: 'style',
			'feature:video': 'feature',
			wordads: 'feature'
		} );
	} );
} );
