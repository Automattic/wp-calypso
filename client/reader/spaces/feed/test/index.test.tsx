/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { upsertPostCache } from 'calypso/reader/data/post/cache';
import { useInfiniteStream } from 'calypso/reader/data/stream';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SpaceFeed } from '../index';
import type {
	ReadSpaceDetails,
	ReadStreamPost,
	ReadStreamResponse,
	SpaceFeedLayout,
} from '@automattic/api-core';

let mockCurrentLocaleSlug: string | null = null;

jest.mock( 'calypso/reader/data/stream', () => ( {
	useInfiniteStream: jest.fn(),
	getCachedStreamItems: jest.fn( () => [] ),
} ) );

jest.mock( 'calypso/reader/hooks/use-infinite-list', () => ( {
	ScrollDebugOverlay: () => null,
	useInfiniteList: jest.fn( ( { count } ) => ( {
		getListProps: ( props = {} ) => props,
		items: Array.from( { length: count }, ( _value, index ) => ( {
			index,
			key: `item-${ index }`,
			start: index * 100,
			lane: 0,
		} ) ),
		measureElement: jest.fn(),
		scrollMargin: 0,
		scrollToIndex: jest.fn(),
	} ) ),
} ) );

jest.mock( 'calypso/state/selectors/get-current-locale-slug', () =>
	jest.fn( () => mockCurrentLocaleSlug )
);

jest.mock( 'calypso/state/reader/site-blocks/selectors', () => {
	const blockedSites: number[] = [];
	const getBlockedSites = jest.fn( () => blockedSites );
	return { getBlockedSites };
} );

const mockRecordReaderTracksEvent: jest.Mock = jest.fn( () => ( {
	type: 'TEST_TRACKS_EVENT',
} ) );

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: ( ...args: unknown[] ) => mockRecordReaderTracksEvent( ...args ),
} ) );

const mockUseInfiniteStream = useInfiniteStream as jest.Mock;

function postsFromPages( pages: ReadStreamResponse[] ): ReadStreamPost[] {
	return pages.flatMap( ( page ) =>
		page.cards
			? page.cards.filter( ( card ) => card.type === 'post' ).map( ( card ) => card.data )
			: page.posts ?? []
	);
}

