/**
 * @jest-environment jsdom
 */
import { readSpaceQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { useInfiniteStream } from 'calypso/reader/data/stream';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SpaceFeed, collectPosts } from '../index';
import type {
	ReadSpaceDetails,
	ReadStreamPost,
	ReadStreamResponse,
	SpaceFeedLayout,
} from '@automattic/api-core';

jest.mock( 'calypso/reader/data/stream', () => ( {
	useInfiniteStream: jest.fn(),
} ) );

jest.mock( 'calypso/state/reader/site-blocks/selectors', () => {
	const blockedSites: number[] = [];
	const getBlockedSites = jest.fn( () => blockedSites );
	return { getBlockedSites };
} );

const mockUseInfiniteStream = useInfiniteStream as jest.Mock;

function streamResult( overrides: Partial< ReturnType< typeof useInfiniteStream > > = {} ) {
	return {
		items: [],
		pages: [],
		isLoading: false,
		isFetching: false,
		isFetchingNextPage: false,
		isRefetching: false,
		hasNextPage: false,
		lastPage: true,
		error: null,
		fetchNextPage: jest.fn(),
		refetch: jest.fn(),
		invalidate: jest.fn(),
		...overrides,
	};
}

function makeSpace( id: string, name: string, view: SpaceFeedLayout ): ReadSpaceDetails {
	return { id, name, tags: [], layout: { color: 'blue', icon: 'inbox', view }, sources: [] };
}

function makePost( overrides: Partial< ReadStreamPost > = {} ): ReadStreamPost {
	return {
		ID: 1,
		site_ID: 2,
		feed_ID: 3,
		feed_item_ID: 4,
		site_name: 'Work blog',
		title: 'A layout-sensitive post',
		URL: 'https://example.com/post',
		feed_URL: 'https://example.com/feed',
		date: '2026-06-23T12:00:00Z',
		...overrides,
	} as unknown as ReadStreamPost;
}

const WORK = makeSpace( 'work-id', 'Work', 'standard-list' );
const BASE = 'https://public-api.wordpress.com';

function render( space: ReadSpaceDetails ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( readSpaceQuery( space.id ).queryKey, space );

	return renderWithProvider( <SpaceFeed spaceId={ space.id } />, {
		queryClient,
		initialState: { currentUser: { id: 1 } },
	} );
}

function renderWithLayoutViewFallback( space: ReadSpaceDetails, layoutView: SpaceFeedLayout ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( readSpaceQuery( space.id ).queryKey, space );

	return renderWithProvider( <SpaceFeed spaceId={ space.id } layoutView={ layoutView } />, {
		queryClient,
		initialState: { currentUser: { id: 1 } },
	} );
}

