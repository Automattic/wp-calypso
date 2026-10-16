/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import { createPostCacheMiddleware } from 'calypso/reader/data/post/middleware';
import { useSavePost } from 'calypso/reader/data/saved-posts';
import SavedPostsStream from '../main';
import type { ReactNode } from 'react';

jest.mock(
	'calypso/reader/stream/post-lifecycle',
	() =>
		function PostLifecycle( { postKey }: { postKey: { postId: number } } ) {
			return <div data-testid={ `post-${ postKey.postId }` } />;
		}
);
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
			return <div>{ children }</div>;
		}
);
jest.mock( 'calypso/lib/with-dimensions', () => ( Component: React.ComponentType ) => Component );
jest.mock(
	'calypso/components/infinite-list',
	() =>
		function InfiniteList( {
			items,
			renderItem,
		}: {
			items: Array< { postId: number } >;
			renderItem: ( item: { postId: number }, idx: number ) => ReactNode;
		} ) {
			return (
				<div>
					{ items.map( ( item, idx ) => (
						<div key={ item.postId }>{ renderItem( item, idx ) }</div>
					) ) }
				</div>
			);
		}
);
jest.mock( '@automattic/calypso-router', () => {
	const fn = jest.fn() as jest.Mock & { replace: jest.Mock; show: jest.Mock };
	fn.replace = jest.fn();
	fn.show = jest.fn();
	return { __esModule: true, default: fn };
} );

const BASE = 'https://public-api.wordpress.com';
const SAVED_PATH = '/rest/v1.2/read/saved';

const state = {
	ui: { language: { localeSlug: 'en' }, isNotificationsOpen: false },
	documentHead: { unreadCount: 0 },
	currentUser: { id: 1, user: { ID: 1, primary_blog: null } },
	readerUi: { sidebar: { selectedRecentSite: null } },
	reader: {
		feeds: { items: {} },
		siteBlocks: { items: {} },
		sites: { items: {} },
		posts: { items: {} },
		streams: {},
	},
};

function savedPost( id: number ) {
	return {
		ID: id,
		site_ID: 100,
		URL: `https://example.com/post-${ id }`,
		date_saved: `2026-10-${ String( id ).padStart( 2, '0' ) }T00:00:00+00:00`,
	};
}

function mockSavedEndpoint( posts: ReturnType< typeof savedPost >[] ) {
	return nock( BASE )
		.get( SAVED_PATH )
		.query( true )
		.reply( 200, { posts, number: posts.length, found: posts.length, date_range: {} } );
}

function renderSavedStream() {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const store = createStore(
		( s = state ) => s,
		state,
		applyMiddleware(
			thunkMiddleware,
			createPostCacheMiddleware( () => queryClient )
		)
	);
	const wrapper = ( { children }: { children: ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>{ children }</Provider>
		</QueryClientProvider>
	);
	render( <SavedPostsStream streamKey="saved" trackScrollPage={ jest.fn() } />, { wrapper } );
	return { wrapper };
}

const originalScrollTo = window.scrollTo;

beforeAll( () => {
	Object.defineProperty( window, 'scrollTo', { writable: true, value: jest.fn() } );
} );

afterAll( () => {
	Object.defineProperty( window, 'scrollTo', { writable: true, value: originalScrollTo } );
} );

afterEach( () => nock.cleanAll() );

describe( 'SavedPostsStream', () => {
	it( 'renders the saved posts under the Saved header', async () => {
		mockSavedEndpoint( [ savedPost( 2 ), savedPost( 1 ) ] );

		renderSavedStream();

		await waitFor( () => expect( screen.getByTestId( 'post-2' ) ).toBeVisible() );
		expect( screen.getByTestId( 'post-1' ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'Saved' } ) ).toBeVisible();
	} );

	it( 'shows the empty state when nothing is saved', async () => {
		mockSavedEndpoint( [] );

		renderSavedStream();

		await waitFor( () => expect( screen.getByText( 'No saved posts yet' ) ).toBeVisible() );
	} );

	it( 'refetches the stream after a post is unsaved, so its card goes away', async () => {
		mockSavedEndpoint( [ savedPost( 2 ), savedPost( 1 ) ] );
		const { wrapper } = renderSavedStream();
		await waitFor( () => expect( screen.getByTestId( 'post-2' ) ).toBeVisible() );

		const unsave = nock( BASE )
			.post( '/wpcom/v2/read/saved/delete', { blog_id: 100, post_id: 2, source: 'reader-web' } )
			.reply( 200, { saved: false, key: { blog_id: 100, post_id: 2 }, total: 1 } );
		const refetch = mockSavedEndpoint( [ savedPost( 1 ) ] );
		const { result } = renderHook( () => useSavePost(), { wrapper } );

		act( () => result.current.unsavePost( savedPost( 2 ) ) );

		await waitFor( () => expect( screen.queryByTestId( 'post-2' ) ).not.toBeInTheDocument() );
		expect( unsave.isDone() ).toBe( true );
		expect( refetch.isDone() ).toBe( true );
		expect( screen.getByTestId( 'post-1' ) ).toBeVisible();
	} );
} );
