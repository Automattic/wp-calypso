/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { usePostCommentsData } from '../use-post-comments-data';

const BASE = 'https://public-api.wordpress.com';

const post = {
	ID: 456,
	site_ID: 123,
	discussion: {
		comment_count: 2,
		comments_open: true,
	},
};

const wrapper = ( { children } ) => {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const store = createStore(
		(
			state = {
				currentUser: {
					id: 1,
					capabilities: { 123: {} },
				},
			}
		) => state
	);

	return (
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>{ children }</Provider>
		</QueryClientProvider>
	);
};

describe( 'usePostCommentsData', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'returns composed post comments data for the comments component', async () => {
		nock( BASE )
			.get( '/rest/v1.1/sites/123/posts/456/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				comments: [
					{
						ID: 2,
						content: 'Second',
						date: '2026-05-02T00:00:00.000Z',
						parent: false,
						author: { ID: 10, name: 'Second Author' },
						status: 'approved',
					},
					{
						ID: 1,
						content: 'First',
						date: '2026-05-01T00:00:00.000Z',
						parent: false,
						author: { ID: 10, name: 'First Author' },
						status: 'approved',
					},
				],
				found: 2,
			} );

		const { result } = renderHook(
			() => usePostCommentsData( { post, commentCount: 2, commentsFilter: 'approved' } ),
			{ wrapper }
		);

		await waitFor( () => {
			expect( result.current.comments.map( ( comment ) => comment.ID ) ).toEqual( [ 1, 2 ] );
		} );

		expect( result.current.siteId ).toBe( 123 );
		expect( result.current.postId ).toBe( 456 );
		expect( result.current.commentsTree.children ).toEqual( [ 1, 2 ] );
		expect( result.current.commentsFetchingStatus ).toEqual(
			expect.objectContaining( {
				hasReceivedBefore: true,
			} )
		);
	} );
} );
