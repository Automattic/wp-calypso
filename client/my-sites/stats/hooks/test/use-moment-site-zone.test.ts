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

		it( 'should create current moment when no date input is provided', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( 'Europe/London' );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( null );

			const momentFn = getMomentSiteZone( mockState, siteId );
			const result = momentFn();

			expect( result.tz() ).toBe( 'Europe/London' );
			expect( result.locale() ).toBe( 'en' );
		} );

		it( 'should respect locale when creating moment with timezone', () => {
			( i18n.getLocaleSlug as jest.Mock ).mockReturnValue( 'es' );
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( 'America/Los_Angeles' );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( null );

			const momentFn = getMomentSiteZone( mockState, siteId );
			const result = momentFn( '2024-06-20' );

			expect( result.locale() ).toBe( 'es' );
		} );

		it( 'should fall back to getSiteOption for timezone_string when getSiteTimezoneValue returns null', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( null );
			( getSiteOption as jest.Mock ).mockImplementation( ( state, id, option ) => {
				if ( option === 'timezone_string' ) {
					return 'Asia/Tokyo';
				}
				return null;
			} );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( null );

			const momentFn = getMomentSiteZone( mockState, siteId );
			const result = momentFn( '2024-08-10' );

			expect( result.tz() ).toBe( 'Asia/Tokyo' );
		} );

		it( 'should not use invalid timezone string', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( 'Invalid/Timezone' );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( 5 );

			const momentFn = getMomentSiteZone( mockState, siteId );
			const result = momentFn( '2024-03-15' );

			// Should fall back to gmtOffset since timezone string is invalid
			expect( result.utcOffset() ).toBe( 300 ); // 5 hours in minutes
		} );

		it( 'should not use empty timezone string', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( '' );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( -8 );

			const momentFn = getMomentSiteZone( mockState, siteId );
			const result = momentFn( '2024-03-15' );

			// Should fall back to gmtOffset
			expect( result.utcOffset() ).toBe( -480 ); // -8 hours in minutes
		} );
	} );

	describe( 'with DST timezones', () => {
		it( 'should handle America/New_York during standard time (winter)', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( 'America/New_York' );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( null );

			const momentFn = getMomentSiteZone( mockState, siteId );
			// January 15, 2024 is during standard time (EST = UTC-5)
			const result = momentFn( '2024-01-15' );

			expect( result.tz() ).toBe( 'America/New_York' );
			expect( result.utcOffset() ).toBe( -300 ); // -5 hours in minutes (EST)
		} );

		it( 'should handle America/New_York during daylight saving time (summer)', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( 'America/New_York' );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( null );

			const momentFn = getMomentSiteZone( mockState, siteId );
			// July 15, 2024 is during daylight saving time (EDT = UTC-4)
			const result = momentFn( '2024-07-15' );

			expect( result.tz() ).toBe( 'America/New_York' );
			expect( result.utcOffset() ).toBe( -240 ); // -4 hours in minutes (EDT)
		} );

		it( 'should handle Europe/London during standard time (winter)', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( 'Europe/London' );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( null );

			const momentFn = getMomentSiteZone( mockState, siteId );
			// January 15, 2024 is during standard time (GMT = UTC+0)
			const result = momentFn( '2024-01-15' );

			expect( result.tz() ).toBe( 'Europe/London' );
			// Check that offset is numerically zero (handles -0 vs 0)
			expect( result.utcOffset() === 0 ).toBe( true ); // GMT
		} );

		it( 'should handle Europe/London during daylight saving time (summer)', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( 'Europe/London' );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( null );

			const momentFn = getMomentSiteZone( mockState, siteId );
			// July 15, 2024 is during daylight saving time (BST = UTC+1)
			const result = momentFn( '2024-07-15' );

			expect( result.tz() ).toBe( 'Europe/London' );
			expect( result.utcOffset() ).toBe( 60 ); // +1 hour in minutes (BST)
		} );

		it( 'should handle Australia/Sydney during standard time (winter)', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( 'Australia/Sydney' );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( null );

			const momentFn = getMomentSiteZone( mockState, siteId );
			// July 15, 2024 is during standard time in Australia (AEST = UTC+10)
			const result = momentFn( '2024-07-15' );

			expect( result.tz() ).toBe( 'Australia/Sydney' );
			expect( result.utcOffset() ).toBe( 600 ); // +10 hours in minutes (AEST)
		} );

		it( 'should handle Australia/Sydney during daylight saving time (summer)', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( 'Australia/Sydney' );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( null );

			const momentFn = getMomentSiteZone( mockState, siteId );
			// January 15, 2024 is during daylight saving time in Australia (AEDT = UTC+11)
			const result = momentFn( '2024-01-15' );

			expect( result.tz() ).toBe( 'Australia/Sydney' );
			expect( result.utcOffset() ).toBe( 660 ); // +11 hours in minutes (AEDT)
		} );

		it( 'should correctly handle DST transition day - spring forward', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( 'America/New_York' );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( null );

			const momentFn = getMomentSiteZone( mockState, siteId );
			// March 10, 2024 is when DST starts in US (spring forward)
			const result = momentFn( '2024-03-10T12:00:00' );

			expect( result.tz() ).toBe( 'America/New_York' );
			// At noon on the transition day, should be in EDT
			expect( result.utcOffset() ).toBe( -240 ); // -4 hours in minutes (EDT)
		} );

		it( 'should correctly handle DST transition day - fall back', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( 'America/New_York' );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( null );

			const momentFn = getMomentSiteZone( mockState, siteId );
			// November 3, 2024 is when DST ends in US (fall back)
			const result = momentFn( '2024-11-03T12:00:00' );

			expect( result.tz() ).toBe( 'America/New_York' );
			// At noon on the transition day, should be in EST
			expect( result.utcOffset() ).toBe( -300 ); // -5 hours in minutes (EST)
		} );
	} );

	describe( 'with GMT offset', () => {
		it( 'should use GMT offset when timezone string is not available', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( null );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( -5 );

			const momentFn = getMomentSiteZone( mockState, siteId );
			const result = momentFn( '2024-02-20' );

			expect( result.utcOffset() ).toBe( -300 ); // -5 hours in minutes
		} );

		it( 'should handle string date input with GMT offset', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( null );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( 3.5 );

			const momentFn = getMomentSiteZone( mockState, siteId );
			const result = momentFn( '2024-07-01' );

			expect( result.utcOffset() ).toBe( 210 ); // 3.5 hours in minutes
			expect( result.format( 'YYYY-MM-DD' ) ).toBe( '2024-07-01' );
		} );

		it( 'should handle non-string date input with GMT offset', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( null );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( 2 );

			const momentFn = getMomentSiteZone( mockState, siteId );
			const dateObj = new Date( '2024-09-15T10:30:00Z' );
			const result = momentFn( dateObj );

			expect( result.utcOffset() ).toBe( 120 ); // 2 hours in minutes
		} );

		it( 'should create current moment with GMT offset when no date input', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( null );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( 1 );

			const momentFn = getMomentSiteZone( mockState, siteId );
			const result = momentFn();

			expect( result.utcOffset() ).toBe( 60 ); // 1 hour in minutes
		} );

		it( 'should fall back to getSiteOption for gmt_offset when getSiteGmtOffset returns null', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( null );
			( getSiteOption as jest.Mock ).mockImplementation( ( state, id, option ) => {
				if ( option === 'gmt_offset' ) {
					return 8;
				}
				return null;
			} );

			const momentFn = getMomentSiteZone( mockState, siteId );
			const result = momentFn( '2024-11-05' );

			expect( result.utcOffset() ).toBe( 480 ); // 8 hours in minutes
		} );

		it( 'should handle zero GMT offset', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( null );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( 0 );

			const momentFn = getMomentSiteZone( mockState, siteId );
			const result = momentFn( '2024-12-01' );

			// Check that offset is numerically zero (handles -0 vs 0)
			expect( result.utcOffset() === 0 ).toBe( true );
		} );

		it( 'should handle negative GMT offset', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( null );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( -7 );

			const momentFn = getMomentSiteZone( mockState, siteId );
			const result = momentFn( '2024-04-10' );

			expect( result.utcOffset() ).toBe( -420 ); // -7 hours in minutes
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
			// Should use browser's local timezone
			expect( result.isValid() ).toBe( true );
		} );

		it( 'should handle undefined date input with browser fallback', () => {
			( getSiteTimezoneValue as jest.Mock ).mockReturnValue( null );
			( getSiteOption as jest.Mock ).mockReturnValue( null );
			( getSiteGmtOffset as jest.Mock ).mockReturnValue( null );

			const momentFn = getMomentSiteZone( mockState, siteId );
			const result = momentFn();

			expect( result.isValid() ).toBe( true );
			expect( result.locale() ).toBe( 'en' );
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

	it( 'should handle null siteId', () => {
		( getSiteTimezoneValue as jest.Mock ).mockReturnValue( null );
		( getSiteOption as jest.Mock ).mockReturnValue( null );
		( getSiteGmtOffset as jest.Mock ).mockReturnValue( 5 );

		const { result } = renderHook( () => useMomentInSite( null ) );

		const momentFn = result.current;
		expect( momentFn ).toBeDefined();
	} );

	it( 'should return memoized function when dependencies do not change', () => {
		const siteId = 123;
		( getSiteTimezoneValue as jest.Mock ).mockReturnValue( 'America/New_York' );
		( getSiteOption as jest.Mock ).mockReturnValue( null );
		( getSiteGmtOffset as jest.Mock ).mockReturnValue( null );

		const { result, rerender } = renderHook( () => useMomentInSite( siteId ) );
		const firstResult = result.current;

		rerender();
		const secondResult = result.current;

		expect( secondResult ).toBe( firstResult );
	} );

	it( 'should return different function when siteId changes', () => {
		( getSiteTimezoneValue as jest.Mock ).mockReturnValue( 'America/New_York' );
		( getSiteOption as jest.Mock ).mockReturnValue( null );
		( getSiteGmtOffset as jest.Mock ).mockReturnValue( null );

		const { result, rerender } = renderHook( ( props ) => useMomentInSite( props ), {
			initialProps: 123,
		} );
		const firstResult = result.current;

		rerender( 456 );
		const secondResult = result.current;

		expect( secondResult ).not.toBe( firstResult );
	} );
} );
