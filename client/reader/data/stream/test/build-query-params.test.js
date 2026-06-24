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

		// INITIAL_FETCH (4) on the first page, locale as `_locale`, no cursor yet.
		expect( params ).toEqual( { count: 4, _locale: 'en' } );
	} );

	it( 'threads the `page_handle` cursor through on subsequent pages', () => {
		const params = buildStreamQueryParams( {
			...baseArgs,
			pageHandle: { page_handle: 'NEXT' },
		} );

		// PER_FETCH (7) once paginating.
		expect( params ).toEqual( { count: 7, page_handle: 'NEXT', _locale: 'en' } );
	} );

	it( 'clamps `count` to the 15-post server cap', () => {
		// A gap fetch asks for PER_GAP (40) posts, which must be clamped: the
		// endpoint rejects a larger Elasticsearch query size, and an oversized page
		// would silently break end-of-stream detection.
		const params = buildStreamQueryParams( {
			...baseArgs,
			pageHandle: { page_handle: 'X' },
			gap: true,
		} );

		expect( params.count ).toBe( 15 );
	} );
} );
