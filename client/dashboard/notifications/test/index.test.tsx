/**
 * @vitest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AnalyticsProvider } from '../../app/analytics';
import { AuthContext } from '../../app/auth';
import { APP_CONTEXT_DEFAULT_CONFIG, AppProvider } from '../../app/context';
import { createNotificationsRoutes } from '../../app/router/notifications';
import { rootRoute } from '../../app/router/root';
import type { User } from '@automattic/api-core';
import type { ReactNode } from 'react';

type InboxProps = {
	filterName: string;
	selectedNoteId: string | undefined;
	setSelectedNoteId: ( noteId: string | undefined ) => void;
	renderLayout: ( panes: { list: ReactNode; detail: ReactNode } ) => ReactNode;
};

// The inbox starts a notifications client that polls the API and opens a websocket.
vi.mock( '@automattic/notifications/src/inbox', () => ( {
	default: ( { filterName, selectedNoteId, setSelectedNoteId, renderLayout }: InboxProps ) =>
		renderLayout( {
			list: (
				<button onClick={ () => setSelectedNoteId( selectedNoteId === '42' ? '43' : '42' ) }>
					{ `Open a note from ${ filterName }` }
				</button>
			),
			detail: selectedNoteId && (
				<button onClick={ () => setSelectedNoteId( undefined ) }>
					{ `Close note ${ selectedNoteId }` }
				</button>
			),
		} ),
} ) );

function renderNotifications( initialPath: string ) {
	const router = createRouter( {
		routeTree: rootRoute.addChildren( createNotificationsRoutes() ),
		history: createMemoryHistory( { initialEntries: [ initialPath ] } ),
		context: { config: APP_CONTEXT_DEFAULT_CONFIG },
	} );

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
	test( 'shows every notification by default', async () => {
		renderNotifications( '/notifications' );

		expect( await screen.findByRole( 'heading', { name: 'Notifications' } ) ).toBeVisible();
		expect( await screen.findByRole( 'tab', { name: 'All', selected: true } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Open a note from all' } ) ).toBeVisible();
	} );

	test( 'has no "Mark all as read" button', async () => {
		renderNotifications( '/notifications' );

		await screen.findByRole( 'tab', { name: 'All', selected: true } );
		expect( screen.queryByRole( 'button', { name: 'Mark all as read' } ) ).not.toBeInTheDocument();
	} );

	test( 'keeps the Unread tab in the address', async () => {
		const user = userEvent.setup();
		const router = renderNotifications( '/notifications' );

		await user.click( await screen.findByRole( 'tab', { name: 'Unread' } ) );

		expect( await screen.findByRole( 'tab', { name: 'Unread', selected: true } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Open a note from unread' } ) ).toBeVisible();
		expect( router.state.location.href ).toBe( '/notifications?filter=unread' );
	} );

	test( 'opens on the Unread tab from an address that asks for it', async () => {
		renderNotifications( '/notifications?filter=unread' );

		expect( await screen.findByRole( 'tab', { name: 'Unread', selected: true } ) ).toBeVisible();
	} );

	test( 'opens a note at its own address and keeps the tab', async () => {
		const user = userEvent.setup();
		const router = renderNotifications( '/notifications?filter=unread' );

		await user.click( await screen.findByRole( 'button', { name: 'Open a note from unread' } ) );

		expect( await screen.findByRole( 'button', { name: 'Close note 42' } ) ).toBeVisible();
		expect( router.state.location.href ).toBe( '/notifications/42?filter=unread' );
	} );

	test( 'shows the note an address links to', async () => {
		renderNotifications( '/notifications/42' );

		expect( await screen.findByRole( 'button', { name: 'Close note 42' } ) ).toBeVisible();
	} );

	test( 'goes back to the list in one step after moving between notes', async () => {
		const user = userEvent.setup();
		const router = renderNotifications( '/notifications' );

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
		const router = renderNotifications( '/notifications/42' );

		await user.click( await screen.findByRole( 'button', { name: 'Close note 42' } ) );

		await waitFor( () => expect( router.state.location.href ).toBe( '/notifications' ) );
		expect( screen.queryByRole( 'button', { name: /Close note/ } ) ).not.toBeInTheDocument();
	} );
} );
