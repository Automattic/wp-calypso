/**
 * @jest-environment jsdom
 */
import { readShelvesQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { getShelfPath } from 'calypso/reader/shelves/routes';
import preferences from 'calypso/state/preferences/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ReaderSidebarShelves } from '../index';
import type { ReadShelf } from '@automattic/api-core';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: Object.assign( jest.fn(), { replace: jest.fn() } ),
} ) );

// Drives the "shelf a post was opened from" fallback. Mutable so each test can
// set the route the user navigated from before opening the current post.
let mockPreviousRoute = '';
jest.mock( 'calypso/state/selectors/get-previous-route', () => ( {
	__esModule: true,
	default: () => mockPreviousRoute,
} ) );

// The create modal is backed by the shared upsert modal, which imports the
// Sources tab. Sidebar tests never exercise the sources list, so stub its heavy
// dependencies here.
jest.mock( 'calypso/reader/data/site-subscriptions', () => ( {
	useSiteSubscriptions: () => ( { subscriptions: [], isLoading: false, isError: false } ),
} ) );

// The onboarding walkthrough is lazy-loaded via AsyncLoad. Render it
// synchronously here so the gating behavior can be asserted without awaiting a
// dynamic import.
jest.mock( 'calypso/components/async-load', () => ( {
	__esModule: true,
	default: ( {
		require: _require,
		placeholder: _placeholder,
		...props
	}: Record< string, unknown > ) => {
		const { ShelvesOnboardingModal } = jest.requireActual(
			'calypso/reader/shelves/onboarding-modal'
		);
		return jest.requireActual( 'react' ).createElement( ShelvesOnboardingModal, props );
	},
} ) );

const SHELVES: ReadShelf[] = [
	{
		id: '2f5d8f28-04b7-4f6a-a908-6c4d2b4b8f21',
		slug: 'work',
		name: 'Work',
		layout: { color: 'blue', icon: 'inbox' },
	},
	{
		id: '5cc71d31-97d1-4b7d-93c7-42a5ce9d4cf1',
		slug: 'gaming',
		name: 'Gaming',
		layout: { color: 'purple', icon: 'box' },
	},
];

// Render on a shelf route so the expandable menu starts open and its rows are
// visible (collapsed content is `hidden`, hence not accessible).
const FIRST_SHELF = SHELVES[ 0 ];
const OPEN_PATH = getShelfPath( FIRST_SHELF.slug );

function render( ui: React.ReactElement, initialState?: object ) {
	// Seed the shelves list so `useShelves()` resolves synchronously.
	const queryClient = new QueryClient();
	queryClient.setQueryData( readShelvesQuery().queryKey, [ ...SHELVES ] );
	// Register the preferences slice so the onboarding gate can read it. Without
	// remote values it reads as "not loaded", so the gate falls through to the
	// create form — the behavior the non-onboarding tests below assert.
	return renderWithProvider( ui, {
		queryClient,
		reducers: { preferences },
		initialState,
	} );
}

async function reachCreateStep( user: ReturnType< typeof userEvent.setup > ) {
	await user.type( screen.getByLabelText( 'Name' ), 'Reading' );
	await user.click( screen.getByRole( 'button', { name: 'Next' } ) );
	await user.click( screen.getByRole( 'button', { name: 'Next' } ) );
	await user.click( screen.getByRole( 'button', { name: 'Next' } ) );
	await screen.findByRole( 'button', { name: 'Create' } );
}

