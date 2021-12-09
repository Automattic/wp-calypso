/**
 * @jest-environment jsdom
 */

import { translate } from 'i18n-calypso';
import moment from 'moment';
import { getHumanDateString } from '..';

describe( 'humanDate', () => {
	it( 'should work without a provided format', () => {
		const now = new Date();
		expect( getHumanDateString( now, now, null, moment, translate ) ).not.toBeFalsy();
	} );

	it( 'should work without a provided locale', () => {
		const now = new Date();
		expect( getHumanDateString( now, now, 'll', moment, translate ) ).not.toBeFalsy();
	} );

	it( 'should return relative strings for recent dates', () => {
		const now = new Date();
		const aSecondAndHalfAgo = new Date( Date.now() - 1500 );
		expect( getHumanDateString( now, aSecondAndHalfAgo, 'll', moment, translate ) ).toBe(
			'just now'
		);
		expect( getHumanDateString( now, aSecondAndHalfAgo, 'l', moment, translate ) ).toBe(
			'just now'
		);

		const aMinuteAndHalfAgo = new Date( Date.now() - 90 * 1000 );
		expect( getHumanDateString( now, aMinuteAndHalfAgo, 'll', moment, translate ) ).toBe(
			'2m ago'
		);
		expect( getHumanDateString( now, aMinuteAndHalfAgo, 'l', moment, translate ) ).toBe( '2m ago' );

		const anHourAndHalfAgo = new Date( Date.now() - 90 * 60 * 1000 );
		expect( getHumanDateString( now, anHourAndHalfAgo, 'll', moment, translate ) ).toBe( '1h ago' );
		expect( getHumanDateString( now, anHourAndHalfAgo, 'l', moment, translate ) ).toBe( '1h ago' );

		const aDayAndHalfAgo = new Date( Date.now() - 36 * 60 * 60 * 1000 );
		expect( getHumanDateString( now, aDayAndHalfAgo, 'll', moment, translate ) ).toBe( '1d ago' );
		expect( getHumanDateString( now, aDayAndHalfAgo, 'l', moment, translate ) ).toBe( '1d ago' );
	} );

	it( 'should return a formatted date for dates older than a week', () => {
		const now = new Date();
		const overThirtyDaysAgo = new Date( '2000-01-01' );
		expect( getHumanDateString( now, overThirtyDaysAgo, 'll', moment, translate ) ).toBe(
			'Jan 1, 2000'
		);
		expect( getHumanDateString( now, overThirtyDaysAgo, 'l', moment, translate ) ).toBe(
			'1/1/2000'
		);
	} );
} );
