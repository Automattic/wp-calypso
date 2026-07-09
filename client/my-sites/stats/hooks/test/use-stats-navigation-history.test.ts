/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useSelector } from 'calypso/state';
import { getSiteSlug, getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import {
	useStatsNavigationHistory,
	useStatsBreadcrumbTrail,
	recordCurrentScreen,
} from '../use-stats-navigation-history';

jest.mock( 'calypso/state', () => ( { useSelector: jest.fn() } ) );
jest.mock( 'calypso/state/sites/selectors' );
jest.mock( 'calypso/state/ui/selectors' );
jest.mock( 'i18n-calypso', () => {
	const translate = ( text: string ) => text;
	const localize = ( component: unknown ) => component;
	const getLocaleSlug = () => 'en';

	return {
		__esModule: true,
		default: { translate, localize, getLocaleSlug },
		translate,
		localize,
		getLocaleSlug,
	};
} );

const STORAGE_KEY = 'jp-stats-navigation';

describe( 'use-stats-navigation-history back-link param forwarding', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		sessionStorage.clear();
		( getSelectedSiteId as jest.Mock ).mockReturnValue( 123 );
		( getSiteSlug as jest.Mock ).mockReturnValue( 'example.com' );
		( getSiteAdminUrl as jest.Mock ).mockReturnValue( 'https://example.com/wp-admin/' );
		( useSelector as jest.Mock ).mockImplementation( ( selector ) => selector( {} ) );
	} );

	const summaryEntry = {
		screen: 'referrers',
		queryParams: {
			chartStart: '2025-07-01',
			chartEnd: '2025-07-31',
			shortcut: 'last_12_months',
			tab: 'views',
		},
		period: 'month',
	};

	describe( 'useStatsNavigationHistory', () => {
		it( 'derives the Traffic back link from the current screen when there is no prior history', () => {
			sessionStorage.setItem( STORAGE_KEY, JSON.stringify( [ summaryEntry ] ) );

			const { result } = renderHook( () => useStatsNavigationHistory() );

			expect( result.current.text ).toBe( 'Traffic' );
			expect( result.current.url ).toContain( '/stats/month/example.com' );
			expect( result.current.url ).toContain( 'chartStart=2025-07-01' );
			expect( result.current.url ).toContain( 'chartEnd=2025-07-31' );
			expect( result.current.url ).toContain( 'shortcut=last_12_months' );
			expect( result.current.url ).toContain( 'tab=views' );
		} );

		it( 'overrides the recorded previous range with the current screen range', () => {
			const trafficEntry = {
				screen: 'traffic',
				queryParams: {
					chartStart: '2024-01-01',
					chartEnd: '2024-12-31',
					shortcut: 'last_3_years',
					tab: 'visitors',
				},
				period: 'year',
			};
			sessionStorage.setItem( STORAGE_KEY, JSON.stringify( [ trafficEntry, summaryEntry ] ) );

			const { result } = renderHook( () => useStatsNavigationHistory() );

			// The current (summary) range wins; other recorded params are kept.
			expect( result.current.url ).toContain( 'chartStart=2025-07-01' );
			expect( result.current.url ).toContain( 'chartEnd=2025-07-31' );
			expect( result.current.url ).toContain( 'shortcut=last_12_months' );
			expect( result.current.url ).toContain( 'tab=visitors' );
			// Period is recomputed for the overridden range (31 days -> week).
			expect( result.current.url ).toContain( '/stats/week/example.com' );
		} );

		it( 'drops the recorded stale shortcut when the current range is custom', () => {
			const trafficEntry = {
				screen: 'traffic',
				queryParams: { chartStart: '2024-01-01', chartEnd: '2024-12-31', shortcut: 'last_3_years' },
				period: 'year',
			};
			const customRangeEntry = {
				screen: 'referrers',
				queryParams: { chartStart: '2025-05-01', chartEnd: '2025-05-20' },
				period: 'day',
			};
			sessionStorage.setItem( STORAGE_KEY, JSON.stringify( [ trafficEntry, customRangeEntry ] ) );

			const { result } = renderHook( () => useStatsNavigationHistory() );

			expect( result.current.url ).toContain( '/stats/day/example.com' );
			expect( result.current.url ).toContain( 'chartStart=2025-05-01' );
			expect( result.current.url ).toContain( 'chartEnd=2025-05-20' );
			expect( result.current.url ).not.toContain( 'shortcut' );
		} );

		it( 'keeps the recorded range when the current screen has none (e.g. all-time)', () => {
			const trafficEntry = {
				screen: 'traffic',
				queryParams: { chartStart: '2024-01-01', chartEnd: '2024-12-31', shortcut: 'last_3_years' },
				period: 'year',
			};
			const allTimeEntry = {
				screen: 'referrers',
				queryParams: { startDate: '2025-07-08', summarize: '1', num: '-1' },
				period: 'day',
			};
			sessionStorage.setItem( STORAGE_KEY, JSON.stringify( [ trafficEntry, allTimeEntry ] ) );

			const { result } = renderHook( () => useStatsNavigationHistory() );

			expect( result.current.url ).toContain( '/stats/year/example.com' );
			expect( result.current.url ).toContain( 'chartStart=2024-01-01' );
			expect( result.current.url ).toContain( 'shortcut=last_3_years' );
		} );
	} );

	describe( 'useStatsBreadcrumbTrail', () => {
		it( 'synthesizes a Traffic breadcrumb carrying the range on direct load', () => {
			sessionStorage.setItem( STORAGE_KEY, JSON.stringify( [ summaryEntry ] ) );

			const { result } = renderHook( () => useStatsBreadcrumbTrail() );

			expect( result.current ).toHaveLength( 1 );
			expect( result.current[ 0 ].label ).toBe( 'Traffic' );
			expect( result.current[ 0 ].url ).toContain( '/stats/month/example.com' );
			expect( result.current[ 0 ].url ).toContain( 'chartStart=2025-07-01' );
			expect( result.current[ 0 ].url ).toContain( 'shortcut=last_12_months' );
			expect( result.current[ 0 ].url ).toContain( 'tab=views' );
		} );
	} );

	describe( 'recordCurrentScreen', () => {
		it( 'persists only supported query params, including tab', () => {
			recordCurrentScreen(
				'traffic',
				{
					queryParams: { chartStart: '2025-07-01', tab: 'views', irrelevant: 'x' },
					period: 'day',
				},
				true
			);

			const stored = JSON.parse( sessionStorage.getItem( STORAGE_KEY ) || '[]' );
			expect( stored[ 0 ].queryParams ).toEqual( { chartStart: '2025-07-01', tab: 'views' } );
		} );
	} );
} );
