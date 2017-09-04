/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { earliestMoment } from '../utils';

describe( 'utils', () => {
	describe( 'earliestMoment()', () => {
		it( 'should return undefined if no moment is provided', () => {
			expect( earliestMoment() ).to.be.undefined;
		} );

		it( 'should return the moment if only one is provided', () => {
			const m = moment();
			expect( earliestMoment( m ) ).to.equal( m );
		} );

		it( 'should return the earliest moment if two are provided', () => {
			const first = moment( '2012-01-01' );
			const second = moment( '2013-01-01' );
			expect( earliestMoment( second, first ) ).to.equal( first );
		} );

		it( 'should return the earliest moment of many moments', () => {
			const first = moment( '2012-01-01' );
			const second = moment( '2013-01-01' );
			const third = moment( '2014-01-01' );
			const fourth = moment( '2015-01-01' );
			const fifth = moment( '2016-01-01' );
			expect( earliestMoment( fourth, second, first, third, fifth ) ).to.equal( first );
		} );

		it( 'should return the first if equal moments are provided', () => {
			const first = moment();
			const identical = moment().clone();
			expect( earliestMoment( first, identical ) ).to.equal( first );
		} );
	} );
} );
