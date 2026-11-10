/**
 * @jest-environment node
 */
import {
	SAVED_OLDEST_PUBLISHED_STREAM_KEY,
	SAVED_OLDEST_STREAM_KEY,
	SAVED_PUBLISHED_STREAM_KEY,
	buildStreamQueryParams,
} from '../build-query-params';

const baseArgs = {
	streamKey: 'shelf:6',
	feedId: null,
	isPoll: false,
	gap: null,
	localeSlug: 'en',
	page: undefined,
	perPage: undefined,
};

describe( 'buildStreamQueryParams — shelf stream', () => {
	it( 'sends `count` (not `number`) and omits `page_handle` on the first page', () => {
		const params = buildStreamQueryParams( { ...baseArgs, pageHandle: null } );

		// Pinned SHELF_PER_PAGE (10) on the first page, locale as `_locale`, no cursor yet.
		expect( params ).toEqual( { count: 10, _locale: 'en' } );
	} );

	it( 'threads the `page_handle` cursor through on subsequent pages', () => {
		const params = buildStreamQueryParams( {
			...baseArgs,
			pageHandle: { page_handle: 'NEXT' },
		} );

		// Same pinned page size (10) once paginating.
		expect( params ).toEqual( { count: 10, page_handle: 'NEXT', _locale: 'en' } );
	} );

	it( 'honors a caller-provided `perPage` for the page size', () => {
		const params = buildStreamQueryParams( { ...baseArgs, pageHandle: null, perPage: 9 } );

		expect( params ).toEqual( { count: 9, _locale: 'en' } );
	} );

	it( 'pins its own page size, ignoring the larger shared gap-fetch size', () => {
		// A gap fetch would ask for PER_GAP (40) posts on other streams; the shelf
		// ignores that and pins SHELF_PER_PAGE (10), which is already under the
		// 15-post server cap (the endpoint rejects a larger Elasticsearch query size).
		const params = buildStreamQueryParams( {
			...baseArgs,
			pageHandle: { page_handle: 'X' },
			gap: true,
		} );

		expect( params.count ).toBe( 10 );
	} );
} );

describe( 'buildStreamQueryParams — shelf_discover stream', () => {
	const discoverArgs = { ...baseArgs, streamKey: 'shelf_discover:6' };

	it( 'sends `count` and omits `page_handle` on the first page', () => {
		const params = buildStreamQueryParams( { ...discoverArgs, pageHandle: null } );

		// INITIAL_FETCH (4) on the first page, locale as `_locale`, no cursor yet.
		expect( params ).toEqual( { count: 4, _locale: 'en' } );
	} );

	it( 'threads the `page_handle` cursor through on subsequent pages', () => {
		const params = buildStreamQueryParams( {
			...discoverArgs,
			pageHandle: { page_handle: 'NEXT' },
		} );

		// PER_FETCH (7) once paginating.
		expect( params ).toEqual( { count: 7, page_handle: 'NEXT', _locale: 'en' } );
	} );

	it( 'clamps `count` to the tighter 7-post discover cap', () => {
		// Discover caps at 7 (not 15) — a tighter Elasticsearch query-size limit on
		// the recommendation query. A gap fetch (PER_GAP = 40) must clamp to 7.
		const params = buildStreamQueryParams( {
			...discoverArgs,
			pageHandle: { page_handle: 'X' },
			gap: true,
		} );

		expect( params.count ).toBe( 7 );
	} );
} );

describe( 'buildStreamQueryParams — saved stream', () => {
	it( 'leaves the order to the API, newest save first', () => {
		const params = buildStreamQueryParams( { ...baseArgs, streamKey: 'saved', pageHandle: null } );

		expect( params ).not.toHaveProperty( 'order' );
		expect( params.orderBy ).toBe( 'date' );
	} );

	it( 'asks for the oldest save first', () => {
		const params = buildStreamQueryParams( {
			...baseArgs,
			streamKey: SAVED_OLDEST_STREAM_KEY,
			pageHandle: { page_handle: 'NEXT' },
		} );

		expect( params ).toMatchObject( { order: 'ASC', page_handle: 'NEXT' } );
	} );

	it( 'asks for the most recently published post first', () => {
		const params = buildStreamQueryParams( {
			...baseArgs,
			streamKey: SAVED_PUBLISHED_STREAM_KEY,
			pageHandle: { page_handle: 'NEXT' },
		} );

		expect( params ).toMatchObject( { orderBy: 'date_published', page_handle: 'NEXT' } );
		expect( params ).not.toHaveProperty( 'order' );
	} );

	it( 'asks for the oldest published post first', () => {
		const params = buildStreamQueryParams( {
			...baseArgs,
			streamKey: SAVED_OLDEST_PUBLISHED_STREAM_KEY,
			pageHandle: { page_handle: 'NEXT' },
		} );

		expect( params ).toMatchObject( {
			orderBy: 'date_published',
			order: 'ASC',
			page_handle: 'NEXT',
		} );
	} );
} );
