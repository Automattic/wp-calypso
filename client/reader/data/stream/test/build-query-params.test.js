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
	streamKey: 'saved',
	feedId: null,
	isPoll: false,
	gap: null,
	localeSlug: 'en',
	page: undefined,
	perPage: undefined,
};

describe( 'buildStreamQueryParams — saved stream', () => {
	it( 'leaves the order to the API, newest save first', () => {
		const params = buildStreamQueryParams( { ...baseArgs, pageHandle: null } );

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
