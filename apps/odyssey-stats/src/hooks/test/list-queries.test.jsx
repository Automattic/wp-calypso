/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import wpcom from 'calypso/lib/wp';
import useReferrersQuery from '../use-referrers-query';
import useTopPostsQuery from '../use-top-posts-query';

jest.mock( 'calypso/lib/wp', () => ( {
	req: { get: jest.fn( () => Promise.resolve( { summary: { postviews: [], groups: [] } } ) ) },
} ) );

const SITE_ID = 123;

const wrapper = ( { children } ) => {
	const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
};

/**
 * @param {Function} hook The query hook to render.
 */
async function requestFrom( hook ) {
	renderHook( () => hook( SITE_ID, '2025-11-01', '2026-10-05' ), { wrapper } );
	await waitFor( () => expect( wpcom.req.get ).toHaveBeenCalled() );
	return wpcom.req.get.mock.calls[ 0 ];
}

describe( 'the widget list queries', () => {
	beforeEach( () => {
		wpcom.req.get.mockClear();
	} );

	// A summarized request counts back in days whatever period it is handed, so asking for
	// `period=month&num=12` returned twelve days. Both lists state the window instead.
	it.each( [
		[ 'top posts', useTopPostsQuery, '/sites/123/stats/top-posts' ],
		[ 'referrers', useReferrersQuery, '/sites/123/stats/referrers' ],
	] )( 'asks %s for whole days between the range ends', async ( _, hook, path ) => {
		const [ requestedPath, params ] = await requestFrom( hook );

		expect( requestedPath ).toBe( path );
		expect( params ).toEqual(
			expect.objectContaining( {
				period: 'day',
				start_date: '2025-11-01',
				date: '2026-10-05',
				summarize: 1,
			} )
		);
		expect( params ).not.toHaveProperty( 'num' );
	} );
} );
