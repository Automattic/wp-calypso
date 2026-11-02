/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import { createPostCacheMiddleware } from 'calypso/reader/data/post/middleware';
import { INITIAL_FETCH } from 'calypso/reader/data/stream';
import SavedPostsStream from '../main';
import type { ReactNode } from 'react';

jest.mock(
	'calypso/reader/components/reader-main',
	() =>
		function ReaderMain( { children }: { children: ReactNode } ) {
			return <div>{ children }</div>;
		}
);
jest.mock( 'calypso/lib/with-dimensions', () => ( Component: React.ComponentType ) => Component );
jest.mock( 'calypso/components/infinite-list', () => {
	const { forwardRef, useImperativeHandle, useRef } = jest.requireActual( 'react' );
	return forwardRef( function InfiniteList(
		{
			items,
			renderItem,
		}: {
			items: unknown[];
			renderItem: ( item: unknown, idx: number ) => ReactNode;
		},
		ref: React.Ref< unknown >
	) {
		const node = useRef( null );
		const itemsRef = useRef( items );
		itemsRef.current = items;
		useImperativeHandle(
			ref,
			() => ( {
				getDOMNode: () => node.current,
				getVisibleItemIndexes: () =>
					itemsRef.current.map( ( _item: unknown, index: number ) => ( {
						index,
						bounds: { top: 1 + index },
					} ) ),
			} ),
			[]
		);
		return <div ref={ node }>{ items.map( ( item, idx ) => renderItem( item, idx ) ) }</div>;
	} );
} );
jest.mock( '@automattic/calypso-router', () => {
	const fn = jest.fn() as jest.Mock & { replace: jest.Mock; show: jest.Mock };
	fn.replace = jest.fn();
	fn.show = jest.fn();
	return { __esModule: true, default: fn };
} );

const BASE = 'https://public-api.wordpress.com';
const SAVED_PATH = '/rest/v1.2/read/saved';
const SOURCE = 'reader-web';

const state = {
	ui: { language: { localeSlug: 'en' }, isNotificationsOpen: false },
	documentHead: { unreadCount: 0 },
	currentUser: { id: 1, user: { ID: 1, primary_blog: null } },
	readerUi: { sidebar: { selectedRecentSite: null }, cardExpansions: {} },
	reader: {
		feeds: { items: {} },
		siteBlocks: { items: {} },
		sites: { items: {} },
		posts: { items: {} },
		streams: {},
	},
};

// What `/read/saved` returns for a page saved from the Chrome extension: its
// `ID` is the save's row ID, and there's no site, feed or feed item.
const URL_SAVE = {
	ID: 64089,
	site_ID: 0,
	feed_ID: 0,
	is_external: true,
	global_ID: 'url-save-64089',
	URL: 'https://harvardlawreview.org/blog/2026/09/a-case-for-limited-first-amendment-protections-for-ai-outputs',
	title: 'A Case for Limited First Amendment Protections for AI Outputs',
	excerpt: 'Why AI outputs deserve only limited protection.',
	featured_image: 'https://i0.wp.com/harvardlawreview.org/logo.png',
	site_name: 'Harvard Law Review',
	site_URL: '',
	author: { name: 'Harvard Law Review' },
	date: '',
	date_saved: '2026-10-30T12:00:00+00:00',
};

// A feed item Feedbag has since deleted: same shape, keyed by its feed item ID.
// Its `ID` matches the URL save's on purpose, so the two must not collide.
const PRUNED_FEED_ITEM = {
	ID: 64089,
	feed_item_ID: 64089,
	site_ID: 0,
	feed_ID: 0,
	is_external: true,
	global_ID: 'feed-item-64089',
	URL: 'https://example.com/blog/a-deleted-post',
	title: 'A deleted feed post',
	excerpt: 'This post is gone from the feed.',
	site_name: 'Example Blog',
	site_URL: 'https://example.com',
	author: { name: 'Jane Writer' },
	date: '2026-09-01T00:00:00+00:00',
	date_saved: '2026-10-29T12:00:00+00:00',
};

// A YouTube video saved by URL, with the page's details as the extension read them.
const YOUTUBE_SAVE = {
	...URL_SAVE,
	ID: 64090,
	global_ID: 'url-save-64090',
	URL: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
	title: 'A saved video',
	excerpt: 'A video worth watching later.',
	featured_image: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
	site_name: 'YouTube',
};

