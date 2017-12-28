/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getThemeFilters } from 'client/state/selectors';
import { state } from './fixtures/theme-filters';

describe( 'getThemeFilterTerms()', () => {
	test( 'should return all available filters', () => {
		const filters = getThemeFilters( state );
		expect( filters ).to.deep.equal( state.themes.themeFilters );
	} );
} );
