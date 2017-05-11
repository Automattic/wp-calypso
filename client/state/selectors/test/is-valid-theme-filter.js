/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import { state } from './fixtures/theme-filters';
import { isValidThemeFilter } from '../';

describe( 'isValidThemeFilter', () => {
	it( 'should return true for a valid filter string', () => {
		assert.isTrue( isValidThemeFilter( state, 'subject:music' ) );
	} );

	it( 'should return false for an invalid filter string', () => {
		assert.isFalse( isValidThemeFilter( state, 'subject' ) );
		assert.isFalse( isValidThemeFilter( state, 'music' ) );
		assert.isFalse( isValidThemeFilter( state, '' ) );
		assert.isFalse( isValidThemeFilter( state, 'subject:' ) );
		assert.isFalse( isValidThemeFilter( state, ':music' ) );
		assert.isFalse( isValidThemeFilter( state, ':' ) );
	} );
} );
