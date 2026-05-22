/**
 * @jest-environment jsdom
 */
import { act, screen, waitFor } from '@testing-library/react';
import { createStore } from 'redux';
import { useCachedPosts } from 'calypso/reader/data/post-cache';
import { useStreamPosts } from 'calypso/reader/stream/use-stream-posts';
import { errorNotice } from 'calypso/state/notices/actions';
import { getBlockedSites } from 'calypso/state/reader/site-blocks/selectors';
import { viewStream } from 'calypso/state/reader-ui/actions';
import { getSelectedRecentFeedId } from 'calypso/state/reader-ui/sidebar/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { FullFeed } from '../full-feed';

jest.mock( 'calypso/reader/components/reader-main', () => ( {
	__esModule: true,
	default: ( {
		children,
		className,
		forwardRef,
	}: {
		children: React.ReactNode;
		className?: string;
		forwardRef?: React.Ref< HTMLDivElement >;
	} ) => (
		<main className={ className } ref={ forwardRef }>
			{ children }
		</main>
	),
} ) );

jest.mock( 'calypso/reader/reader-performance-tracker', () => ( {
	ReaderPerformanceTrackerStop: () => <span data-testid="reader-performance-stop" />,
} ) );

jest.mock( 'calypso/components/bloganuary-header', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( 'calypso/components/navigation-header', () => ( {
	__esModule: true,
	default: ( { children, title }: { children?: React.ReactNode; title: string } ) => (
		<header>
			<h1>{ title }</h1>
			{ children }
		</header>
	),
} ) );

jest.mock( 'calypso/components/list-end', () => ( {
	__esModule: true,
	default: () => <div>End of feed</div>,
} ) );

jest.mock( 'calypso/reader/stream/empty', () => ( {
	__esModule: true,
	default: () => <p>No posts</p>,
} ) );

jest.mock( 'calypso/reader/stream/post-unavailable', () => ( {
	__esModule: true,
	default: ( { post }: { post: { title: string } } ) => (
		<article aria-label={ `${ post.title } unavailable` }>Unavailable</article>
	),
} ) );

jest.mock( 'calypso/blocks/reader-post-card/blocked', () => ( {
	__esModule: true,
	default: ( { post }: { post: { title: string } } ) => (
		<article aria-label={ `${ post.title } blocked` }>Blocked</article>
	),
} ) );

jest.mock( '../full-feed-post', () => ( {
	FullFeedPost: ( { post }: { post: { title: string } } ) => (
		<article aria-label={ post.title }>{ post.title }</article>
	),
} ) );

const mockFirstPost = {
	ID: 456,
	feed_ID: 123,
	feed_item_ID: 456,
	global_ID: 'first-post',
	is_seen: false,
	title: 'First post',
};

const mockPostWithSeenFlag = {
	ID: 789,
	feed_ID: 123,
	feed_item_ID: 789,
	global_ID: 'post-with-seen-flag',
	is_seen: true,
	title: 'Post with seen flag',
};

const mockBlockedPost = {
	ID: 147,
	feed_ID: 123,
	feed_item_ID: 147,
	global_ID: 'blocked-post',
	is_external: false,
	site_ID: 999,
	title: 'Blocked post',
};

const mockErrorPost = {
	ID: 258,
	feed_ID: 123,
	feed_item_ID: 258,
	global_ID: 'error-post',
	is_error: true,
	title: 'Error post',
};

const mockRecordReaderTracksEvent = jest.fn();
let mockPostsByPostId: Record<
	number,
	typeof mockFirstPost | typeof mockPostWithSeenFlag | typeof mockBlockedPost | typeof mockErrorPost
> = {};

jest.mock( 'calypso/state/reader/analytics/useRecordReaderTracksEvent', () => ( {
	useRecordReaderTracksEvent: jest.fn( () => mockRecordReaderTracksEvent ),
} ) );

jest.mock( 'calypso/reader/stream/use-stream-posts', () => ( {
	useStreamPosts: jest.fn(),
} ) );

jest.mock( 'calypso/reader/data/post-cache', () => ( {
	useCachedPosts: jest.fn(),
} ) );

jest.mock( 'calypso/state/reader-ui/sidebar/selectors', () => ( {
	getSelectedRecentFeedId: jest.fn(),
} ) );

jest.mock( 'calypso/state/reader/site-blocks/selectors', () => ( {
	getBlockedSites: jest.fn(),
} ) );

jest.mock( 'calypso/state/selectors/get-current-locale-slug', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

jest.mock( 'calypso/state/reader-ui/actions', () => ( {
	viewStream: jest.fn( ( streamKey, path ) => ( {
		type: 'VIEW_STREAM',
		path,
		streamKey,
	} ) ),
} ) );

jest.mock( 'calypso/state/notices/actions', () => ( {
	errorNotice: jest.fn( ( text, options ) => ( { type: 'ERROR_NOTICE', text, options } ) ),
} ) );

const populatedStream = {
	error: null,
	isRequesting: false,
	items: [
		{ isGap: true, postId: 1 },
		{ feedId: 123, postId: 456 },
		{ isRecommendationBlock: true, postId: 2 },
	],
	lastPage: false,
	pageHandle: { page_handle: 'next-page' },
};

const mockUseStreamPosts = useStreamPosts as jest.MockedFunction< typeof useStreamPosts >;
const mockUseCachedPosts = useCachedPosts as jest.MockedFunction< typeof useCachedPosts >;
let mockFetchNextPage: jest.Mock;

const createStreamPostsQuery = (
	overrides: Partial< ReturnType< typeof useStreamPosts > > = {}
): ReturnType< typeof useStreamPosts > => ( {
	items: populatedStream.items,
	pages: [],
	isLoading: false,
	isFetching: false,
	isFetchingNextPage: false,
	isRefetching: false,
	hasNextPage: true,
	lastPage: false,
	error: null,
	fetchNextPage: mockFetchNextPage,
	refetch: jest.fn(),
	invalidate: jest.fn(),
	...overrides,
} );

const renderFullFeed = ( props: Partial< React.ComponentProps< typeof FullFeed > > = {} ) =>
	renderWithProvider(
		<FullFeed streamKey="following" viewToggle={ <button>Toggle</button> } { ...props } />
	);

describe( 'FullFeed', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		window.scrollTo = jest.fn();
		mockFetchNextPage = jest.fn();
		mockPostsByPostId = {
			456: mockFirstPost,
			789: mockPostWithSeenFlag,
			147: mockBlockedPost,
			258: mockErrorPost,
		};
		( getSelectedRecentFeedId as jest.Mock ).mockReturnValue( null );
		( getCurrentLocaleSlug as jest.Mock ).mockReturnValue( 'en' );
		( getBlockedSites as jest.Mock ).mockReturnValue( [] );
		mockUseStreamPosts.mockReturnValue( createStreamPostsQuery() );
		mockUseCachedPosts.mockImplementation(
			( postKeys ) =>
				postKeys.map( ( item ) => {
					if ( ! item || typeof item !== 'object' || ! ( 'postId' in item ) ) {
						return null;
					}

					return mockPostsByPostId[ Number( item.postId ) ] ?? null;
				} ) as ReturnType< typeof useCachedPosts >
		);
	} );

	it( 'renders full-feed posts from the following stream', () => {
		renderFullFeed();

		expect( screen.getByRole( 'heading', { name: 'Full feed' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Toggle' } ) ).toBeVisible();
		expect( screen.getByRole( 'article', { name: 'First post' } ) ).toBeVisible();
		expect( screen.getByTestId( 'reader-performance-stop' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'No posts' ) ).not.toBeInTheDocument();
		expect( viewStream ).toHaveBeenCalledWith( 'following', expect.any( String ) );
		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith( 'calypso_reader_full_feed_viewed', {
			feed_id: undefined,
			is_filtered_feed: 0,
			stream_key: 'following',
		} );
		expect( mockUseStreamPosts ).toHaveBeenCalledWith(
			expect.objectContaining( {
				feedId: null,
				localeSlug: null,
				startDate: null,
				streamKey: 'following',
			} )
		);
	} );

	it( 'renders posts even when the API marks them seen', () => {
		mockUseStreamPosts.mockReturnValue(
			createStreamPostsQuery( {
				items: [
					{ feedId: 123, postId: 456 },
					{ feedId: 123, postId: 789 },
				],
			} )
		);

		renderFullFeed();

		expect( screen.getByRole( 'article', { name: 'First post' } ) ).toBeVisible();
		expect( screen.getByRole( 'article', { name: 'Post with seen flag' } ) ).toBeVisible();
		expect(
			screen.queryByText( 'You are all caught up in the loaded posts.' )
		).not.toBeInTheDocument();
	} );

	it( 'uses the stream lifecycle blocked and unavailable states', () => {
		( getBlockedSites as jest.Mock ).mockReturnValue( [ 999 ] );
		mockUseStreamPosts.mockReturnValue(
			createStreamPostsQuery( {
				items: [
					{ feedId: 123, postId: 147 },
					{ feedId: 123, postId: 258 },
				],
			} )
		);

		renderFullFeed();

		expect( screen.getByRole( 'article', { name: 'Blocked post blocked' } ) ).toBeVisible();
		expect( screen.getByRole( 'article', { name: 'Error post unavailable' } ) ).toBeVisible();
	} );

	it( 'shows the empty state while the stream hook has no posts', () => {
		mockUseStreamPosts.mockReturnValue(
			createStreamPostsQuery( {
				error: null,
				items: [],
				lastPage: false,
			} )
		);

		renderFullFeed();

		expect( screen.getByText( 'No posts' ) ).toBeVisible();
		expect( mockUseStreamPosts ).toHaveBeenCalledWith(
			expect.objectContaining( {
				feedId: null,
				streamKey: 'following',
			} )
		);
	} );

	it( 'passes the start date to the stream hook', () => {
		mockUseStreamPosts.mockReturnValue(
			createStreamPostsQuery( {
				error: null,
				items: [],
				lastPage: false,
			} )
		);

		renderFullFeed( { startDate: '2026-04-17' } );

		expect( mockUseStreamPosts ).toHaveBeenCalledWith(
			expect.objectContaining( {
				startDate: '2026-04-17',
				streamKey: 'following',
			} )
		);
	} );

	it( 'surfaces stream errors via the Reader notice system', async () => {
		mockUseStreamPosts.mockReturnValue(
			createStreamPostsQuery( {
				error: new Error( 'network failed' ),
				items: [],
				lastPage: false,
			} )
		);

		renderFullFeed();

		await waitFor( () => {
			expect( errorNotice ).toHaveBeenCalledWith(
				'Sorry, we had a problem loading posts.',
				expect.objectContaining( { duration: 5000 } )
			);
		} );
	} );

	it( 'resets the scroll position and switches stream keys when the selected feed changes', async () => {
		const store = createStore(
			( state = { selectedFeedId: null }, action: { type: string; feedId?: number } ) => {
				if ( action.type === 'SET_SELECTED_FEED' ) {
					return { selectedFeedId: action.feedId ?? null };
				}
				return state;
			}
		);
		( getSelectedRecentFeedId as jest.Mock ).mockImplementation(
			( state ) => state.selectedFeedId
		);

		renderWithProvider( <FullFeed streamKey="following" viewToggle={ <button>Toggle</button> } />, {
			store,
		} );

		act( () => {
			store.dispatch( { type: 'SET_SELECTED_FEED', feedId: 123 } );
		} );

		await waitFor( () => {
			expect( mockUseStreamPosts ).toHaveBeenCalledWith(
				expect.objectContaining( {
					feedId: 123,
					streamKey: 'following:feed-123',
				} )
			);
			expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_full_feed_viewed',
				{
					feed_id: 123,
					is_filtered_feed: 1,
					stream_key: 'following:feed-123',
				}
			);
		} );
		expect( window.scrollTo ).toHaveBeenCalledWith( 0, 0 );
	} );
} );