describe( 'ReaderSidebarShelves', () => {
	beforeEach( () => {
		jest.mocked( page ).mockClear();
		jest.mocked( page.replace ).mockClear();
		mockPreviousRoute = '';
		window.localStorage.clear();
	} );

	afterEach( () => nock.cleanAll() );

	it( 'renders every shelf with a link to its page', () => {
		render( <ReaderSidebarShelves path={ OPEN_PATH } /> );

		SHELVES.forEach( ( shelf ) => {
			const link = screen.getByRole( 'link', { name: new RegExp( shelf.name ) } );
			expect( link ).toHaveAttribute( 'href', getShelfPath( shelf.slug ) );
		} );
	} );

	it( 'marks the active shelf as selected and tags it with its colour modifier', () => {
		const { container } = render( <ReaderSidebarShelves path={ OPEN_PATH } /> );

		const selected = container.querySelectorAll( 'li.sidebar__menu-item.selected' );
		expect( selected ).toHaveLength( 1 );
		expect( selected[ 0 ].textContent ).toContain( FIRST_SHELF.name );
		// The active row carries the shelf's colour class, which drives the
		// active link colour via the `--shelf-color` custom property.
		expect( selected[ 0 ] ).toHaveClass( `sidebar-shelves__item--${ FIRST_SHELF.layout.color }` );
	} );

	it( 'keeps the originating shelf highlighted while reading a post opened from it', () => {
		// On a post route the URL carries no shelf; the highlight falls back to the
		// previous route (the shelf we came from).
		mockPreviousRoute = OPEN_PATH;
		const { container } = render( <ReaderSidebarShelves path="/reader/feeds/123/posts/456" /> );

		const selected = container.querySelectorAll( 'li.sidebar__menu-item.selected' );
		expect( selected ).toHaveLength( 1 );
		expect( selected[ 0 ].textContent ).toContain( FIRST_SHELF.name );
	} );

	it( 'does not highlight a shelf on a post route not reached from a shelf', () => {
		// Came from Following, opened a post: no shelf should read as active.
		mockPreviousRoute = '/reader';
		const { container } = render( <ReaderSidebarShelves path="/reader/feeds/123/posts/456" /> );

		expect( container.querySelector( 'li.sidebar__menu-item.selected' ) ).toBeNull();
	} );

	it( 'does not crash or falsely select on an unexpected shelf id in the path', () => {
		// A segment that matches no shelf (and isn't URL-safe) must not throw or
		// mark a row active.
		const { container } = render( <ReaderSidebarShelves path="/reader/shelves/%E0%A4%A" /> );

		// Rendered fine, with no row marked active.
		expect( container.querySelector( 'li.sidebar__menu-item.selected' ) ).toBeNull();
	} );

	it( 'opens the create-shelf modal from the "Create a shelf" button', async () => {
		const user = userEvent.setup();
		render( <ReaderSidebarShelves path={ OPEN_PATH } /> );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();

		await user.click( screen.getByRole( 'button', { name: 'Create a shelf' } ) );

		const dialog = await screen.findByRole( 'dialog' );
		expect( dialog ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'Create a new shelf' } ) ).toBeVisible();
	} );

	it( 'shows the onboarding walkthrough on the first "Create a shelf" click', async () => {
		const user = userEvent.setup();
		render( <ReaderSidebarShelves path={ OPEN_PATH } />, { preferences: { remoteValues: {} } } );

		await user.click( screen.getByRole( 'button', { name: 'Create a shelf' } ) );

		// The walkthrough, not the create form.
		expect( await screen.findByRole( 'heading', { name: 'Meet Shelves' } ) ).toBeVisible();
		expect(
			screen.queryByRole( 'heading', { name: 'Create a new shelf' } )
		).not.toBeInTheDocument();
	} );

	it( 'skips the walkthrough and opens the create form once it has been seen', async () => {
		const user = userEvent.setup();
		render( <ReaderSidebarShelves path={ OPEN_PATH } />, {
			preferences: { remoteValues: { has_seen_reader_shelves_onboarding: true } },
		} );

		await user.click( screen.getByRole( 'button', { name: 'Create a shelf' } ) );

		expect( await screen.findByRole( 'heading', { name: 'Create a new shelf' } ) ).toBeVisible();
	} );

	it( 'forces the walkthrough via the localStorage debug key even after it has been seen', async () => {
		const user = userEvent.setup();
		window.localStorage.setItem( 'reader_shelves_onboarding_debug', '1' );
		render( <ReaderSidebarShelves path={ OPEN_PATH } />, {
			preferences: { remoteValues: { has_seen_reader_shelves_onboarding: true } },
		} );

		await user.click( screen.getByRole( 'button', { name: 'Create a shelf' } ) );

		expect( await screen.findByRole( 'heading', { name: 'Meet Shelves' } ) ).toBeVisible();
	} );

	it( 'opens the create form after finishing the walkthrough', async () => {
		const user = userEvent.setup();
		render( <ReaderSidebarShelves path={ OPEN_PATH } />, { preferences: { remoteValues: {} } } );

		await user.click( screen.getByRole( 'button', { name: 'Create a shelf' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Show me how' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Next' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Create a shelf' } ) );

		expect( await screen.findByRole( 'heading', { name: 'Create a new shelf' } ) ).toBeVisible();
	} );

	it( 'marks the walkthrough seen when skipped before the next "Create a shelf" click', async () => {
		const user = userEvent.setup();
		render( <ReaderSidebarShelves path={ OPEN_PATH } />, { preferences: { remoteValues: {} } } );

		await user.click( screen.getByRole( 'button', { name: 'Create a shelf' } ) );
		await user.click( await screen.findByRole( 'button', { name: 'Skip' } ) );

		expect( screen.queryByRole( 'heading', { name: 'Meet Shelves' } ) ).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'heading', { name: 'Create a new shelf' } )
		).not.toBeInTheDocument();

		await user.click( screen.getByRole( 'button', { name: 'Create a shelf' } ) );

		expect( await screen.findByRole( 'heading', { name: 'Create a new shelf' } ) ).toBeVisible();
		expect( screen.queryByRole( 'heading', { name: 'Meet Shelves' } ) ).not.toBeInTheDocument();
	} );

	it( 'expands the section when the Shelves header body is clicked, like the other menus', async () => {
		const user = userEvent.setup();
		render( <ReaderSidebarShelves path="/reader" /> );

		expect( screen.getByRole( 'button', { name: 'Expand menu' } ) ).toBeVisible();

		await user.click( screen.getByText( 'Shelves' ) );

		expect( screen.getByRole( 'button', { name: 'Collapse menu' } ) ).toBeVisible();
	} );

	it( 'redirects to the new shelf after creating it', async () => {
		const user = userEvent.setup();
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/shelves' )
			.reply( 201, {
				id: 7,
				slug: 'reading',
				title: 'Reading',
				follows: [],
				tags: [],
				layout: { color: 'blue', icon: 'inbox' },
			} );
		render( <ReaderSidebarShelves path={ OPEN_PATH } /> );

		await user.click( screen.getByRole( 'button', { name: 'Create a shelf' } ) );
		await reachCreateStep( user );
		await user.click( screen.getByRole( 'button', { name: 'Create' } ) );

		// The redirect happens in the create mutation's onSuccess, after the POST
		// resolves, so wait for it.
		await waitFor( () => expect( page ).toHaveBeenCalledWith( getShelfPath( 'reading' ) ) );
	} );

	it( 'prefetches the feed and detail of a shelf on hover', async () => {
		const user = userEvent.setup();
		const HOVERED = SHELVES[ 1 ]; // Not the active shelf.
		const postsScope = nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/reader/shelves/${ HOVERED.id }/posts` )
			.query( true )
			.reply( 200, { posts: [] } );
		// The view resolves the detail by slug, so hover warms the by-slug detail (the
		// stream stays keyed by id).
		const bySlugScope = nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/reader/shelves/slug/${ HOVERED.slug }` )
			.reply( 200, { ...HOVERED, follows: [], tags: [] } );

		render( <ReaderSidebarShelves path={ OPEN_PATH } /> );

		await user.hover( screen.getByRole( 'link', { name: new RegExp( HOVERED.name ) } ) );

		await waitFor( () => expect( postsScope.isDone() ).toBe( true ) );
		await waitFor( () => expect( bySlugScope.isDone() ).toBe( true ) );
	} );

	it( 'does not prefetch the shelf that is already open', async () => {
		const user = userEvent.setup();
		// Interceptors for the active shelf; they must stay pending (never called).
		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/reader/shelves/${ FIRST_SHELF.id }/posts` )
			.query( true )
			.reply( 200, { posts: [] } );
		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/reader/shelves/slug/${ FIRST_SHELF.slug }` )
			.reply( 200, { ...FIRST_SHELF, follows: [], tags: [] } );

		render( <ReaderSidebarShelves path={ OPEN_PATH } /> );

		await user.hover( screen.getByRole( 'link', { name: new RegExp( FIRST_SHELF.name ) } ) );

		// The guard short-circuits synchronously, so no request goes out.
		expect( nock.pendingMocks() ).toHaveLength( 2 );
	} );

	it( 'does not render the sources modal from the sidebar', () => {
		render( <ReaderSidebarShelves path={ OPEN_PATH } /> );

		expect(
			screen.queryByRole( 'heading', { name: 'Sources for “Work”' } )
		).not.toBeInTheDocument();
	} );
} );
