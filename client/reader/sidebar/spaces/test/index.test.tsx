/**
 * @jest-environment jsdom
 */
import { readSpacesQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { getSpacePath } from 'calypso/reader/spaces/routes';
import preferences from 'calypso/state/preferences/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ReaderSidebarSpaces } from '../index';
import type { ReadSpace } from '@automattic/api-core';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: Object.assign( jest.fn(), { replace: jest.fn() } ),
} ) );

// Drives the "space a post was opened from" fallback. Mutable so each test can
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
		const { SpacesOnboardingModal } = jest.requireActual(
			'calypso/reader/spaces/onboarding-modal'
		);
		return jest.requireActual( 'react' ).createElement( SpacesOnboardingModal, props );
	},
} ) );

const SPACES: ReadSpace[] = [
	{
		id: '2f5d8f28-04b7-4f6a-a908-6c4d2b4b8f21',
		name: 'Work',
		layout: { color: 'blue', icon: 'inbox' },
	},
	{
		id: '5cc71d31-97d1-4b7d-93c7-42a5ce9d4cf1',
		name: 'Gaming',
		layout: { color: 'purple', icon: 'box' },
	},
];

// Render on a space route so the expandable menu starts open and its rows are
// visible (collapsed content is `hidden`, hence not accessible).
const FIRST_SPACE = SPACES[ 0 ];
const OPEN_PATH = getSpacePath( FIRST_SPACE.id );

function render( ui: React.ReactElement, initialState?: object ) {
	// Seed the spaces list so `useSpaces()` resolves synchronously.
	const queryClient = new QueryClient();
	queryClient.setQueryData( readSpacesQuery().queryKey, [ ...SPACES ] );
	// Register the preferences slice so the onboarding gate can read it. Without
	// remote values it reads as "not loaded", so the gate falls through to the
	// create form — the behavior the non-onboarding tests below assert.
	return renderWithProvider( ui, {
		queryClient,
		reducers: { preferences },
		initialState,
	} );
}

