/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import getThemeFilterStringFromTerm from 'state/selectors/get-theme-filter-string-from-term';
import { state } from './fixtures/theme-filters';

describe( 'getThemeFilterStringFromTerm', () => {
	test( 'should return taxonomy:term filter given the term', () => {
		assert.equal( getThemeFilterStringFromTerm( state, 'artwork' ), 'subject:artwork' );
		assert.equal( getThemeFilterStringFromTerm( state, 'bright' ), 'style:bright' );
	} );

	test( 'should return empty string given an invalid term', () => {
		assert.equal( getThemeFilterStringFromTerm( state, '' ), '' );
		assert.equal( getThemeFilterStringFromTerm( state, ' ' ), '' );
		assert.equal( getThemeFilterStringFromTerm( state, ' artwork' ), '' );
		assert.equal( getThemeFilterStringFromTerm( state, 'artwork ' ), '' );
		assert.equal( getThemeFilterStringFromTerm( state, 'aartwork' ), '' );
	} );
} );
