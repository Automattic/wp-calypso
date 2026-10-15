import MockDate from 'mockdate';
import { getExpiredCopy, getExpiringSoonCopy } from '../purchase-expiry-copy';

// The copy counts whole calendar days in the viewer's time zone, so these
// assertions only hold against a fixed clock.
const NOW = '2026-02-24T18:00:00Z';

const daysFromNow = ( days: number ) => {
	const date = new Date( NOW );
	date.setUTCDate( date.getUTCDate() + days );
	return date;
};

describe( 'getExpiringSoonCopy', () => {
	beforeEach( () => MockDate.set( NOW ) );
	afterEach( () => MockDate.reset() );

	test( 'says nothing about a date beyond the warning window', () => {
		expect( getExpiringSoonCopy( daysFromNow( 61 ) ) ).toBeNull();
	} );

	test( 'warns from the edge of the window', () => {
		expect( getExpiringSoonCopy( daysFromNow( 60 ) ) ).toEqual( {
			intent: 'warning',
			text: 'Expires in 60 days',
		} );
	} );

	test( 'counts the days exactly rather than rounding to months', () => {
		expect( getExpiringSoonCopy( daysFromNow( 45 ) )?.text ).toBe( 'Expires in 45 days' );
	} );

	test( 'escalates to an error in the last week', () => {
		expect( getExpiringSoonCopy( daysFromNow( 8 ) )?.intent ).toBe( 'warning' );
		expect( getExpiringSoonCopy( daysFromNow( 7 ) )?.intent ).toBe( 'error' );
	} );

	test( 'uses the singular for one day', () => {
		expect( getExpiringSoonCopy( daysFromNow( 1 ) )?.text ).toBe( 'Expires in 1 day' );
	} );

	test( 'reads as today on the day itself', () => {
		expect( getExpiringSoonCopy( daysFromNow( 0 ) ) ).toEqual( {
			intent: 'error',
			text: 'Expires today',
		} );
	} );

	test( 'never points backwards, even if the date has passed', () => {
		expect( getExpiringSoonCopy( daysFromNow( -3 ) )?.text ).toBe( 'Expires today' );
	} );
} );

describe( 'getExpiredCopy', () => {
	beforeEach( () => MockDate.set( NOW ) );
	afterEach( () => MockDate.reset() );

	test( 'counts the days since expiration', () => {
		expect( getExpiredCopy( daysFromNow( -3 ) ) ).toEqual( {
			intent: 'error',
			text: 'Expired 3 days ago',
		} );
	} );

	test( 'uses the singular for one day', () => {
		expect( getExpiredCopy( daysFromNow( -1 ) ).text ).toBe( 'Expired 1 day ago' );
	} );

	test( 'reads as today on the day itself', () => {
		expect( getExpiredCopy( daysFromNow( 0 ) ).text ).toBe( 'Expired today' );
	} );

	test( 'never points forwards, even if the date has not arrived', () => {
		expect( getExpiredCopy( daysFromNow( 3 ) ).text ).toBe( 'Expired today' );
	} );

	test( 'still counts the days at the edge of the window', () => {
		expect( getExpiredCopy( daysFromNow( -60 ) ).text ).toBe( 'Expired 60 days ago' );
	} );

	test( 'stops counting days once an exact count reads badly', () => {
		// Which larger unit it rounds to is `getRelativeDayString`'s business, so
		// this only asserts that the day count is gone.
		expect( getExpiredCopy( daysFromNow( -61 ) ).text ).not.toMatch( /\d+ days? ago/ );
		expect( getExpiredCopy( daysFromNow( -400 ) ).text ).toBe( 'Expired 1 year ago' );
	} );
} );
