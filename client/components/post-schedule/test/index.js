/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isValidGMTOffset,
	getLocalizedDate,
	convertHoursToHHMM,
	convertMinutesToHHMM,
	parseAndValidateNumber,
} from '../utils';

describe( 'gmtOffset', () => {
	it( 'Should return true for a valid gtm offset', () => {
		expect( isValidGMTOffset( 2 ) ).to.be.true;
	} );

	it( 'Should return true for a valid gtm offset', () => {
		expect( isValidGMTOffset( '2' ) ).to.be.false;
	} );
} );

describe( 'getLocalizedDate', () => {
	it( 'Should return a date localized at Amsterdam (utc: 60 minutes)', () => {
		const nowInAmsterdam = getLocalizedDate( new Date(), 'Europe/Amsterdam' );
		expect( nowInAmsterdam.utcOffset() ).to.equal( 60 );
	} );

	it( 'Should return a date localized at New York (utc: -300 minutes)', () => {
		const nowInNewYork = getLocalizedDate( new Date(), 'America/New_York' );
		expect( nowInNewYork.utcOffset() ).to.equal( -300 );
	} );

	it( 'Should return a date localized at UTC+3:30 (utc: 210 minutes)', () => {
		const NowAtUTC3_30 = getLocalizedDate( new Date(), false, 210 );
		expect( NowAtUTC3_30.utcOffset() ).to.equal( 210 );
	} );
} );

describe( 'convertHoursToHHMM', () => {
	it( 'Should convert 3.1 hours to `3:06`', () => {
		expect( convertHoursToHHMM( 3.1 ) ).to.equal( '+3:06' );
	} );

	it( 'Should convert 3 hours to `3`', () => {
		expect( convertHoursToHHMM( 3 ) ).to.equal( '+3' );
	} );

	it( 'Should convert -3.1 hours to `-3:06`', () => {
		expect( convertHoursToHHMM( -3.1 ) ).to.equal( '-3:06' );
	} );

	it( 'Should convert -3 hours to `3`', () => {
		expect( convertHoursToHHMM( -3 ) ).to.equal( '-3' );
	} );
} );

describe( 'convertMinutesToHHMM', () => {
	it( 'Should convert 186 minutes to `3:06`', () => {
		expect( convertMinutesToHHMM( 186 ) ).to.equal( '+3:06' );
	} );

	it( 'Should convert 180 minutes to `3`', () => {
		expect( convertMinutesToHHMM( 180 ) ).to.equal( '+3' );
	} );

	it( 'Should convert -186 minutes to `-3:06`', () => {
		expect( convertMinutesToHHMM( -186 ) ).to.equal( '-3:06' );
	} );

	it( 'Should convert -180 minutes to `-3`', () => {
		expect( convertMinutesToHHMM( -180 ) ).to.equal( '-3' );
	} );

	it( 'Should convert 0 minutes to `0`', () => {
		expect( convertMinutesToHHMM( 0 ) ).to.equal( '0' );
	} );

	it( 'Should convert -0 minutes to `0`', () => {
		expect( convertMinutesToHHMM( -0 ) ).to.equal( '0' );
	} );
} );

describe( 'parseAndValidateNumber', () => {
	it( 'Should return `false` when the value is a string', () => {
		expect( parseAndValidateNumber( 'ab' ) ).to.be.false;
	} );

	it( 'Should return `false` when the value is a negative number', () => {
		expect( parseAndValidateNumber( -10 ) ).to.be.false;
	} );

	it( 'Should return a 4 when the value is `04`', () => {
		expect( parseAndValidateNumber( '04' ) ).to.equal( 4 );
	} );

	it( 'Should return a 99 when the value is `99`', () => {
		expect( parseAndValidateNumber( '99' ) ).to.equal( 99 );
	} );
} );

