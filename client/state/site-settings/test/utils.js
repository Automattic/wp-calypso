/**
 * Internal dependencies
 */
import { normalizeSettings } from '../utils';

describe( 'utils', () => {
	describe( 'normalizeSettings()', () => {
		test( 'should not alter random setting', () => {
			const settings = {
				chicken_ribs: '10',
			};

			expect( normalizeSettings( settings ) ).toEqual( {
				chicken_ribs: '10',
			} );
		} );

		test( 'should cast the default category to int', () => {
			const settings = {
				default_category: '10',
			};

			expect( normalizeSettings( settings ) ).toEqual( {
				default_category: 10,
			} );
		} );

		test( 'should not touch sharing_show array', () => {
			const settings = {
				sharing_show: [ 'page', 'index', 'post' ],
			};
			expect( normalizeSettings( settings ).sharing_show ).toBe( settings.sharing_show );
		} );

		test( 'should convert sharing_show object to array', () => {
			const settings = {
				sharing_show: {
					0: 'page',
					1: 'index',
					3: 'post',
				},
			};
			expect( normalizeSettings( settings ) ).toEqual( {
				sharing_show: [ 'page', 'index', 'post' ],
			} );
		} );
	} );
} );
