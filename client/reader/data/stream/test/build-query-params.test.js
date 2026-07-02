/**
 * @jest-environment node
 */
import { buildStreamQueryParams } from '../build-query-params';

const baseArgs = {
	streamKey: 'space:6',
	feedId: null,
	isPoll: false,
	gap: null,
	localeSlug: 'en',
	page: undefined,
	perPage: undefined,
};

describe( 'buildStreamQueryParams — space stream', () => {
	it( 'sends `count` (not `number`) and omits `page_handle` on the first page', () => {
		const params = buildStreamQueryParams( { ...baseArgs, pageHandle: null } );

		// Pinned SPACE_PER_PAGE (10) on the first page, locale as `_locale`, no cursor yet.
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
		// A gap fetch would ask for PER_GAP (40) posts on other streams; the space
		// ignores that and pins SPACE_PER_PAGE (10), which is already under the
		// 15-post server cap (the endpoint rejects a larger Elasticsearch query size).
		const params = buildStreamQueryParams( {
			...baseArgs,
			pageHandle: { page_handle: 'X' },
			gap: true,
		} );

		expect( params.count ).toBe( 10 );
	} );
} );

describe( 'buildStreamQueryParams — space_discover stream', () => {
	const discoverArgs = { ...baseArgs, streamKey: 'space_discover:6' };

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
