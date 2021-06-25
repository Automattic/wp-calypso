/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getThemeFilters } from 'calypso/state/themes/selectors';
import { state } from './fixtures/theme-filters';

describe( 'getThemeFilterTerms()', () => {
	test( 'should return all available filters', () => {
		const filters = getThemeFilters( state );
		expect( filters ).to.deep.equal( state.themes.themeFilters );
	} );
} );
