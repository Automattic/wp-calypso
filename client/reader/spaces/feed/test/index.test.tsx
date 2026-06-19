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

	it( 'shows an error with a retry when the space detail fails to load', async () => {
		const user = userEvent.setup();
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		nock( BASE ).get( `/wpcom/v2/reader/spaces/${ WORK.id }` ).reply( 500, {} );
		nock( BASE ).get( `/wpcom/v2/reader/spaces/${ WORK.id }` ).reply( 200, {
			id: WORK.id,
			title: WORK.name,
			layout: WORK.layout,
			follows: [],
			tags: [],
		} );

		renderWithProvider( <SpaceFeed spaceId={ WORK.id } />, {
			queryClient,
			initialState: { currentUser: { id: 1 } },
		} );

		expect( await screen.findByText( 'Couldn’t load this feed' ) ).toBeVisible();

		await user.click( screen.getByRole( 'button', { name: 'Try again' } ) );

		await waitFor( () =>
			expect( screen.queryByText( 'Couldn’t load this feed' ) ).not.toBeInTheDocument()
		);
		expect( await screen.findByText( 'Nothing here yet' ) ).toBeVisible();
	} );

	it( 'shows the empty state when the stream has no posts', () => {
		render( WORK );

		expect( screen.getByText( 'Nothing here yet' ) ).toBeVisible();
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
