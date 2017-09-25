/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import { getThemeFilterStringFromTerm } from '../';
import { state } from './fixtures/theme-filters';

describe( 'getThemeFilterStringFromTerm', () => {
	it( 'should return taxonomy:term filter given the term', () => {
		assert.equal( getThemeFilterStringFromTerm( state, 'artwork' ), 'subject:artwork' );
		assert.equal( getThemeFilterStringFromTerm( state, 'bright' ), 'style:bright' );
	} );

	it( 'should return empty string given an invalid term', () => {
		assert.equal( getThemeFilterStringFromTerm( state, '' ), '' );
		assert.equal( getThemeFilterStringFromTerm( state, ' ' ), '' );
		assert.equal( getThemeFilterStringFromTerm( state, ' artwork' ), '' );
		assert.equal( getThemeFilterStringFromTerm( state, 'artwork ' ), '' );
		assert.equal( getThemeFilterStringFromTerm( state, 'aartwork' ), '' );
	} );
} );