const SAVED_KEYS = {
	keys: [
		{ url: URL_SAVE.URL, id: 2, date_saved: URL_SAVE.date_saved },
		{ url: YOUTUBE_SAVE.URL, id: 3, date_saved: YOUTUBE_SAVE.date_saved },
		{
			feed_item_id: 64089,
			url: PRUNED_FEED_ITEM.URL,
			id: 1,
			date_saved: PRUNED_FEED_ITEM.date_saved,
		},
	],
	total: 3,
};

function mockSavedEndpoint( posts: object[] ) {
	return nock( BASE )
		.get( SAVED_PATH )
		.query( ( query ) => query.number === String( INITIAL_FETCH ) )
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
	render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>
				<SavedPostsStream streamKey="saved" trackScrollPage={ jest.fn() } />
			</Provider>
		</QueryClientProvider>
	);
}

/**
 * Renders the Saved stream with these posts and resolves with the title link
 * of the first one once its card is on screen.
 */
function renderSnapshots( posts: Array< { title: string } > ) {
	mockSavedEndpoint( posts );
	renderSavedStream();
	return screen.findByRole( 'link', { name: posts[ 0 ].title } );
}

const getCard = ( title: string ) =>
	screen.getByRole( 'link', { name: title } ).closest( 'article' ) as HTMLElement;

async function getEnabledSaveButton( title: string ) {
	const saveButton = getCard( title ).querySelector( '.reader-save-button' ) as HTMLElement;
	await waitFor( () => expect( saveButton ).not.toBeDisabled() );
	return saveButton;
}

/**
 * Selects the first card with `j` and resolves once its title link has focus.
 */
async function selectFirstCard( user: ReturnType< typeof userEvent.setup >, title: HTMLElement ) {
	await user.keyboard( 'j' );
	await waitFor( () => expect( title ).toHaveFocus() );
}

const unmatchedPaths: string[] = [];
const recordUnmatched = ( request: { path: string } ) => unmatchedPaths.push( request.path );
const originalScrollTo = window.scrollTo;
let windowOpen: jest.SpyInstance;

beforeAll( () => {
	Object.defineProperty( window, 'scrollTo', { writable: true, value: jest.fn() } );
} );

afterAll( () => {
	Object.defineProperty( window, 'scrollTo', { writable: true, value: originalScrollTo } );
} );

beforeEach( () => {
	unmatchedPaths.length = 0;
	nock.emitter.on( 'no match', recordUnmatched );
	windowOpen = jest.spyOn( window, 'open' ).mockImplementation( () => null );
	nock( BASE ).get( '/wpcom/v2/read/saved/keys' ).query( true ).reply( 200, SAVED_KEYS ).persist();
} );

afterEach( () => {
	nock.emitter.removeListener( 'no match', recordUnmatched );
	windowOpen.mockRestore();
	nock.cleanAll();
} );

