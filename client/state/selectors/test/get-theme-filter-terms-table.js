import { getThemeFilterTermsTable } from 'calypso/state/themes/selectors';
import { state } from './fixtures/theme-filters';

describe( 'getThemeFilterTermsTable()', () => {
	test( 'should return a dictionary mapping terms to taxonomies', () => {
		const table = getThemeFilterTermsTable( state );
		expect( table ).toEqual( {
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
