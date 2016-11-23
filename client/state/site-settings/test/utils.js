/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { normalizeSettings } from '../utils';

describe( 'utils', () => {
	describe( 'normalizeSettings()', () => {
		it( 'should not alter random setting', () => {
			const settings = {
				chicken_ribs: '10'
			};

			expect( normalizeSettings( settings ) ).to.eql( {
				chicken_ribs: '10'
			} );
		} );

		it( 'should cast the default category to int', () => {
			const settings = {
				default_category: '10'
			};

			expect( normalizeSettings( settings ) ).to.eql( {
				default_category: 10
			} );
		} );
	} );
} );
