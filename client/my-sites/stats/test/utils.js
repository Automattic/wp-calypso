import { buildSummaryUrl, getPathWithUpdatedQueryString, normalizeChartDateParam } from '../utils';

describe( 'getPathWithUpdatedQueryString', () => {
	it( 'should return the path with the updated query string', () => {
		expect( getPathWithUpdatedQueryString( { h: 'i' }, '/a/b/c?d=e&f=g' ) ).toEqual(
			'/a/b/c?d=e&f=g&h=i'
		);
		expect( getPathWithUpdatedQueryString( { f: 'i' }, '/a/b/c?d=e&f=g' ) ).toEqual(
			'/a/b/c?d=e&f=i'
		);
		expect( getPathWithUpdatedQueryString( { f: 'i' }, '/a/b/c' ) ).toEqual( '/a/b/c?f=i' );
		expect( getPathWithUpdatedQueryString( {}, '/a/b/c' ) ).toEqual( '/a/b/c' );
		expect( getPathWithUpdatedQueryString( {}, '/a/b/c?d=e' ) ).toEqual( '/a/b/c?d=e' );
	} );
	it( 'should walk around the page.js bug', () => {
		expect( getPathWithUpdatedQueryString( { h: 'i' }, '/a/b/c?d=e&f=g?page=stats' ) ).toEqual(
			'/a/b/c?d=e&f=g&h=i'
		);
		expect(
			getPathWithUpdatedQueryString( { h: 'i' }, '/a/b/c?d=e&f=g?page=stats?page=stats?page=stats' )
		).toEqual( '/a/b/c?d=e&f=g&h=i' );
		expect(
			getPathWithUpdatedQueryString( { h: 'i' }, '/a/b/c?page=stats?page=stats?page=stats' )
		).toEqual( '/a/b/c?page=stats&h=i' );
		expect(
			getPathWithUpdatedQueryString( { h: 'i' }, '/a/b/c?h=k?page=stats?page=stats?page=stats' )
		).toEqual( '/a/b/c?h=i' );
	} );
} );

describe( 'normalizeChartDateParam', () => {
	it( 'zero-pads an unpadded month and/or day', () => {
		expect( normalizeChartDateParam( '2026-7-28' ) ).toEqual( '2026-07-28' );
		expect( normalizeChartDateParam( '2026-7-8' ) ).toEqual( '2026-07-08' );
		expect( normalizeChartDateParam( '2026-12-8' ) ).toEqual( '2026-12-08' );
	} );

	it( 'leaves an already-padded date unchanged', () => {
		expect( normalizeChartDateParam( '2026-07-28' ) ).toEqual( '2026-07-28' );
	} );

	it( 'leaves non-date-only strings, non-strings, and empty values unchanged', () => {
		expect( normalizeChartDateParam( '2026-07-28T10:00:00Z' ) ).toEqual( '2026-07-28T10:00:00Z' );
		expect( normalizeChartDateParam( 'not-a-date' ) ).toEqual( 'not-a-date' );
		expect( normalizeChartDateParam( undefined ) ).toBeUndefined();
		expect( normalizeChartDateParam( null ) ).toBeNull();
	} );
} );

describe( 'buildSummaryUrl', () => {
	const period = { period: 'day', endOf: { format: () => '2025-07-09' } };

	it( 'returns undefined when required params are missing', () => {
		expect( buildSummaryUrl( {} ) ).toBeUndefined();
		expect( buildSummaryUrl( { module: 'referrers', siteSlug: 'example.com' } ) ).toBeUndefined();
		expect( buildSummaryUrl( { period, siteSlug: 'example.com' } ) ).toBeUndefined();
		expect( buildSummaryUrl( { period, module: 'referrers' } ) ).toBeUndefined();
	} );

	it( 'forwards a custom range as chartStart/chartEnd', () => {
		expect(
			buildSummaryUrl( {
				period,
				module: 'referrers',
				siteSlug: 'example.com',
				query: { start_date: '2024-07-10', date: '2025-07-09' },
			} )
		).toEqual( '/stats/day/referrers/example.com?chartStart=2024-07-10&chartEnd=2025-07-09' );
	} );

	it( 'appends the shortcut when provided alongside a range', () => {
		expect(
			buildSummaryUrl( {
				period,
				module: 'referrers',
				siteSlug: 'example.com',
				query: { start_date: '2024-07-10', date: '2025-07-09' },
				shortcut: 'last_12_months',
			} )
		).toEqual(
			'/stats/day/referrers/example.com?chartStart=2024-07-10&chartEnd=2025-07-09&shortcut=last_12_months'
		);
	} );

	it( 'falls back to the legacy single-date contract without a custom range', () => {
		expect(
			buildSummaryUrl( { period, module: 'referrers', siteSlug: 'example.com', query: {} } )
		).toEqual( '/stats/day/referrers/example.com?startDate=2025-07-09' );
	} );

	it( 'ignores the shortcut when there is no custom range', () => {
		expect(
			buildSummaryUrl( {
				period,
				module: 'referrers',
				siteSlug: 'example.com',
				query: {},
				shortcut: 'last_12_months',
			} )
		).toEqual( '/stats/day/referrers/example.com?startDate=2025-07-09' );
	} );
} );
