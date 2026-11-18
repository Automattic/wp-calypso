/**
 * @vitest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, type Mock } from 'vitest';
import { AnalyticsProvider } from '../../app/analytics';
import { AuthContext } from '../../app/auth';
import { APP_CONTEXT_DEFAULT_CONFIG, AppProvider } from '../../app/context';
import { createNotificationsRoutes } from '../../app/router/notifications';
import { rootRoute } from '../../app/router/root';
import type { User } from '@automattic/api-core';
import type { ReactNode } from 'react';

type InboxProps = {
	filterName: string | undefined;
	setFilterName: ( filterName: string ) => void;
	selectedNoteId: string | undefined;
	setSelectedNoteId: ( noteId: string | undefined ) => void;
	renderLayout: ( panes: { list: ReactNode; detail: ReactNode } ) => ReactNode;
};

// The inbox starts a notifications client that polls the API and opens a websocket.
// Like the real one, it closes the open note when the tab changes.
vi.mock( '@automattic/notifications/src/inbox', () => ( {
	default: ( {
		filterName = 'all',
		setFilterName,
		selectedNoteId,
		setSelectedNoteId,
		renderLayout,
	}: InboxProps ) =>
		renderLayout( {
			list: (
				<>
					{ [ 'all', 'unread', 'comments' ].map( ( name ) => (
						<button
							key={ name }
							onClick={ () => {
								setFilterName( name );
								setSelectedNoteId( undefined );
							} }
						>
							{ `Show ${ name }` }
						</button>
					) ) }
					<button onClick={ () => setSelectedNoteId( selectedNoteId === '42' ? '43' : '42' ) }>
						{ `Open a note from ${ filterName }` }
					</button>
				</>
			),
			detail: selectedNoteId && selectedNoteId !== '999' && (
				<button onClick={ () => setSelectedNoteId( undefined ) }>
					{ `Close note ${ selectedNoteId }` }
				</button>
			),
		} ),
} ) );

/**
 * The shared test setup stubs matchMedia to never match, which this page reads as a wide screen.
 * `useMediaQuery` caches each MediaQueryList, so a narrow screen is set on the lists already handed out.
 */
const mediaQueryLists: { matches: boolean }[] = [];
let isNarrowScreen = false;

function trackMediaQueryLists() {
	const matchMedia = ( window.matchMedia as Mock ).getMockImplementation();
	( window.matchMedia as Mock ).mockImplementation( ( query: string ) => {
		const mediaQueryList = matchMedia?.( query );
		mediaQueryList.matches = isNarrowScreen;
		mediaQueryLists.push( mediaQueryList );
		return mediaQueryList;
	} );
}

function setNarrowScreen( isNarrow: boolean ) {
	isNarrowScreen = isNarrow;
	mediaQueryLists.forEach( ( mediaQueryList ) => {
		mediaQueryList.matches = isNarrow;
	} );
}

async function renderNotifications( initialPath: string ) {
	const router = createRouter( {
		routeTree: rootRoute.addChildren( createNotificationsRoutes() ),
		history: createMemoryHistory( { initialEntries: [ initialPath ] } ),
		context: { config: APP_CONTEXT_DEFAULT_CONFIG },
	} );

	// The route loads the page lazily. Load it first, so no test spends its wait on the import.
	await router.load();

	render(
		<QueryClientProvider client={ new QueryClient() }>
			<AppProvider config={ APP_CONTEXT_DEFAULT_CONFIG }>
				<AnalyticsProvider client={ { recordTracksEvent: vi.fn(), recordPageView: vi.fn() } }>
					<AuthContext.Provider value={ { user: { ID: 1 } as User, logout: vi.fn() } }>
						<RouterProvider router={ router } />
					</AuthContext.Provider>
				</AnalyticsProvider>
			</AppProvider>
		</QueryClientProvider>
	);

	return router;
}

