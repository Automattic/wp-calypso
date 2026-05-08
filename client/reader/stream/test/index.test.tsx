/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import Stream from '../index';
import type { ReactNode } from 'react';

jest.mock( 'calypso/reader/stream/post-lifecycle', () => {
	const ReactLib = require( 'react' ) as typeof import('react');
	return class PostLifecycle extends ReactLib.Component< {
		postKey: { postId: number };
		isSelected: boolean;
		handleClick: ( args: Record< string, unknown > ) => void;
	} > {
		render() {
			if ( 'isPromptBlock' in this.props.postKey ) {
				return <div data-testid="prompt-block" />;
			}
			if ( 'isRecommendationBlock' in this.props.postKey ) {
				return <div data-testid="recommendation-block" />;
			}
			return (
				// eslint-disable-next-line jsx-a11y/click-events-have-key-events
				<div
					data-testid={ `post-${ this.props.postKey.postId }` }
					className={ this.props.isSelected ? 'card is-selected' : 'card' }
					onClick={ () => this.props.handleClick( {} ) }
					role="button"
					tabIndex={ 0 }
				>
					<a href="#post" data-testid={ `post-${ this.props.postKey.postId }-link` }>
						link
					</a>
					<button
						type="button"
						data-testid={ `post-${ this.props.postKey.postId }-comments` }
						onClick={ ( event ) => {
							event.stopPropagation();
							this.props.handleClick( { comments: true } );
						} }
					>
						comments
					</button>
				</div>
			);
		}
	};
} );
jest.mock(
	'calypso/reader/stream/post-placeholder',
	() =>
		function PostPlaceholder() {
			return <div data-testid="post-placeholder" />;
		}
);
jest.mock(
	'calypso/reader/components/reader-main',
	() =>
		function ReaderMain( { children }: { children: ReactNode } ) {
			return <div data-testid="reader-main">{ children }</div>;
		}
);
jest.mock( 'calypso/lib/with-dimensions', () => ( Component: React.ComponentType ) => Component );
jest.mock( 'calypso/components/infinite-list', () => {
	const ReactLib = require( 'react' ) as typeof import('react');
	return class InfiniteList extends ReactLib.Component< {
		items: Array< { postId: number } >;
		fetchingNextPage?: boolean;
		renderItem: ( postKey: { postId: number }, idx: number ) => ReactNode;
		renderLoadingPlaceholders?: () => ReactNode;
	} > {
		scrollToTop = jest.fn();
		getVisibleItemIndexes = jest.fn( () => [] );

		render() {
			const { items, fetchingNextPage, renderItem, renderLoadingPlaceholders } = this.props;
			const showPlaceholders = items.length === 0 && fetchingNextPage;
			return (
				<div data-testid="infinite-list" style={ { overflowY: 'auto' } }>
					{ showPlaceholders
						? renderLoadingPlaceholders?.()
						: items.map( ( item, idx ) => <div key={ idx }>{ renderItem( item, idx ) }</div> ) }
				</div>
			);
		}
	};
} );
jest.mock( '@automattic/calypso-router', () => {
	const replace = jest.fn();
	const fn = jest.fn() as jest.Mock & { replace: jest.Mock; show: jest.Mock };
	fn.replace = replace;
	fn.show = jest.fn();
	return { __esModule: true, default: fn };
} );

const BASE = 'https://public-api.wordpress.com';
const LIKES_PATH = '/rest/v1.2/read/liked';
const originalScrollTo = window.scrollTo;
const originalIntersectionObserver = ( window as unknown as { IntersectionObserver?: unknown } )
	.IntersectionObserver;

class IntersectionObserverStub {
	observe = jest.fn();
	unobserve = jest.fn();
	disconnect = jest.fn();
	takeRecords = jest.fn( () => [] );
	root = null;
	rootMargin = '';
	thresholds: number[] = [];
}

beforeAll( () => {
	Object.defineProperty( window, 'scrollTo', { writable: true, value: jest.fn() } );
	// `<SectionNav>` (rendered in narrow-viewport layouts) installs an
	// IntersectionObserver to detect tab overflow; jsdom doesn't ship one.
	( window as unknown as { IntersectionObserver: unknown } ).IntersectionObserver =
		IntersectionObserverStub;
} );

afterAll( () => {
	Object.defineProperty( window, 'scrollTo', { writable: true, value: originalScrollTo } );
	( window as unknown as { IntersectionObserver: unknown } ).IntersectionObserver =
		originalIntersectionObserver;
} );

afterEach( () => {
	nock.cleanAll();
} );

