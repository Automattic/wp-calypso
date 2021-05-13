/**
 * Internal dependencies
 */
import ThemeQueryManager from '../';

describe( 'ThemeQueryManager', () => {
	describe( '#sort()', () => {
		test( 'should leave key order unchanged', () => {
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
				'pachyderm',
			] );
			const keys = [ ...originalKeys ];

			ThemeQueryManager.sort( keys );
			expect( keys ).toEqual( originalKeys );
		} );
	} );
} );