describe( 'SavedPostsStream with saved snapshots', () => {
	it( 'renders a URL save and a deleted feed item from the stream data', async () => {
		await renderSnapshots( [ URL_SAVE, PRUNED_FEED_ITEM ] );

		const urlCard = getCard( URL_SAVE.title );
		expect( urlCard ).toHaveTextContent( URL_SAVE.excerpt );
		expect( urlCard ).toHaveTextContent( 'Harvard Law Review·Saved Oct 30, 2026' );
		// No site URL, so the site name isn't a link.
		expect( screen.queryByRole( 'link', { name: URL_SAVE.site_name } ) ).not.toBeInTheDocument();

		const prunedCard = getCard( PRUNED_FEED_ITEM.title );
		expect( prunedCard ).toHaveTextContent( 'Jane Writer·Saved Oct 29, 2026' );
		expect( screen.getByRole( 'link', { name: 'Example Blog' } ) ).toHaveAttribute(
			'href',
			'https://example.com'
		);

		expect( screen.queryByTestId( 'post-placeholder' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: /like/i } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: /comment/i } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: /reblog/i } ) ).not.toBeInTheDocument();
		expect( unmatchedPaths.filter( ( path ) => /\/read\/(feed|sites)\//.test( path ) ) ).toEqual(
			[]
		);
	} );

	it( 'shows a save as saved before the saved keys include it', async () => {
		nock.cleanAll();
		nock( BASE )
			.get( '/wpcom/v2/read/saved/keys' )
			.query( true )
			.reply( 200, { keys: [], total: 0 } );

		await renderSnapshots( [ URL_SAVE, PRUNED_FEED_ITEM ] );

		for ( const { title } of [ URL_SAVE, PRUNED_FEED_ITEM ] ) {
			expect(
				await within( getCard( title ) ).findByRole( 'button', { name: 'Saved' } )
			).toBeVisible();
		}
	} );

	it( 'opens the saved page in a new tab when the card is clicked', async () => {
		const title = await renderSnapshots( [ URL_SAVE ] );
		expect( title ).toHaveAttribute( 'href', URL_SAVE.URL );
		expect( title ).toHaveAttribute( 'target', '_blank' );

		await userEvent.setup().click( screen.getByText( URL_SAVE.excerpt ) );

		expect( windowOpen ).toHaveBeenCalledWith( URL_SAVE.URL, '_blank', 'noopener,noreferrer' );
	} );

	it( 'plays a saved YouTube video in the card', async () => {
		await renderSnapshots( [ YOUTUBE_SAVE, URL_SAVE ] );
		const card = getCard( YOUTUBE_SAVE.title );
		const play = await within( card ).findByRole( 'link', { name: 'Play button' } );
		expect( card.querySelector( '.saved-snapshot-card__image' ) ).toBeNull();
		expect(
			getCard( URL_SAVE.title ).querySelector( '.saved-snapshot-card__image' )
		).toBeVisible();

		await userEvent.setup().click( play );

		const player = card.querySelector( 'iframe' );
		expect( player ).toHaveAttribute(
			'src',
			'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1'
		);
		expect( player ).toHaveAttribute( 'title', YOUTUBE_SAVE.title );
		expect( windowOpen ).not.toHaveBeenCalled();
	} );

	it( 'shows a YouTube link without a well-formed video ID as a page', async () => {
		const badId = { ...YOUTUBE_SAVE, URL: 'https://www.youtube.com/watch?v=x%22%3E%3Cb%3E' };
		await renderSnapshots( [ badId ] );
		const card = getCard( badId.title );

		expect( within( card ).queryByRole( 'link', { name: 'Play button' } ) ).toBeNull();
		expect( card.querySelector( '.saved-snapshot-card__image' ) ).toBeVisible();
	} );

	it( 'opens a selected snapshot once when Enter is pressed', async () => {
		const title = await renderSnapshots( [ URL_SAVE ] );
		const user = userEvent.setup();
		await selectFirstCard( user, title );
		const titleClick = jest.fn();
		title.addEventListener( 'click', titleClick );

		await user.keyboard( '{Enter}' );

		expect( windowOpen ).toHaveBeenCalledTimes( 1 );
		expect( windowOpen ).toHaveBeenCalledWith( URL_SAVE.URL, '_blank', 'noopener,noreferrer' );
		expect( titleClick ).not.toHaveBeenCalled();
	} );

	it( 'leaves Enter to a focused Save button on a selected snapshot', async () => {
		const title = await renderSnapshots( [ URL_SAVE ] );
		const user = userEvent.setup();
		await selectFirstCard( user, title );
		const saveButton = await getEnabledSaveButton( URL_SAVE.title );
		const unsave = nock( BASE )
			.post( '/wpcom/v2/read/saved/delete', { url: URL_SAVE.URL, source: SOURCE } )
			.reply( 200, { saved: false, key: { url: URL_SAVE.URL }, total: 0 } );
		mockSavedEndpoint( [] );
		saveButton.focus();

		await user.keyboard( '{Enter}' );

		await waitFor( () => expect( unsave.isDone() ).toBe( true ) );
		expect( windowOpen ).not.toHaveBeenCalled();
	} );

	it.each( [
		{ kind: 'URL save', post: URL_SAVE, body: { url: URL_SAVE.URL } },
		{ kind: 'deleted feed item', post: PRUNED_FEED_ITEM, body: { feed_item_id: 64089 } },
	] )( 'unsaves a $kind by its saved key', async ( { post, body } ) => {
		await renderSnapshots( [ URL_SAVE, PRUNED_FEED_ITEM ] );
		const saveButton = await getEnabledSaveButton( post.title );
		const unsave = nock( BASE )
			.post( '/wpcom/v2/read/saved/delete', { ...body, source: SOURCE } )
			.reply( 200, { saved: false, key: body, total: 1 } );
		const refetch = mockSavedEndpoint(
			[ URL_SAVE, PRUNED_FEED_ITEM ].filter( ( saved ) => saved !== post )
		);

		await userEvent.setup().click( saveButton );

		await waitFor( () =>
			expect( screen.queryByRole( 'link', { name: post.title } ) ).not.toBeInTheDocument()
		);
		expect( unsave.isDone() ).toBe( true );
		expect( refetch.isDone() ).toBe( true );
		expect( windowOpen ).not.toHaveBeenCalled();
	} );
} );
