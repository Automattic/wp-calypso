/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { state } from './fixtures/theme-filters';
import getThemeFilterTermsTable from 'state/selectors/get-theme-filter-terms-table';

describe( 'getThemeFilterTermsTable()', () => {
	test( 'should return a dictionary mapping terms to taxonomies', () => {
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
			wordads: 'feature',
		} );
	} );
} );
