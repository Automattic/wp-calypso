/** @format */

/**
 * External dependencies
 */
import {
	is12hr,
	isValidGMTOffset,
	getLocalizedDate,
	convertHoursToHHMM,
	convertMinutesToHHMM,
	parseAndValidateNumber,
} from '../utils';

describe( 'is12hr', () => {
	test( 'Should return true for a 12-hour time format', () => {
		expect( is12hr( 'F j, Y, g:i a' ) ).toBe( true );
		expect( is12hr( 'h:i' ) ).toBe( true );
	} );

	test( 'Should return false for a 24-hour time', () => {
		expect( is12hr( 'H:i:s' ) ).toBe( false );
		expect( is12hr( 'G:i' ) ).toBe( false );
	} );
} );

describe( 'gmtOffset', () => {
	test( 'Should return true for a valid gtm offset', () => {
		expect( isValidGMTOffset( 2 ) ).toBe( true );
	} );

	test( 'Should return false for an invalid gtm offset', () => {
		expect( isValidGMTOffset( '2' ) ).toBe( false );
	} );
} );

describe( 'getLocalizedDate', () => {
	// Use a fixed "now" to prevent issues with DST
	const now = new Date( 2017, 1, 1, 0, 0, 0 );

	test( 'Should return a date localized at Amsterdam (utc: 60 minutes)', () => {
		const nowInAmsterdam = getLocalizedDate( now, 'Europe/Amsterdam' );
		expect( nowInAmsterdam.utcOffset() ).toBe( 60 );
	} );

	test( 'Should return a date localized at New York (utc: -300 minutes)', () => {
		const nowInNewYork = getLocalizedDate( now, 'America/New_York' );
		expect( nowInNewYork.utcOffset() ).toBe( -300 );
	} );

	test( 'Should return a date localized at UTC+3:30 (utc: 210 minutes)', () => {
		const NowAtUTC3_30 = getLocalizedDate( now, false, 210 );
		expect( NowAtUTC3_30.utcOffset() ).toBe( 210 );
	} );
} );

describe( 'convertHoursToHHMM', () => {
	test( 'Should convert 3.1 hours to `3:06`', () => {
		expect( convertHoursToHHMM( 3.1 ) ).toBe( '+3:06' );
	} );

	test( 'Should convert 3 hours to `3`', () => {
		expect( convertHoursToHHMM( 3 ) ).toBe( '+3' );
	} );

	test( 'Should convert -3.1 hours to `-3:06`', () => {
		expect( convertHoursToHHMM( -3.1 ) ).toBe( '-3:06' );
	} );

	test( 'Should convert -3 hours to `3`', () => {
		expect( convertHoursToHHMM( -3 ) ).toBe( '-3' );
	} );
} );

describe( 'convertMinutesToHHMM', () => {
	test( 'Should convert 186 minutes to `3:06`', () => {
		expect( convertMinutesToHHMM( 186 ) ).toBe( '+3:06' );
	} );

	test( 'Should convert 180 minutes to `3`', () => {
		expect( convertMinutesToHHMM( 180 ) ).toBe( '+3' );
	} );

	test( 'Should convert -186 minutes to `-3:06`', () => {
		expect( convertMinutesToHHMM( -186 ) ).toBe( '-3:06' );
	} );

	test( 'Should convert -180 minutes to `-3`', () => {
		expect( convertMinutesToHHMM( -180 ) ).toBe( '-3' );
	} );

	test( 'Should convert 0 minutes to `0`', () => {
		expect( convertMinutesToHHMM( 0 ) ).toBe( '0' );
	} );

	test( 'Should convert -0 minutes to `0`', () => {
		expect( convertMinutesToHHMM( -0 ) ).toBe( '0' );
	} );
} );

describe( 'parseAndValidateNumber', () => {
	test( 'Should return `false` when the value is a string', () => {
		expect( parseAndValidateNumber( 'ab' ) ).toBe( false );
	} );

	test( 'Should return `false` when the value is a negative number', () => {
		expect( parseAndValidateNumber( -10 ) ).toBe( false );
	} );

	test( 'Should return a 4 when the value is `04`', () => {
		expect( parseAndValidateNumber( '04' ) ).toBe( 4 );
	} );

	test( 'Should return a 99 when the value is `99`', () => {
		expect( parseAndValidateNumber( '99' ) ).toBe( 99 );
	} );
} );
