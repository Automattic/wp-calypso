/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import { StreamV2 } from '../index';
import type { ReactNode } from 'react';

// We mock the heavy presentation pieces only; the data flow (React Query +
// hook + Redux dispatches) runs end-to-end so refactors keep their guarantees.
//
// Why these specific mocks survive:
//  • PostLifecycle pulls in the entire post card (QueryReaderPost, Post,
//    blocked / unavailable variants). It's not the unit under test and dragging
//    it in would force us to mock half a dozen unrelated endpoints.
//  • InfiniteList does scroll measurements on a real DOM and renders nothing
//    useful in jsdom — its scroll-trigger pagination is exercised by its own
//    tests. Here we just want to know "did the right item end up selected?".
//  • ReaderMain mutates body classes via DOM access on every mount/unmount and
//    pulls in `<SyncReaderFollows>` (an API queryer). Replacing it with a
//    `<div>` is enough for keyboard-nav assertions.
//  • `@automattic/calypso-router` performs real route changes that trip in
//    jsdom; the router itself is exercised by its own tests.
jest.mock( 'calypso/reader/stream/post-lifecycle', () => {
	const ReactLib = require( 'react' );
	return class PostLifecycle extends ReactLib.Component< {
		postKey: { postId: number };
		isSelected: boolean;
		handleClick: ( args: Record< string, unknown > ) => void;
	} > {
		render() {
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
jest.mock( 'calypso/components/infinite-list', () => {
	const ReactLib = require( 'react' );
	// Mirrors `<InfiniteList>`'s real branching enough for loading-state and
	// rendered-list assertions: when items are empty AND a fetch is in flight,
	// the real list renders `renderLoadingPlaceholders()` instead of
	// `renderItem`. Without this branch the test would never see skeleton
	// markup even when the production path renders it.
	return ReactLib.forwardRef( function InfiniteList(
		props: {
			items: Array< { postId: number } >;
			fetchingNextPage?: boolean;
			renderItem: ( postKey: { postId: number }, idx: number ) => ReactNode;
			renderLoadingPlaceholders?: () => ReactNode;
		},
		_ref: unknown
	) {
		void _ref;
		const { items, fetchingNextPage, renderItem, renderLoadingPlaceholders } = props;
		const showPlaceholders = items.length === 0 && fetchingNextPage;
		return (
			<div data-testid="infinite-list">
				{ showPlaceholders
					? renderLoadingPlaceholders?.()
					: items.map( ( item, idx ) => <div key={ idx }>{ renderItem( item, idx ) }</div> ) }
			</div>
		);
	} );
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

beforeAll( () => {
	Object.defineProperty( window, 'scrollTo', { writable: true, value: jest.fn() } );
} );

afterAll( () => {
	Object.defineProperty( window, 'scrollTo', { writable: true, value: originalScrollTo } );
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

// Minimal initial state shape so the selectors `<StreamV2>` reads can do their
// property access without crashing. None of these slices need to "respond" to
// dispatched actions for the assertions we make, so we don't have to register
// the corresponding reducers.
const baseState = {
	ui: { language: { localeSlug: 'en' }, isNotificationsOpen: false },
	currentUser: { id: 1, user: { ID: 1, primary_blog: null } },
	reader: {
		siteBlocks: { items: {} },
		posts: { items: {} },
	},
	posts: { likes: {} },
};

function renderStream(
	extraProps: Record< string, unknown > = {},
	initialStateOverride = {},
	queryClient = makeQueryClient()
) {
	// Identity reducer over the test fixture: the production store shape is
	// large and combineReducers-driven, so a passthrough keeps the test focused
	// on selectors / hook behavior rather than every reducer's default state.
	// Dispatches that the component / hook fire (`viewStream`, `receivePosts`,
	// etc.) are no-ops here, which is fine — none of our assertions read
	// anything they would change.
	const seedState = { ...baseState, ...initialStateOverride };
	const store = createStore(
		( state = seedState ) => state,
		seedState,
		applyMiddleware( thunkMiddleware )
	);
	const utils = render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>
				<StreamV2 streamKey="likes" trackScrollPage={ jest.fn() } { ...extraProps } />
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

describe( 'StreamV2 — render states', () => {
	it( 'renders skeleton placeholders during the initial fetch', async () => {
		// Stall the response so the component stays in the loading state long
		// enough for us to observe the skeleton markup.
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

	it( 'renders the empty state when the API returns no posts', async () => {
		mockLikesEndpoint( [] );
		const emptyContent = jest.fn( () => <div data-testid="empty">no posts</div> );

		renderStream( { emptyContent } );

		await waitFor( () => expect( screen.getByTestId( 'empty' ) ).toBeVisible() );
		expect( emptyContent ).toHaveBeenCalled();
	} );

	it( 'renders posts once the API responds', async () => {
		mockLikesEndpoint( [ apiPost( 10 ), apiPost( 20 ) ] );
		renderStream();

		await waitFor( () => expect( screen.getByTestId( 'post-10' ) ).toBeVisible() );
		expect( screen.getByTestId( 'post-20' ) ).toBeVisible();
	} );

	it( 'renders the error state when the API fails', async () => {
		nock( BASE ).get( LIKES_PATH ).query( true ).reply( 500, { error: 'kaboom' } );
		renderStream();

		// `<StreamError>` replaces the infinite list when an error lands.
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

describe( 'StreamV2 — keyboard navigation', () => {
	async function setupAndSelectFirst() {
		mockLikesEndpoint( [ apiPost( 10 ), apiPost( 20 ), apiPost( 30 ) ] );
		const utils = renderStream();
		await waitFor( () => expect( utils.getByTestId( 'post-10' ) ).toBeVisible() );
		// Click the first post to seed a selection without depending on the
		// "magic walk" (which needs scroll measurements jsdom can't supply).
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
		fireEvent.keyDown( document, { key: 'j' } ); // post-20
		await waitFor( () => expect( getByTestId( 'post-20' ) ).toHaveClass( 'is-selected' ) );

		fireEvent.keyDown( document, { key: 'k' } );

		await waitFor( () => expect( getByTestId( 'post-10' ) ).toHaveClass( 'is-selected' ) );
	} );

	it( 'ArrowLeft is an alias for k', async () => {
		const { getByTestId } = await setupAndSelectFirst();
		fireEvent.keyDown( document, { key: 'j' } );
		await waitFor( () => expect( getByTestId( 'post-20' ) ).toHaveClass( 'is-selected' ) );

		fireEvent.keyDown( document, { key: 'ArrowLeft' } );

		await waitFor( () => expect( getByTestId( 'post-10' ) ).toHaveClass( 'is-selected' ) );
	} );

	it( 'j at the last item stays put (no wrap-around)', async () => {
		const { getByTestId } = await setupAndSelectFirst();
		fireEvent.keyDown( document, { key: 'j' } ); // post-20
		fireEvent.keyDown( document, { key: 'j' } ); // post-30
		await waitFor( () => expect( getByTestId( 'post-30' ) ).toHaveClass( 'is-selected' ) );

		fireEvent.keyDown( document, { key: 'j' } );

		// Still on post-30.
		expect( getByTestId( 'post-30' ) ).toHaveClass( 'is-selected' );
	} );

	it( 'k at the first item stays put', async () => {
		const { getByTestId } = await setupAndSelectFirst();

		fireEvent.keyDown( document, { key: 'k' } );

		expect( getByTestId( 'post-10' ) ).toHaveClass( 'is-selected' );
	} );

	it( 'ignores keys when modifier is held (cmd/ctrl)', async () => {
		const { getByTestId } = await setupAndSelectFirst();

		fireEvent.keyDown( document, { key: 'j', metaKey: true } );
		fireEvent.keyDown( document, { key: 'j', ctrlKey: true } );

		expect( getByTestId( 'post-10' ) ).toHaveClass( 'is-selected' );
	} );

	it( 'ignores keys typed inside an input', async () => {
		const { getByTestId } = await setupAndSelectFirst();
		const input = document.createElement( 'input' );
		document.body.appendChild( input );

		fireEvent.keyDown( input, { key: 'j' } );

		expect( getByTestId( 'post-10' ) ).toHaveClass( 'is-selected' );
		document.body.removeChild( input );
	} );

	it( 'is suppressed while the notifications panel is open', async () => {
		mockLikesEndpoint( [ apiPost( 10 ), apiPost( 20 ) ] );
		const { getByTestId } = renderStream(
			{},
			{ ui: { language: { localeSlug: 'en' }, isNotificationsOpen: true } }
		);
		await waitFor( () => expect( getByTestId( 'post-10' ) ).toBeVisible() );
		fireEvent.click( getByTestId( 'post-10' ) );
		await waitFor( () => expect( getByTestId( 'post-10' ) ).toHaveClass( 'is-selected' ) );

		fireEvent.keyDown( document, { key: 'j' } );

		expect( getByTestId( 'post-10' ) ).toHaveClass( 'is-selected' );
	} );
} );

describe( 'StreamV2 — click', () => {
	it( 'clicking a post selects it', async () => {
		mockLikesEndpoint( [ apiPost( 10 ), apiPost( 20 ) ] );
		const { getByTestId } = renderStream();
		await waitFor( () => expect( getByTestId( 'post-10' ) ).toBeVisible() );

		fireEvent.click( getByTestId( 'post-20' ) );

		await waitFor( () => expect( getByTestId( 'post-20' ) ).toHaveClass( 'is-selected' ) );
		expect( getByTestId( 'post-10' ) ).not.toHaveClass( 'is-selected' );
	} );

	it( 'restores the selected post after unmount and remount with the same QueryClient', async () => {
		mockLikesEndpoint( [ apiPost( 10 ), apiPost( 20 ) ] );
		const queryClient = makeQueryClient();
		const first = renderStream( {}, {}, queryClient );
		await waitFor( () => expect( first.getByTestId( 'post-10' ) ).toBeVisible() );

		fireEvent.click( first.getByTestId( 'post-20' ) );
		await waitFor( () => expect( first.getByTestId( 'post-20' ) ).toHaveClass( 'is-selected' ) );
		first.unmount();

		const second = renderStream( {}, {}, queryClient );

		expect( second.getByTestId( 'post-20' ) ).toHaveClass( 'is-selected' );
		expect( second.getByTestId( 'post-10' ) ).not.toHaveClass( 'is-selected' );
	} );

	it( 'continues keyboard navigation from the restored selection after remount', async () => {
		mockLikesEndpoint( [ apiPost( 10 ), apiPost( 20 ), apiPost( 30 ) ] );
		const queryClient = makeQueryClient();
		const first = renderStream( {}, {}, queryClient );
		await waitFor( () => expect( first.getByTestId( 'post-10' ) ).toBeVisible() );

		fireEvent.click( first.getByTestId( 'post-20' ) );
		await waitFor( () => expect( first.getByTestId( 'post-20' ) ).toHaveClass( 'is-selected' ) );
		first.unmount();

		const second = renderStream( {}, {}, queryClient );
		expect( second.getByTestId( 'post-20' ) ).toHaveClass( 'is-selected' );

		fireEvent.keyDown( document, { key: 'j' } );

		await waitFor( () => expect( second.getByTestId( 'post-30' ) ).toHaveClass( 'is-selected' ) );
		expect( second.getByTestId( 'post-20' ) ).not.toHaveClass( 'is-selected' );
	} );
} );
