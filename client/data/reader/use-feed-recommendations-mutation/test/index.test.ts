/**
 * @jest-environment jsdom
 */
import { readListItemsAllQuery, readSubscribedListsQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import nock from 'nock';
import { createElement, type ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { createStore } from 'redux';
import { useFeedRecommendationsMutation } from '..';

const mockList = {
	ID: 456,
	owner: 'testuser',
	slug: 'recommended-blogs',
	title: 'Recommended Blogs',
	description: '',
	is_owner: true,
	is_public: false,
};

function createStoreWithUser( username: string | null ) {
	const state = { currentUser: { user: username ? { username } : null } };
	return createStore( ( s = state ) => s );
}

function createWrapper( {
	subscribedLists = [ mockList ],
	items = [],
	username = 'testuser',
}: {
	subscribedLists?: ( typeof mockList )[];
	items?: { feed_ID: number }[];
	username?: string | null;
} = {} ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );
	queryClient.setQueryData( readSubscribedListsQuery().queryKey, {
		lists: subscribedLists,
	} );
	if ( username ) {
		queryClient.setQueryData( readListItemsAllQuery( username, 'recommended-blogs' ).queryKey, {
			list_ID: mockList.ID,
			success: true,
			items,
			page: 1,
			number: 2000,
			total_items: items.length,
		} );
	}
	const store = createStoreWithUser( username );

	return {
		queryClient,
		Wrapper: ( { children }: { children: ReactNode } ) =>
			createElement( ReduxProvider, {
				store,
				children: createElement( QueryClientProvider, { client: queryClient }, children ),
			} ),
	};
}

describe( 'useFeedRecommendationsMutation', () => {
	const feedId = 123;

	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'returns isRecommended=false when feed is not in the list', () => {
		const { Wrapper } = createWrapper();
		const { result } = renderHook( () => useFeedRecommendationsMutation( feedId ), {
			wrapper: Wrapper,
		} );
		expect( result.current.isRecommended ).toBe( false );
		expect( result.current.canToggle ).toBe( true );
	} );

	it( 'returns isRecommended=true when the feed is in the recommended-blogs list', () => {
		const { Wrapper } = createWrapper( { items: [ { feed_ID: feedId } ] } );
		const { result } = renderHook( () => useFeedRecommendationsMutation( feedId ), {
			wrapper: Wrapper,
		} );
		expect( result.current.isRecommended ).toBe( true );
	} );

	it( 'cannot toggle when there is no current user', () => {
		const { Wrapper } = createWrapper( { username: null } );
		const { result } = renderHook( () => useFeedRecommendationsMutation( feedId ), {
			wrapper: Wrapper,
		} );
		expect( result.current.canToggle ).toBe( false );
	} );

	it( 'cannot toggle when there is no recommended-blogs list', () => {
		const { Wrapper } = createWrapper( { subscribedLists: [] } );
		const { result } = renderHook( () => useFeedRecommendationsMutation( feedId ), {
			wrapper: Wrapper,
		} );
		expect( result.current.canToggle ).toBe( false );
	} );

	it( 'POSTs to the feeds/new endpoint when toggling on', async () => {
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.2/read/lists/testuser/recommended-blogs/feeds/new' )
			.reply( 200, { feed_id: feedId } );

		const { Wrapper } = createWrapper();
		const { result } = renderHook( () => useFeedRecommendationsMutation( feedId ), {
			wrapper: Wrapper,
		} );

		act( () => {
			result.current.toggleRecommended();
		} );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	} );

	it( 'POSTs to the feeds/{feedId}/delete endpoint when toggling off', async () => {
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( `/rest/v1.2/read/lists/testuser/recommended-blogs/feeds/${ feedId }/delete` )
			.reply( 200, {} );

		const { Wrapper } = createWrapper( { items: [ { feed_ID: feedId } ] } );
		const { result } = renderHook( () => useFeedRecommendationsMutation( feedId ), {
			wrapper: Wrapper,
		} );

		act( () => {
			result.current.toggleRecommended();
		} );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	} );
} );
