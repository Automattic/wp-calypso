/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getTerritoryFromCountry, getTerritoryById } from '../utils';

describe( 'language picker utils', () => {
	describe( 'getTerritoryFromCountry()', () => {
		const territoriesMock = [
			{
				id: 'happy',
				countries: [ 'OOH', 'AAH', 'EEE' ],
			},
		];
		test( 'should return expected territory slug', () => {
			expect( getTerritoryFromCountry( 'OOH', territoriesMock ) ).to.be( 'happy' );
		} );
		test( 'should return detault territory slug', () => {
			expect( getTerritoryFromCountry( 'OOPS', territoriesMock, 'NOOO' ) ).to.be( 'NOOO' );
		} );
	} );
	describe( 'getTerritoryById()', () => {} );
} );
