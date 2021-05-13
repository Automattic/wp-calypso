/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getThemeFilterTerms } from 'calypso/state/themes/selectors';
import { state } from './fixtures/theme-filters';

describe( 'getThemeFilterTerms()', () => {
	test( 'should return undefined for an inexistent filter slug', () => {
		const terms = getThemeFilterTerms( state, 'object' );
		expect( terms ).to.be.undefined;
	} );

	test( 'should return the filter terms for a given filter slug', () => {
		const terms = getThemeFilterTerms( state, 'subject' );
		expect( terms ).to.deep.equal( state.themes.themeFilters.subject );
	} );
} );
