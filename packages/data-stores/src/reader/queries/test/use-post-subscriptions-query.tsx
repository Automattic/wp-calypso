/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { callApi, getSubkey } from '../../helpers';
import buildQueryKey from '../../helpers/query-key';
import usePostSubscriptionsQuery, {
	postSubscriptionsQueryKeyPrefix,
} from '../use-post-subscriptions-query';
import type { PropsWithChildren } from 'react';

jest.mock( '../../helpers', () => ( {
	...jest.requireActual( '../../helpers' ),
	callApi: jest.fn(),
	getSubkey: jest.fn(),
} ) );

test( 'defers cached pagination until a subscriber key is available', async () => {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	} );
	const first = {
		id: '1',
		post_title: 'First post',
		post_url: 'https://example.com/first',
		date_subscribed: '2026-01-01T00:00:00Z',
	};
	queryClient.setQueryData( buildQueryKey( postSubscriptionsQueryKeyPrefix, false ), {
		pages: [ { comment_subscriptions: [ first ], total_comment_subscriptions_count: 2 } ],
		pageParams: [ 1 ],
	} );
	jest.mocked( getSubkey ).mockReturnValue( undefined );
	jest.mocked( callApi ).mockResolvedValue( {
		comment_subscriptions: [ { ...first, id: '2', post_title: 'Second post' } ],
		total_comment_subscriptions_count: 2,
	} );
	const wrapper = ( { children }: PropsWithChildren ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

	const { result, rerender, unmount } = renderHook(
		() => usePostSubscriptionsQuery( { number: 1 } ),
		{ wrapper }
	);
	await waitFor( () => expect( result.current.isFetching ).toBe( false ) );
	expect( callApi ).not.toHaveBeenCalled();
	expect( result.current.data.posts ).toHaveLength( 1 );

	jest.mocked( getSubkey ).mockReturnValue( 'subscriber-key' );
	rerender();
	await waitFor( () => expect( result.current.data.posts ).toHaveLength( 2 ) );
	expect( callApi ).toHaveBeenCalledTimes( 1 );
	expect( jest.mocked( callApi ).mock.calls[ 0 ][ 0 ].path ).toContain( 'page=2' );
	expect( result.current.hasNextPage ).toBe( false );
	unmount();
	queryClient.clear();
} );
