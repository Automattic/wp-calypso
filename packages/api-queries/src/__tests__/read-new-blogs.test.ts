import { readNewBlogsQuery } from '../read-new-blogs';
import type { ReadNewBlogs } from '@automattic/api-core';
import type { Query } from '@tanstack/react-query';

const withRecs: ReadNewBlogs = {
	updated: '2026-08-31T00:00:00Z',
	recs: [ { blogId: 1, postId: 10, score: 0.5 } ],
};
const empty: ReadNewBlogs = { updated: null, recs: [] };

const staleTimeFor = ( data: ReadNewBlogs | undefined ) => {
	const { staleTime } = readNewBlogsQuery();
	return typeof staleTime === 'function'
		? staleTime( { state: { data } } as unknown as Query< ReadNewBlogs, Error, ReadNewBlogs > )
		: staleTime;
};

const persists = ( data: ReadNewBlogs ) =>
	( readNewBlogsQuery().meta?.persist as ( data: unknown ) => boolean )( data );

describe( 'readNewBlogsQuery', () => {
	it( 'caches a non-empty result for 30 minutes', () => {
		expect( staleTimeFor( withRecs ) ).toBe( 30 * 60 * 1000 );
	} );

	it( 'caches an empty result for only 5 minutes', () => {
		expect( staleTimeFor( empty ) ).toBe( 5 * 60 * 1000 );
		expect( staleTimeFor( undefined ) ).toBe( 5 * 60 * 1000 );
	} );

	it( 'persists non-empty results but not empty ones', () => {
		expect( persists( withRecs ) ).toBe( true );
		expect( persists( empty ) ).toBe( false );
	} );
} );