interface ApiPost {
	ID: number;
	site_ID: number;
	URL?: string;
	date_liked?: string;
}

function apiPost( id: number, overrides: Partial< ApiPost > = {} ): ApiPost {
	return {
		ID: id,
		site_ID: 100,
		URL: `https://example.com/post-${ id }`,
		date_liked: `2026-04-${ String( id ).padStart( 2, '0' ) }T00:00:00Z`,
		...overrides,
	};
}

function makeQueryClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

const baseState = {
	ui: { language: { localeSlug: 'en' }, isNotificationsOpen: false },
	documentHead: { unreadCount: 0 },
	currentUser: { id: 1, user: { ID: 1, primary_blog: null } },
	readerUi: { sidebar: { selectedRecentSite: null } },
	reader: {
		feeds: { items: {} },
		follows: { items: {} },
		siteBlocks: { items: {} },
		sites: { items: {} },
		posts: { items: {} },
		streams: {},
	},
	posts: { likes: {} },
};

const followedFeedState = {
	itemsCount: 1,
	items: { 1: { feed_ID: 1, is_following: true } },
};

function renderStream(
	extraProps: Record< string, unknown > = {},
	initialStateOverride = {},
	queryClient = makeQueryClient()
) {
	const seedState = { ...baseState, ...initialStateOverride };
	// `<Stream>` keeps post selection in the React Query cache (see
	// `useStreamPostKeySelection`); only thunks like `likePost` need to dispatch
	// against the store, so a passthrough reducer is enough.
	const store = createStore(
		( state = seedState ) => state,
		seedState,
		applyMiddleware( thunkMiddleware )
	);
	const utils = render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>
				<Stream streamKey="likes" trackScrollPage={ jest.fn() } { ...extraProps } />
			</Provider>
		</QueryClientProvider>
	);
	return { ...utils, store, queryClient };
}

function mockLikesEndpoint( posts: ApiPost[], dateAfter: string | null = null ) {
	return nock( BASE )
		.get( LIKES_PATH )
		.query( true )
		.reply( 200, {
			posts,
			date_range: { after: dateAfter, before: null },
		} );
}

