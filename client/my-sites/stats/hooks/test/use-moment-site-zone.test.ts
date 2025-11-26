/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import i18n from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getMomentSiteZone, useMomentInSite } from '../use-moment-site-zone';

// Mock dependencies
jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
} ) );

jest.mock( 'calypso/state/selectors/get-site-gmt-offset' );
jest.mock( 'calypso/state/selectors/get-site-timezone-value' );
jest.mock( 'calypso/state/sites/selectors' );
jest.mock( 'calypso/state/ui/selectors' );
jest.mock( 'i18n-calypso', () => {
	const translate = jest.fn( ( text ) => text );
	const getLocaleSlug = jest.fn( () => 'en' );
	const localize = jest.fn( ( component ) => component );

	return {
		__esModule: true,
		default: {
			getLocaleSlug,
			translate,
			localize,
		},
		getLocaleSlug,
		localize,
		translate,
	};
} );

describe( 'getMomentSiteZone', () => {
	const mockState = {};
	const siteId = 123;

	beforeEach( () => {
		jest.clearAllMocks();
		( i18n.getLocaleSlug as jest.Mock ).mockReturnValue( 'en' );
	} );

	describe( 'with IANA timezone string', () => {
		it( 'should create moment with timezone when valid timezone string exists', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( 'America/New_York' );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( null );

			const momentFn = getMomentSiteZone( mockState, siteId );
			const result = momentFn( '2024-01-15' );

			expect( result.tz() ).toBe( 'America/New_York' );
			expect( result.locale() ).toBe( 'en' );
		} );

		it( 'should handle DST correctly', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( 'America/New_York' );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( null );

			const momentFn = getMomentSiteZone( mockState, siteId );
			const winter = momentFn( '2024-01-15' ); // EST = UTC-5
			const summer = momentFn( '2024-07-15' ); // EDT = UTC-4

			expect( winter.utcOffset() ).toBe( -300 );
			expect( summer.utcOffset() ).toBe( -240 );
		} );

		it( 'should not use invalid timezone string', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( 'Invalid/Timezone' );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( 5 );

			const momentFn = getMomentSiteZone( mockState, siteId );
			const result = momentFn( '2024-03-15' );

			// Should fall back to gmtOffset since timezone string is invalid
			expect( result.utcOffset() ).toBe( 300 );
		} );
	} );

	describe( 'with GMT offset', () => {
		it( 'should use GMT offset when timezone string is not available', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( null );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( -5 );

			const momentFn = getMomentSiteZone( mockState, siteId );
			const result = momentFn( '2024-02-20' );

			expect( result.utcOffset() ).toBe( -300 );
		} );

		it( 'should handle naive string date input with GMT offset', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( null );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( 3.5 );

			const momentFn = getMomentSiteZone( mockState, siteId );
			const result = momentFn( '2024-07-01' );

			expect( result.utcOffset() ).toBe( 210 );
			expect( result.format( 'YYYY-MM-DD' ) ).toBe( '2024-07-01' );
		} );

		it( 'should handle Date object by converting to site timezone', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( null );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( 2 );

			const momentFn = getMomentSiteZone( mockState, siteId );
			const dateObj = new Date( '2024-09-15T10:30:00Z' );
			const result = momentFn( dateObj );

			expect( result.utcOffset() ).toBe( 120 );
			expect( result.format( 'YYYY-MM-DD HH:mm' ) ).toBe( '2024-09-15 12:30' );
		} );

		it( 'should handle ISO string with timezone by converting to site timezone', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( null );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( 2 );

			const momentFn = getMomentSiteZone( mockState, siteId );
			const isoString = '2024-09-15T10:30:00-05:00';
			const result = momentFn( isoString );

			expect( result.utcOffset() ).toBe( 120 );
			expect( result.format( 'YYYY-MM-DD HH:mm' ) ).toBe( '2024-09-15 17:30' );
		} );

		it( 'should correctly compare dates with isSameOrAfter', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( null );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( -8 );

			const momentFn = getMomentSiteZone( mockState, siteId );
			const today = momentFn( '2024-11-27' );
			const yesterday = momentFn( '2024-11-26' );

			expect( today.isSameOrAfter( yesterday, 'day' ) ).toBe( true );
			expect( yesterday.isSameOrAfter( today, 'day' ) ).toBe( false );
		} );

		it( 'should handle midnight edge case correctly', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( null );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( -8 );

			const momentFn = getMomentSiteZone( mockState, siteId );
			const lastMinute = momentFn( '2024-11-27 23:59:59' );
			const nextDay = momentFn( '2024-11-28 00:00:00' );

			expect( lastMinute.isSame( nextDay, 'day' ) ).toBe( false );
			expect( lastMinute.isBefore( nextDay ) ).toBe( true );
		} );

		it( 'should produce consistent results between current time and string parsing', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( null );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( -5 );

			const momentFn = getMomentSiteZone( mockState, siteId );
			const now = momentFn();
			const parsed = momentFn( now.format( 'YYYY-MM-DD HH:mm:ss' ) );

			expect( now.utcOffset() ).toBe( parsed.utcOffset() );
			expect( parsed.isSame( now, 'second' ) ).toBe( true );
		} );
	} );

	describe( 'browser fallback', () => {
		it( 'should fall back to browser timezone when no timezone info available', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( null );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( null );

			const momentFn = getMomentSiteZone( mockState, siteId );
			const result = momentFn( '2024-05-12' );

			expect( result.locale() ).toBe( 'en' );
			expect( result.isValid() ).toBe( true );
		} );
	} );

	describe( 'memoization', () => {
		it( 'should return the same function when dependencies do not change', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( 'America/New_York' );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( null );
			( i18n.getLocaleSlug as jest.Mock ).mockReturnValue( 'en' );

			const firstFn = getMomentSiteZone( mockState, siteId );
			const secondFn = getMomentSiteZone( mockState, siteId );

			expect( firstFn ).toBe( secondFn );
		} );
	} );
} );

describe( 'useMomentInSite', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		( useSelector as jest.Mock ).mockImplementation( ( selector ) => selector( {}, null ) );
	} );

	it( 'should use provided siteId when given', () => {
		const siteId = 456;
		( getSiteTimezoneValue as jest.Mock ).mockReturnValue( 'America/Chicago' );
		( getSiteOption as jest.Mock ).mockReturnValue( null );
		( getSiteGmtOffset as jest.Mock ).mockReturnValue( null );

		const { result } = renderHook( () => useMomentInSite( siteId ) );

		const momentFn = result.current;
		const moment = momentFn( '2024-01-01' );

		expect( moment.tz() ).toBe( 'America/Chicago' );
	} );

	it( 'should use selected site ID when no siteId provided', () => {
		const selectedSiteId = 789;
		( getSelectedSiteId as jest.Mock ).mockReturnValue( selectedSiteId );
		( useSelector as jest.Mock ).mockImplementation( ( selector ) => {
			if ( selector === getSelectedSiteId ) {
				return selectedSiteId;
			}
			return selector( {}, selectedSiteId );
		} );
		( getSiteTimezoneValue as jest.Mock ).mockReturnValue( 'Europe/Paris' );
		( getSiteOption as jest.Mock ).mockReturnValue( null );
		( getSiteGmtOffset as jest.Mock ).mockReturnValue( null );

		const { result } = renderHook( () => useMomentInSite() );

		const momentFn = result.current;
		const moment = momentFn( '2024-06-15' );

		expect( moment.tz() ).toBe( 'Europe/Paris' );
	} );
} );