function streamResult( overrides: Partial< ReturnType< typeof useInfiniteStream > > = {} ) {
	const result = {
		items: [],
		posts: [],
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
	// The real hook parses `posts` from the pages; mirror that so tests can keep
	// setting `pages` (or override `posts` directly).
	if ( ! ( 'posts' in overrides ) ) {
		result.posts = postsFromPages( result.pages ) as never;
	}
	return result;
}

function makeSpace( id: string, name: string, view: SpaceFeedLayout ): ReadSpaceDetails {
	return {
		id,
		slug: name.toLowerCase().replace( /\s+/g, '-' ),
		name,
		tags: [],
		languages: [],
		layout: { color: 'blue', icon: 'inbox', view },
		sources: [],
	};
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

// SpaceFeed receives the already-resolved space detail as a prop (the view resolves
// it once by slug), so tests just pass the space — no query cache to seed.
function render( space: ReadSpaceDetails ) {
	return renderWithProvider( <SpaceFeed space={ space } />, {
		queryClient: new QueryClient( { defaultOptions: { queries: { retry: false } } } ),
		initialState: { currentUser: { id: 1 } },
	} );
}

describe( 'SpaceFeed', () => {
	beforeEach( () => {
		window.history.replaceState( {}, '', '/reader/spaces/work-id' );
		mockCurrentLocaleSlug = null;
		mockRecordReaderTracksEvent.mockClear();
		mockUseInfiniteStream.mockReturnValue( streamResult() );
	} );

	it( 'shows the loading state while the stream loads', () => {
		mockUseInfiniteStream.mockReturnValue( streamResult( { isLoading: true } ) );
		render( WORK );

		expect( screen.getByText( 'Loading the feed…' ) ).toBeVisible();
	} );

	it( 'shows an error with a retry that refetches the stream and the space', async () => {
		const user = userEvent.setup();
		const refetch = jest.fn();
		const onRetrySpace = jest.fn();
		mockUseInfiniteStream.mockReturnValue(
			streamResult( { error: new Error( 'boom' ), refetch } )
		);
		renderWithProvider( <SpaceFeed space={ WORK } onRetrySpace={ onRetrySpace } />, {
			queryClient: new QueryClient( { defaultOptions: { queries: { retry: false } } } ),
			initialState: { currentUser: { id: 1 } },
		} );

		await user.click( screen.getByRole( 'button', { name: 'Try again' } ) );

		expect( refetch ).toHaveBeenCalled();
		expect( onRetrySpace ).toHaveBeenCalled();
	} );

	it( 'enables the posts stream immediately from the passed space', () => {
		render( WORK );

		expect( mockUseInfiniteStream ).toHaveBeenCalledWith(
			expect.objectContaining( {
				streamKey: `space:${ WORK.id }`,
				options: expect.objectContaining( { enabled: true } ),
			} )
		);
	} );

	it( 'shows an actionable empty state with an Add feeds CTA when the feed has no posts', async () => {
		const user = userEvent.setup();
		const onAddSources = jest.fn();
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

		renderWithProvider( <SpaceFeed space={ WORK } onAddSources={ onAddSources } />, {
			queryClient,
			initialState: { currentUser: { id: 1 } },
		} );

		expect( screen.getByText( 'Add feeds to get started' ) ).toBeVisible();

		await user.click( screen.getByRole( 'button', { name: 'Add feeds' } ) );

		expect( onAddSources ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'shows the Add feeds CTA in the legacy layout empty state', async () => {
		const user = userEvent.setup();
		const onAddSources = jest.fn();
		const legacy = makeSpace( 'work-id', 'Work', 'legacy' );
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

		renderWithProvider( <SpaceFeed space={ legacy } onAddSources={ onAddSources } />, {
			queryClient,
			initialState: { currentUser: { id: 1 } },
		} );

		await user.click( screen.getByRole( 'button', { name: 'Add feeds' } ) );

		expect( onAddSources ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'shows the Discover empty state without an Add feeds CTA', () => {
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

		renderWithProvider(
			<SpaceFeed space={ WORK } variant="discover" onAddSources={ jest.fn() } />,
			{ queryClient, initialState: { currentUser: { id: 1 } } }
		);

		expect( screen.getByText( 'Nothing here yet' ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Add feeds' } ) ).not.toBeInTheDocument();
	} );

	it( 'requests the space posts stream keyed by the space id', () => {
		render( WORK );

		expect( mockUseInfiniteStream ).toHaveBeenCalledWith(
			expect.objectContaining( { streamKey: `space:${ WORK.id }` } )
		);
	} );

	it( 'passes the non-default locale to the stream request', () => {
		mockCurrentLocaleSlug = 'pt-br';
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

		renderWithProvider( <SpaceFeed space={ WORK } />, {
			queryClient,
			initialState: { currentUser: { id: 1 } },
		} );

		expect( mockUseInfiniteStream ).toHaveBeenCalledWith(
			expect.objectContaining( {
				streamKey: `space:${ WORK.id }`,
				localeSlug: 'pt-br',
			} )
		);
	} );

	it( 'stores the full stream item when selecting a post', async () => {
		const user = userEvent.setup();
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		const post = makePost();
		// Cards render from the canonical cache; seed it so the row shows the post.
		upsertPostCache( queryClient, [ post ] );
		const streamItem = {
			feedId: post.feed_ID,
			postId: post.feed_item_ID,
			url: post.URL,
			site_name: post.site_name,
		};
		mockUseInfiniteStream.mockReturnValue(
			streamResult( {
				items: [ streamItem ],
				pages: [ { posts: [ post ] } as unknown as ReadStreamResponse ],
			} )
		);

		renderWithProvider( <SpaceFeed space={ WORK } />, {
			queryClient,
			initialState: { currentUser: { id: 1 } },
		} );

		const link = screen.getByRole( 'link', { name: 'A layout-sensitive post' } );
		link.addEventListener( 'click', ( event ) => event.preventDefault() );
		await user.click( link );

		expect(
			queryClient.getQueryData( [ 'read', 'stream', 'selected', `space:${ WORK.id }`, null ] )
		).toEqual( streamItem );
	} );

	it( 'records a tracks event when a post is opened', async () => {
		const user = userEvent.setup();
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		const post = makePost();
		upsertPostCache( queryClient, [ post ] );
		mockUseInfiniteStream.mockReturnValue(
			streamResult( { pages: [ { posts: [ post ] } as unknown as ReadStreamResponse ] } )
		);

		renderWithProvider( <SpaceFeed space={ WORK } />, {
			queryClient,
			initialState: { currentUser: { id: 1 } },
		} );

		const link = screen.getByRole( 'link', { name: 'A layout-sensitive post' } );
		link.addEventListener( 'click', ( event ) => event.preventDefault() );
		await user.click( link );

		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_spaces_post_opened',
			{ space_id: WORK.id, layout: 'standard-list', variant: 'feed' },
			{ post }
		);
	} );

	it( 'requests the discover stream keyed by the space id for the discover variant', () => {
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

		renderWithProvider( <SpaceFeed space={ WORK } variant="discover" />, {
			queryClient,
			initialState: { currentUser: { id: 1 } },
		} );

		expect( mockUseInfiniteStream ).toHaveBeenCalledWith(
			expect.objectContaining( { streamKey: `space_discover:${ WORK.id }` } )
		);
	} );

	it( 'shows the discover-specific empty copy for the discover variant', () => {
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

		renderWithProvider( <SpaceFeed space={ WORK } variant="discover" />, {
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

	it( 'falls back to the default layout when the space has no view', () => {
		mockUseInfiniteStream.mockReturnValue(
			streamResult( { pages: [ { posts: [ makePost() ] } as unknown as ReadStreamResponse ] } )
		);
		const { layout, ...spaceWithoutView } = WORK;
		// No `layout.view` on the space → the default (standard-list) layout renders.
		const { container } = render( {
			...spaceWithoutView,
			layout: { color: layout.color, icon: layout.icon },
		} );

		expect( container.querySelector( '.space-feed-standard-list' ) ).toBeInTheDocument();
		expect( container.querySelector( '.space-feed-gallery' ) ).not.toBeInTheDocument();
	} );

	it( 'shows the empty state for the legacy layout when the legacy stream has no posts', () => {
		render( makeSpace( 'work-id', 'Work', 'legacy' ) );

		expect( screen.getByText( 'Add feeds to get started' ) ).toBeVisible();
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