describe( 'Stream — render states', () => {
	it( 'renders skeleton placeholders during the initial fetch', async () => {
		nock( BASE )
			.get( LIKES_PATH )
			.query( true )
			.delay( 200 )
			.reply( 200, { posts: [], date_range: { after: null, before: null } } );

		renderStream();

		await waitFor( () =>
			expect( screen.queryAllByTestId( 'post-placeholder' ).length ).toBeGreaterThan( 0 )
		);
	} );

	it( 'forces skeleton placeholders when forcePlaceholders is true', async () => {
		mockLikesEndpoint( [ apiPost( 10 ) ] );
		renderStream( { forcePlaceholders: true } );

		await waitFor( () =>
			expect( screen.queryAllByTestId( 'post-placeholder' ).length ).toBeGreaterThan( 0 )
		);
		expect( screen.queryByTestId( 'post-10' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the empty state when the API returns no posts', async () => {
		mockLikesEndpoint( [] );
		const emptyContent = jest.fn( () => <div data-testid="empty">no posts</div> );

		renderStream( { emptyContent } );

		await waitFor( () => expect( screen.getByTestId( 'empty' ) ).toBeVisible() );
		expect( emptyContent ).toHaveBeenCalled();
	} );

	it( 'renders the default empty content when emptyContent is not provided', async () => {
		mockLikesEndpoint( [] );
		renderStream();

		await waitFor( () => expect( screen.getByText( "You're all caught up." ) ).toBeVisible() );
		expect( screen.getByText( 'No new posts.' ) ).toBeVisible();
	} );

	it( 'renders stream sidebar in wide layout, including empty state', async () => {
		// The named `Stream` export takes `width` directly; the default export
		// gets it injected via `withDimensions`. Pass it inline to flip into the
		// two-column layout for this case.
		mockLikesEndpoint( [] );
		renderStream( {
			wideLayout: true,
			width: 1200,
			streamSidebar: () => <div data-testid="stream-sidebar">sidebar</div>,
		} );

		await waitFor( () => expect( screen.getByText( "You're all caught up." ) ).toBeVisible() );
		expect( screen.getByTestId( 'stream-sidebar' ) ).toBeVisible();
	} );

	it( 'renders posts once the API responds', async () => {
		mockLikesEndpoint( [ apiPost( 10 ), apiPost( 20 ) ] );
		renderStream();

		await waitFor( () => expect( screen.getByTestId( 'post-10' ) ).toBeVisible() );
		expect( screen.getByTestId( 'post-20' ) ).toBeVisible();
	} );

	it( 'passes comment click args through to full-post navigation', async () => {
		mockLikesEndpoint( [ apiPost( 10 ) ] );
		renderStream();

		await waitFor( () => expect( screen.getByTestId( 'post-10' ) ).toBeVisible() );
		fireEvent.click( screen.getByTestId( 'post-10-comments' ) );

		await waitFor( () =>
			expect( page ).toHaveBeenCalledWith( '/reader/blogs/100/posts/10#comments' )
		);
	} );

	it( 'injects prompt blocks into long streams', async () => {
		mockLikesEndpoint( Array.from( { length: 11 }, ( _, index ) => apiPost( index + 1 ) ) );
		renderStream( {}, { reader: { ...baseState.reader, follows: followedFeedState } } );

		await waitFor( () => expect( screen.getByTestId( 'post-11' ) ).toBeVisible() );
		expect( screen.getByTestId( 'prompt-block' ) ).toBeVisible();
	} );

	it( 'injects recommendation blocks when a recommendation stream is supplied', async () => {
		mockLikesEndpoint( [ apiPost( 1 ), apiPost( 2 ), apiPost( 3 ), apiPost( 4 ), apiPost( 5 ) ] );
		nock( BASE )
			.get( '/rest/v1.2/read/recommendations/posts' )
			.query( true )
			.reply( 200, {
				posts: [ apiPost( 101 ), apiPost( 102 ) ],
				date_range: { after: null, before: null },
			} );
		renderStream(
			{ recsStreamKey: 'custom_recs_posts_with_images' },
			{ reader: { ...baseState.reader, follows: followedFeedState } }
		);

		await waitFor( () => expect( screen.getByTestId( 'recommendation-block' ) ).toBeVisible() );
	} );

	it( 'renders the error state when the API fails', async () => {
		nock( BASE ).get( LIKES_PATH ).query( true ).reply( 500, { error: 'kaboom' } );
		renderStream();

		await waitFor( () =>
			expect( screen.queryByTestId( 'infinite-list' ) ).not.toBeInTheDocument()
		);
	} );

	it( 'no post carries the selected class on first paint', async () => {
		mockLikesEndpoint( [ apiPost( 10 ), apiPost( 20 ) ] );
		renderStream();

		await waitFor( () => expect( screen.getByTestId( 'post-10' ) ).toBeVisible() );
		expect( screen.getByTestId( 'post-10' ) ).not.toHaveClass( 'is-selected' );
		expect( screen.getByTestId( 'post-20' ) ).not.toHaveClass( 'is-selected' );
	} );
} );

describe( 'Stream — keyboard navigation', () => {
	async function setupAndSelectFirst() {
		mockLikesEndpoint( [ apiPost( 10 ), apiPost( 20 ), apiPost( 30 ) ] );
		const utils = renderStream();
		await waitFor( () => expect( utils.getByTestId( 'post-10' ) ).toBeVisible() );
		fireEvent.click( utils.getByTestId( 'post-10' ) );
		await waitFor( () => expect( utils.getByTestId( 'post-10' ) ).toHaveClass( 'is-selected' ) );
		return utils;
	}

	it( 'j moves the selection forward', async () => {
		const { getByTestId } = await setupAndSelectFirst();
		fireEvent.keyDown( document, { key: 'j' } );
		await waitFor( () => expect( getByTestId( 'post-20' ) ).toHaveClass( 'is-selected' ) );
		expect( getByTestId( 'post-10' ) ).not.toHaveClass( 'is-selected' );
		expect( getByTestId( 'post-30' ) ).not.toHaveClass( 'is-selected' );
	} );

	it( 'ArrowRight is an alias for j', async () => {
		const { getByTestId } = await setupAndSelectFirst();
		fireEvent.keyDown( document, { key: 'ArrowRight' } );
		await waitFor( () => expect( getByTestId( 'post-20' ) ).toHaveClass( 'is-selected' ) );
	} );

	it( 'k moves the selection backward', async () => {
		const { getByTestId } = await setupAndSelectFirst();
		fireEvent.keyDown( document, { key: 'j' } );
		await waitFor( () => expect( getByTestId( 'post-20' ) ).toHaveClass( 'is-selected' ) );
		fireEvent.keyDown( document, { key: 'k' } );
		await waitFor( () => expect( getByTestId( 'post-10' ) ).toHaveClass( 'is-selected' ) );
	} );
} );
