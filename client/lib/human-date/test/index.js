/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import humanDate from '..';
import moment from 'moment';

describe( 'humanDate', () => {
	it( 'should work without a provided format or locale', () => {
		const now = new Date();
		expect( humanDate( now ) ).not.toBeFalsy();
	} );

	it( 'should work without a provided locale', () => {
		const now = new Date();
		expect( humanDate( now, 'll' ) ).not.toBeFalsy();
	} );

	it( 'should return relative strings for recent dates', () => {
		const aSecondAndHalfAgo = new Date( Date.now() - 1500 );
		expect( humanDate( aSecondAndHalfAgo, 'll', 'en' ) ).toBe( 'just now' );
		expect( humanDate( aSecondAndHalfAgo, 'l', 'en' ) ).toBe( 'just now' );

		const aMinuteAndHalfAgo = new Date( Date.now() - 90 * 1000 );
		expect( humanDate( aMinuteAndHalfAgo, 'll', 'en' ) ).toBe( '2m ago' );
		expect( humanDate( aMinuteAndHalfAgo, 'l', 'en' ) ).toBe( '2m ago' );

		const anHourAndHalfAgo = new Date( Date.now() - 90 * 60 * 1000 );
		expect( humanDate( anHourAndHalfAgo, 'll', 'en' ) ).toBe( '1h ago' );
		expect( humanDate( anHourAndHalfAgo, 'l', 'en' ) ).toBe( '1h ago' );

		const aDayAndHalfAgo = new Date( Date.now() - 36 * 60 * 60 * 1000 );
		expect( humanDate( aDayAndHalfAgo, 'll', 'en' ) ).toBe( '1d ago' );
		expect( humanDate( aDayAndHalfAgo, 'l', 'en' ) ).toBe( '1d ago' );
	} );

	it( 'should return a formatted date for dates older than a week', () => {
		const overThirtyDaysAgo = moment.utc( new Date( '2000-01-01' ) );
		expect( humanDate( overThirtyDaysAgo, 'll', 'en' ) ).toBe( 'Jan 1, 2000' );
		expect( humanDate( overThirtyDaysAgo, 'l', 'en' ) ).toBe( '1/1/2000' );
	} );
} );
