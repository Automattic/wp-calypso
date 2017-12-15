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
	const territoriesMock = [
		{
			id: 'happy',
			countries: [ 'OOH', 'AAH', 'EEE' ],
		},
	];
	describe( 'getTerritoryFromCountry()', () => {
		test( 'should return expected territory slug', () => {
			expect( getTerritoryFromCountry( 'OOH', territoriesMock ) ).to.equal( 'happy' );
		} );
		test( 'should return detault territory slug', () => {
			expect( getTerritoryFromCountry( 'OOPS', territoriesMock, 'NOOO' ) ).to.equal( 'NOOO' );
		} );
	} );
	describe( 'getTerritoryById()', () => {
		test( 'should return expected territory', () => {
			expect( getTerritoryById( 'happy', territoriesMock ) ).to.eql( territoriesMock[ 0 ] );
		} );
		test( 'should return detault territory slug', () => {
			expect( getTerritoryById( 'sad', territoriesMock ) ).to.be.undefined;
		} );
	} );
} );