describe( '<Notifications>', () => {
	beforeAll( trackMediaQueryLists );

	afterEach( () => setNarrowScreen( false ) );

	test( 'shows every notification by default', async () => {
		await renderNotifications( '/notifications' );

		expect( await screen.findByRole( 'button', { name: 'Open a note from all' } ) ).toBeVisible();
	} );

	test( 'leaves the heading to the list, with no page header of its own', async () => {
		await renderNotifications( '/notifications' );

		await screen.findByRole( 'button', { name: 'Open a note from all' } );
		expect( screen.queryByRole( 'heading', { name: 'Notifications' } ) ).not.toBeInTheDocument();
	} );

	test( 'keeps the chosen tab in the address', async () => {
		const user = userEvent.setup();
		const router = await renderNotifications( '/notifications' );

		await user.click( await screen.findByRole( 'button', { name: 'Show comments' } ) );

		expect(
			await screen.findByRole( 'button', { name: 'Open a note from comments' } )
		).toBeVisible();
		expect( router.state.location.href ).toBe( '/notifications?filter=comments' );
	} );

	test( 'drops the tab from the address when going back to every notification', async () => {
		const user = userEvent.setup();
		const router = await renderNotifications( '/notifications?filter=unread' );

		await user.click( await screen.findByRole( 'button', { name: 'Show all' } ) );

		expect( await screen.findByRole( 'button', { name: 'Open a note from all' } ) ).toBeVisible();
		expect( router.state.location.href ).toBe( '/notifications' );
	} );

	test( 'opens on the tab an address asks for', async () => {
		await renderNotifications( '/notifications?filter=comments' );

		expect(
			await screen.findByRole( 'button', { name: 'Open a note from comments' } )
		).toBeVisible();
	} );

	test( 'closes the open note and keeps the new tab when the tab changes', async () => {
		const user = userEvent.setup();
		const router = await renderNotifications( '/notifications/42' );

		await user.click( await screen.findByRole( 'button', { name: 'Show comments' } ) );

		await waitFor( () =>
			expect( router.state.location.href ).toBe( '/notifications?filter=comments' )
		);
		expect( screen.queryByRole( 'button', { name: /Close note/ } ) ).not.toBeInTheDocument();
	} );

	test( 'opens a note at its own address and keeps the tab', async () => {
		const user = userEvent.setup();
		const router = await renderNotifications( '/notifications?filter=unread' );

		await user.click( await screen.findByRole( 'button', { name: 'Open a note from unread' } ) );

		expect( await screen.findByRole( 'button', { name: 'Close note 42' } ) ).toBeVisible();
		expect( router.state.location.href ).toBe( '/notifications/42?filter=unread' );
	} );

	test( 'shows the note an address links to', async () => {
		await renderNotifications( '/notifications/42' );

		expect( await screen.findByRole( 'button', { name: 'Close note 42' } ) ).toBeVisible();
	} );

	test( 'says that no notification is selected until one is opened', async () => {
		const user = userEvent.setup();
		await renderNotifications( '/notifications' );

		expect(
			await screen.findByRole( 'heading', { name: 'No notification selected' } )
		).toBeVisible();

		await user.click( screen.getByRole( 'button', { name: 'Open a note from all' } ) );

		await screen.findByRole( 'button', { name: 'Close note 42' } );
		expect(
			screen.queryByRole( 'heading', { name: 'No notification selected' } )
		).not.toBeInTheDocument();
	} );

	test( 'does not say that no notification is selected while a linked note loads', async () => {
		await renderNotifications( '/notifications/999' );

		await screen.findByRole( 'button', { name: 'Open a note from all' } );
		expect(
			screen.queryByRole( 'heading', { name: 'No notification selected' } )
		).not.toBeInTheDocument();
	} );

	test( 'shows only the list on a narrow screen with no notification open', async () => {
		setNarrowScreen( true );
		await renderNotifications( '/notifications' );

		expect( await screen.findByRole( 'button', { name: 'Open a note from all' } ) ).toBeVisible();
		expect(
			screen.queryByRole( 'heading', { name: 'No notification selected' } )
		).not.toBeInTheDocument();
	} );

	test( 'goes back to the list in one step after moving between notes', async () => {
		const user = userEvent.setup();
		const router = await renderNotifications( '/notifications' );

		await user.click( await screen.findByRole( 'button', { name: 'Open a note from all' } ) );
		await screen.findByRole( 'button', { name: 'Close note 42' } );
		await user.click( screen.getByRole( 'button', { name: 'Open a note from all' } ) );
		await screen.findByRole( 'button', { name: 'Close note 43' } );

		router.history.back();

		await waitFor( () => expect( router.state.location.href ).toBe( '/notifications' ) );
		expect( screen.queryByRole( 'button', { name: /Close note/ } ) ).not.toBeInTheDocument();
	} );

	test( 'returns to the list address when the note closes', async () => {
		const user = userEvent.setup();
		const router = await renderNotifications( '/notifications/42' );

		await user.click( await screen.findByRole( 'button', { name: 'Close note 42' } ) );

		await waitFor( () => expect( router.state.location.href ).toBe( '/notifications' ) );
		expect( screen.queryByRole( 'button', { name: /Close note/ } ) ).not.toBeInTheDocument();
	} );
} );