describe( 'SpaceFeed', () => {
	beforeEach( () => {
		window.history.replaceState( {}, '', '/reader/spaces/work-id' );
		mockUseInfiniteStream.mockReturnValue( streamResult() );
	} );

	afterEach( () => nock.cleanAll() );

	it( 'shows the loading state while the stream loads', () => {
		mockUseInfiniteStream.mockReturnValue( streamResult( { isLoading: true } ) );
		render( WORK );

		expect( screen.getByText( 'Loading the feed…' ) ).toBeVisible();
	} );

	it( 'shows an error with a retry that refetches the stream', async () => {
		const user = userEvent.setup();
		const refetch = jest.fn();
		mockUseInfiniteStream.mockReturnValue(
			streamResult( { error: new Error( 'boom' ), refetch } )
		);
		render( WORK );

		await user.click( screen.getByRole( 'button', { name: 'Try again' } ) );

		expect( refetch ).toHaveBeenCalled();
	} );

	it( 'requests the posts stream in parallel with the space detail', async () => {
		// No detail seeded. The stream must be enabled immediately (not gated on the
		// detail) AND the detail request must also fire — both in flight together.
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		let detailRequested = false;
		nock( BASE )
			.get( `/wpcom/v2/reader/spaces/${ WORK.id }` )
			.reply( () => {
				detailRequested = true;
				return [
					200,
					{ id: WORK.id, title: WORK.name, layout: WORK.layout, follows: [], tags: [] },
				];
			} );

		renderWithProvider( <SpaceFeed spaceId={ WORK.id } />, {
			queryClient,
			initialState: { currentUser: { id: 1 } },
		} );

		// Stream is enabled on first render, with no detail in the cache.
		expect( mockUseInfiniteStream ).toHaveBeenCalledWith(
			expect.objectContaining( {
				streamKey: `space:${ WORK.id }`,
				options: expect.objectContaining( { enabled: true } ),
			} )
		);
		// The detail request is also initiated, confirming the two load in parallel.
		await waitFor( () => expect( detailRequested ).toBe( true ) );
	} );

	it( 'renders the feed from the layout-view fallback when the detail fails to load', async () => {
		// The detail fails, but the feed must still render from `layoutView` + the
		// stream rather than blocking on the detail.
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		nock( BASE ).get( `/wpcom/v2/reader/spaces/${ WORK.id }` ).reply( 500, {} );
		mockUseInfiniteStream.mockReturnValue(
			streamResult( { pages: [ { posts: [ makePost() ] } as unknown as ReadStreamResponse ] } )
		);

		const { container } = renderWithProvider(
			<SpaceFeed spaceId={ WORK.id } layoutView="gallery" />,
			{ queryClient, initialState: { currentUser: { id: 1 } } }
		);

		await waitFor( () =>
			expect( container.querySelector( '.space-feed-gallery' ) ).toBeInTheDocument()
		);
		expect( screen.queryByText( 'Couldn’t load this feed' ) ).not.toBeInTheDocument();
	} );

	it( 'shows the empty state when the stream has no posts', () => {
		render( WORK );

		expect( screen.getByText( 'Nothing here yet' ) ).toBeVisible();
	} );

	it( 'requests the space posts stream keyed by the space id', () => {
		render( WORK );

		expect( mockUseInfiniteStream ).toHaveBeenCalledWith(
			expect.objectContaining( { streamKey: `space:${ WORK.id }` } )
		);
	} );

	it( 'requests the discover stream keyed by the space id for the discover variant', () => {
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		queryClient.setQueryData( readSpaceQuery( WORK.id ).queryKey, WORK );

		renderWithProvider( <SpaceFeed spaceId={ WORK.id } variant="discover" />, {
			queryClient,
			initialState: { currentUser: { id: 1 } },
		} );

		expect( mockUseInfiniteStream ).toHaveBeenCalledWith(
			expect.objectContaining( { streamKey: `space_discover:${ WORK.id }` } )
		);
	} );

	it( 'shows the discover-specific empty copy for the discover variant', () => {
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		queryClient.setQueryData( readSpaceQuery( WORK.id ).queryKey, WORK );

		renderWithProvider( <SpaceFeed spaceId={ WORK.id } variant="discover" />, {
			queryClient,
			initialState: { currentUser: { id: 1 } },
		} );

		expect(
			screen.getByText( 'On-topic posts you don’t already follow will show up here.' )
		).toBeVisible();
	} );

	it( 'renders the layout selected by the space layout view', () => {
		mockUseInfiniteStream.mockReturnValue(
			streamResult( { pages: [ { posts: [ makePost() ] } as unknown as ReadStreamResponse ] } )
		);
		const { container } = render( makeSpace( 'work-id', 'Work', 'gallery' ) );

		expect( container.querySelector( '.space-feed-gallery' ) ).toBeInTheDocument();
		expect( container.querySelector( '.space-feed-standard-list' ) ).not.toBeInTheDocument();
	} );

	it( 'uses the provided layout view when the space detail has no view', () => {
		mockUseInfiniteStream.mockReturnValue(
			streamResult( { pages: [ { posts: [ makePost() ] } as unknown as ReadStreamResponse ] } )
		);
		const { layout, ...spaceWithoutView } = WORK;
		const { container } = renderWithLayoutViewFallback(
			{ ...spaceWithoutView, layout: { color: layout.color, icon: layout.icon } },
			'gallery'
		);

		expect( container.querySelector( '.space-feed-gallery' ) ).toBeInTheDocument();
		expect( container.querySelector( '.space-feed-standard-list' ) ).not.toBeInTheDocument();
	} );

	it( 'shows the empty state for the legacy layout when the legacy stream has no posts', () => {
		render( makeSpace( 'work-id', 'Work', 'legacy' ) );

		expect( screen.getByText( 'Nothing here yet' ) ).toBeVisible();
	} );

	it( 'shows an error with a retry for the legacy layout when the legacy stream fails', async () => {
		const user = userEvent.setup();
		const refetch = jest.fn();
		mockUseInfiniteStream.mockReturnValue(
			streamResult( { error: new Error( 'boom' ), refetch } )
		);

		render( makeSpace( 'work-id', 'Work', 'legacy' ) );

		await user.click( screen.getByRole( 'button', { name: 'Try again' } ) );

		expect( refetch ).toHaveBeenCalled();
	} );

	it( 'shows the loading-more skeleton while the next page is fetching', () => {
		const post = { ID: 1, site_ID: 2, site_name: 'Work blog' } as unknown as ReadStreamPost;
		mockUseInfiniteStream.mockReturnValue(
			streamResult( {
				pages: [ { posts: [ post ] } as unknown as ReadStreamResponse ],
				hasNextPage: true,
				isFetchingNextPage: true,
			} )
		);
		render( WORK );

		expect( screen.getByText( 'Loading more posts…' ) ).toBeInTheDocument();
	} );

	it( 'hides the loading-more skeleton when no page is fetching', () => {
		const post = { ID: 1, site_ID: 2, site_name: 'Work blog' } as unknown as ReadStreamPost;
		mockUseInfiniteStream.mockReturnValue(
			streamResult( { pages: [ { posts: [ post ] } as unknown as ReadStreamResponse ] } )
		);
		render( WORK );

		expect( screen.queryByText( 'Loading more posts…' ) ).not.toBeInTheDocument();
	} );
} );

describe( 'collectPosts', () => {
	it( 'prefers post cards over the legacy posts field when both are present', () => {
		const postFromPosts = {
			ID: 1,
			site_ID: 2,
			title: 'posts field',
		} as unknown as ReadStreamPost;
		const postFromCard = {
			ID: 2,
			site_ID: 3,
			title: 'card field',
		} as unknown as ReadStreamPost;

		expect(
			collectPosts( [
				{
					posts: [ postFromPosts ],
					cards: [ { type: 'post', data: postFromCard }, { type: 'recommendation' } ],
				} as unknown as ReadStreamResponse,
			] )
		).toEqual( [ postFromCard ] );
	} );
} );
