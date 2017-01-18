/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import ThemeQueryManager from '../';

describe( 'ThemeQueryManager', ( ) => {
	describe( '#sort()', ( ) => {
		it( 'should leave key order unchanged', ( ) => {
			const originalKeys = Object.freeze( [
				'adaline',
				'fanwood-light',
				'ixion',
				'cols',
				'timepiece',
				'chalkboard',
				'handmade',
				'trvl',
				'dyad',
				'little-story',
				'pachyderm'
			] );
			const keys = [ ...originalKeys ];
			const manager = new ThemeQueryManager();

			manager.sort( keys );
			expect( keys ).to.deep.equal( originalKeys );
		} );
	} );
} );