describe( 'ReaderSidebarSpaces', () => {
	beforeEach( () => {
		jest.mocked( page ).mockClear();
		jest.mocked( page.replace ).mockClear();
		mockPreviousRoute = '';
		window.localStorage.clear();
	} );

	afterEach( () => nock.cleanAll() );

	it( 'renders every space with a link to its page', () => {
		render( <ReaderSidebarSpaces path={ OPEN_PATH } /> );

		SPACES.forEach( ( space ) => {
			const link = screen.getByRole( 'link', { name: new RegExp( space.name ) } );
			expect( link ).toHaveAttribute( 'href', getSpacePath( space.id ) );
		} );
	} );

	it( 'marks the active space as selected and tags it with its colour modifier', () => {
		const { container } = render( <ReaderSidebarSpaces path={ OPEN_PATH } /> );

		const selected = container.querySelectorAll( 'li.sidebar__menu-item.selected' );
		expect( selected ).toHaveLength( 1 );
		expect( selected[ 0 ].textContent ).toContain( FIRST_SPACE.name );
		// The active row carries the space's colour class, which drives the
		// active link colour via the `--space-color` custom property.
		expect( selected[ 0 ] ).toHaveClass( `sidebar-spaces__item--${ FIRST_SPACE.layout.color }` );
	} );

	it( 'keeps the originating space highlighted while reading a post opened from it', () => {
		// On a post route the URL carries no space; the highlight falls back to the
		// previous route (the space we came from).
		mockPreviousRoute = OPEN_PATH;
		const { container } = render( <ReaderSidebarSpaces path="/reader/feeds/123/posts/456" /> );

		const selected = container.querySelectorAll( 'li.sidebar__menu-item.selected' );
		expect( selected ).toHaveLength( 1 );
		expect( selected[ 0 ].textContent ).toContain( FIRST_SPACE.name );
	} );

	it( 'does not highlight a space on a post route not reached from a space', () => {
		// Came from Following, opened a post: no space should read as active.
		mockPreviousRoute = '/reader';
		const { container } = render( <ReaderSidebarSpaces path="/reader/feeds/123/posts/456" /> );

		expect( container.querySelector( 'li.sidebar__menu-item.selected' ) ).toBeNull();
	} );

	it( 'does not crash or falsely select on an unexpected space id in the path', () => {
		// A segment that matches no space (and isn't URL-safe) must not throw or
		// mark a row active.
		const { container } = render( <ReaderSidebarSpaces path="/reader/spaces/%E0%A4%A" /> );

		// Rendered fine, with no row marked active.
		expect( container.querySelector( 'li.sidebar__menu-item.selected' ) ).toBeNull();
	} );

	it( 'opens the create-space modal from the "Create a space" button', async () => {
		const user = userEvent.setup();
		render( <ReaderSidebarSpaces path={ OPEN_PATH } /> );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();

		await user.click( screen.getByRole( 'button', { name: 'Create a space' } ) );

		const dialog = await screen.findByRole( 'dialog' );
		expect( dialog ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'Create a new space' } ) ).toBeVisible();
	} );

	it( 'shows the onboarding walkthrough on the first "Create a space" click', async () => {
		const user = userEvent.setup();
		render( <ReaderSidebarSpaces path={ OPEN_PATH } />, { preferences: { remoteValues: {} } } );

		await user.click( screen.getByRole( 'button', { name: 'Create a space' } ) );

		// The walkthrough, not the create form.
		expect( await screen.findByRole( 'heading', { name: 'Meet Spaces' } ) ).toBeVisible();
		expect(
			screen.queryByRole( 'heading', { name: 'Create a new space' } )
		).not.toBeInTheDocument();
	} );

	it( 'skips the walkthrough and opens the create form once it has been seen', async () => {
		const user = userEvent.setup();
		render( <ReaderSidebarSpaces path={ OPEN_PATH } />, {
			preferences: { remoteValues: { has_seen_reader_spaces_onboarding: true } },
		} );

		await user.click( screen.getByRole( 'button', { name: 'Create a space' } ) );

		expect( await screen.findByRole( 'heading', { name: 'Create a new space' } ) ).toBeVisible();
	} );

	it( 'forces the walkthrough via the localStorage debug key even after it has been seen', async () => {
		const user = userEvent.setup();
		window.localStorage.setItem( 'reader_spaces_onboarding_debug', '1' );
		render( <ReaderSidebarSpaces path={ OPEN_PATH } />, {
			preferences: { remoteValues: { has_seen_reader_spaces_onboarding: true } },
		} );

		await user.click( screen.getByRole( 'button', { name: 'Create a space' } ) );

		expect( await screen.findByRole( 'heading', { name: 'Meet Spaces' } ) ).toBeVisible();
	} );

	it( 'opens the create form after finishing the walkthrough', async () => {
		const user = userEvent.setup();
		render( <ReaderSidebarSpaces path={ OPEN_PATH } />, { preferences: { remoteValues: {} } } );

		await user.click( screen.getByRole( 'button', { name: 'Create a space' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Show me how' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Next' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Create a space' } ) );

		expect( await screen.findByRole( 'heading', { name: 'Create a new space' } ) ).toBeVisible();
	} );

	it( 'marks the walkthrough seen when skipped before the next "Create a space" click', async () => {
		const user = userEvent.setup();
		render( <ReaderSidebarSpaces path={ OPEN_PATH } />, { preferences: { remoteValues: {} } } );

		await user.click( screen.getByRole( 'button', { name: 'Create a space' } ) );
		await user.click( await screen.findByRole( 'button', { name: 'Skip' } ) );

		expect( screen.queryByRole( 'heading', { name: 'Meet Spaces' } ) ).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'heading', { name: 'Create a new space' } )
		).not.toBeInTheDocument();

		await user.click( screen.getByRole( 'button', { name: 'Create a space' } ) );

		expect( await screen.findByRole( 'heading', { name: 'Create a new space' } ) ).toBeVisible();
		expect( screen.queryByRole( 'heading', { name: 'Meet Spaces' } ) ).not.toBeInTheDocument();
	} );

	it( 'expands the section when the Spaces header body is clicked, like the other menus', async () => {
		const user = userEvent.setup();
		render( <ReaderSidebarSpaces path="/reader" /> );

		expect( screen.getByRole( 'button', { name: 'Expand menu' } ) ).toBeVisible();

		await user.click( screen.getByText( 'Spaces' ) );

		expect( screen.getByRole( 'button', { name: 'Collapse menu' } ) ).toBeVisible();
	} );

	it( 'redirects to the new space after creating it', async () => {
		const user = userEvent.setup();
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/spaces' )
			.reply( 201, {
				id: 7,
				title: 'Reading',
				follows: [],
				tags: [],
				layout: { color: 'blue', icon: 'inbox' },
			} );
		render( <ReaderSidebarSpaces path={ OPEN_PATH } /> );

		await user.click( screen.getByRole( 'button', { name: 'Create a space' } ) );
		await user.type( screen.getByLabelText( 'Name' ), 'Reading' );
		await user.click( screen.getByRole( 'button', { name: 'Create' } ) );

		// The redirect happens in the create mutation's onSuccess, after the POST
		// resolves, so wait for it.
		await waitFor( () =>
			expect( page ).toHaveBeenCalledWith( expect.stringMatching( /^\/reader\/spaces\/[^#]+$/ ) )
		);
	} );

	it( 'prefetches the feed and detail of a space on hover', async () => {
		const user = userEvent.setup();
		const HOVERED = SPACES[ 1 ]; // Not the active space.
		const postsScope = nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/reader/spaces/${ HOVERED.id }/posts` )
			.query( true )
			.reply( 200, { posts: [] } );
		const detailScope = nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/reader/spaces/${ HOVERED.id }` )
			.reply( 200, { ...HOVERED, follows: [], tags: [] } );

		render( <ReaderSidebarSpaces path={ OPEN_PATH } /> );

		await user.hover( screen.getByRole( 'link', { name: new RegExp( HOVERED.name ) } ) );

		await waitFor( () => expect( postsScope.isDone() ).toBe( true ) );
		await waitFor( () => expect( detailScope.isDone() ).toBe( true ) );
	} );

	it( 'does not prefetch the space that is already open', async () => {
		const user = userEvent.setup();
		// Interceptors for the active space; they must stay pending (never called).
		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/reader/spaces/${ FIRST_SPACE.id }/posts` )
			.query( true )
			.reply( 200, { posts: [] } );
		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/reader/spaces/${ FIRST_SPACE.id }` )
			.reply( 200, { ...FIRST_SPACE, follows: [], tags: [] } );

		render( <ReaderSidebarSpaces path={ OPEN_PATH } /> );

		await user.hover( screen.getByRole( 'link', { name: new RegExp( FIRST_SPACE.name ) } ) );

		// The guard short-circuits synchronously, so no request goes out.
		expect( nock.pendingMocks() ).toHaveLength( 2 );
	} );

	it( 'does not render the sources modal from the sidebar', () => {
		render( <ReaderSidebarSpaces path={ OPEN_PATH } /> );

		expect(
			screen.queryByRole( 'heading', { name: 'Sources for “Work”' } )
		).not.toBeInTheDocument();
	} );
} );
