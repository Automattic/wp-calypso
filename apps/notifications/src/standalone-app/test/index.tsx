import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import type { Root } from 'react-dom/client';

type HostMessage = { action: string; showing?: boolean };
type TracksWindow = Window & { _tkq: unknown[][] };

const host = vi.hoisted( () => ( {
	send: ( () => {} ) as ( message: HostMessage ) => void,
	received: [] as string[],
	roots: [] as Root[],
	me: Promise.resolve( { ID: 1, username: 'example' } ),
} ) );

vi.mock( 'react-dom/client', async ( importOriginal ) => {
	const client = await importOriginal< typeof import( 'react-dom/client' ) >();
	return {
		...client,
		createRoot: ( ...args: Parameters< typeof client.createRoot > ) => {
			const root = client.createRoot( ...args );
			host.roots.push( root );
			return root;
		},
	};
} );

vi.mock( '../../standalone/client', () => ( {
	createClient: async () => ( { req: { get: () => host.me } } ),
} ) );
vi.mock( '../../standalone/messaging', () => ( {
	receiveMessage: ( receiver: ( message: HostMessage ) => void ) => {
		host.send = receiver;
		return () => {};
	},
	sendMessage: ( message: HostMessage ) => host.received.push( message.action ),
} ) );
vi.mock( '../../panel/rest-client', () => ( {
	default: vi.fn( function () {
		return {
			getNote: vi.fn(),
			hasMoreNotes: () => false,
			loadMore: vi.fn(),
			refreshNotes: vi.fn(),
			setFilter: vi.fn(),
			setLocale: vi.fn(),
			setVisibility: vi.fn(),
		};
	} ),
} ) );
vi.mock( '../../panel/rest-client/wpcom', () => ( {
	init: vi.fn(),
	markReadStatus: vi.fn(),
	markPostAsSeen: vi.fn(),
} ) );

// Booting a fresh copy of the whole app can take seconds while the rest of the suite runs alongside.
const BOOT_WAIT = { timeout: 15000 };
const TEST_TIMEOUT = 30000;

const tracksQueue = () => {
	const tracksWindow = window as unknown as TracksWindow;
	tracksWindow._tkq = tracksWindow._tkq ?? [];
	return tracksWindow._tkq;
};

const recordedEvents = ( name: string ) =>
	tracksQueue()
		.filter( ( [ command, event ] ) => command === 'recordEvent' && event === name )
		.map( ( [ , , properties ] ) => properties );

// Boots the iframe app with the given `features` in its address, as the host page loads it, and opens the panel.
// The current user loads once `me` resolves, which is at once unless a test holds it back.
const openPanel = async (
	features: string,
	me: Promise< { ID: number; username: string } > = Promise.resolve( {
		ID: 1,
		username: 'example',
	} )
) => {
	vi.resetModules();
	host.received = [];
	host.me = me;
	tracksQueue().length = 0;
	window.history.replaceState( {}, '', `/?features=${ features }` );
	document.body.innerHTML = '<div class="wpnc__main"></div>';

	const { store } = await import( '../../panel/state' );
	const { default: actions } = await import( '../../panel/state/actions' );
	store.dispatch(
		actions.notes.addNotes( [
			{
				id: 801,
				type: 'comment',
				read: 1,
				noticon: '',
				timestamp: '2026-06-01T00:00:00+00:00',
				title: 'First comment title',
				subject: [ { text: 'First comment', ranges: [], media: [] } ],
				body: [],
			},
		] )
	);
	store.dispatch( actions.ui.loadedNotes() );

	await act( () => import( '../index' ) );
	await waitFor( () => expect( host.received ).toContain( 'iFrameReady' ), BOOT_WAIT );
	act( () => host.send( { action: 'togglePanel', showing: true } ) );
	await screen.findByRole( 'button', { name: 'First comment' }, BOOT_WAIT );
};

// Opens the note from the list and returns the pane it opens in.
const openNote = async ( user: ReturnType< typeof userEvent.setup > ) => {
	await user.click( await screen.findByRole( 'button', { name: 'First comment' } ) );
	const heading = await screen.findByRole( 'heading', { name: 'First comment title' } );
	return within( heading.closest( '.wpnc-app__detail-pane' ) as HTMLElement );
};

describe( 'Notifications iframe app', () => {
	beforeAll( () => {
		Element.prototype.scrollIntoView = () => {};
	} );

	beforeEach( () => {
		vi.spyOn( window, 'open' ).mockImplementation( () => null );
	} );

	afterEach( () => {
		// Each test boots a fresh copy of the app, so unmount the last one to drop its document listeners.
		act( () => host.roots.splice( 0 ).forEach( ( root ) => root.unmount() ) );
		vi.restoreAllMocks();
	} );

	it(
		'opens the full page on the current tab, in a new browser tab and with the panel left open, when the host turns the full view on',
		async () => {
			const user = userEvent.setup();
			await openPanel( 'view-settings,full-view' );

			await user.click( await screen.findByRole( 'button', { name: 'Open full view' } ) );
			expect( window.open ).toHaveBeenLastCalledWith(
				'https://my.wordpress.com/notifications',
				'_blank',
				'noopener'
			);
			expect( host.received ).not.toContain( 'togglePanel' );

			await user.click( screen.getByRole( 'tab', { name: 'Unread' } ) );
			await user.click( screen.getByRole( 'button', { name: 'Open full view' } ) );
			expect( window.open ).toHaveBeenLastCalledWith(
				'https://my.wordpress.com/notifications?filter=unread',
				'_blank',
				'noopener'
			);
			expect( host.received ).not.toContain( 'togglePanel' );
		},
		TEST_TIMEOUT
	);

	it(
		'hands the open note to the full page and leaves the panel open',
		async () => {
			const user = userEvent.setup();
			await openPanel( 'view-settings,full-view' );

			const note = await openNote( user );
			await user.click( note.getByRole( 'button', { name: 'Open full view' } ) );

			expect( window.open ).toHaveBeenLastCalledWith(
				'https://my.wordpress.com/notifications?note=801',
				'_blank',
				'noopener'
			);
			expect( host.received ).not.toContain( 'togglePanel' );
		},
		TEST_TIMEOUT
	);

	it(
		'records each opening of the panel once Tracks knows the user, and names the wpcom panel in every event',
		async () => {
			const user = userEvent.setup();
			let loadUser = () => {};
			await openPanel(
				'view-settings,full-view',
				new Promise( ( resolve ) => {
					loadUser = () => resolve( { ID: 1, username: 'example' } );
				} )
			);

			expect( recordedEvents( 'calypso_notification_open' ) ).toEqual( [] );
			loadUser();
			await waitFor( () =>
				expect( recordedEvents( 'calypso_notification_open' ) ).toEqual( [
					{ surface: 'wpcom_panel' },
				] )
			);
			expect( tracksQueue()[ 0 ] ).toEqual( [ 'identifyUser', 1, 'example' ] );

			await user.click( await screen.findByRole( 'button', { name: 'Open full view' } ) );
			expect( recordedEvents( 'calypso_notification_full_view_click' ) ).toEqual( [
				{ surface: 'wpcom_panel', tab: 'all', is_note_open: false },
			] );

			act( () => host.send( { action: 'togglePanel', showing: false } ) );
			await new Promise( ( resolve ) => setTimeout( resolve, 50 ) );
			expect( recordedEvents( 'calypso_notification_open' ) ).toHaveLength( 1 );

			act( () => host.send( { action: 'togglePanel', showing: true } ) );
			await waitFor( () =>
				expect( recordedEvents( 'calypso_notification_open' ) ).toHaveLength( 2 )
			);
		},
		TEST_TIMEOUT
	);

	it(
		'shows "Mark as unread" on the open note when the host turns it on',
		async () => {
			const user = userEvent.setup();
			await openPanel( 'view-settings,mark-as-unread' );

			const note = await openNote( user );

			expect( note.getByRole( 'button', { name: 'Mark as unread' } ) ).toBeVisible();
			expect( screen.queryByRole( 'button', { name: 'Open full view' } ) ).not.toBeInTheDocument();
		},
		TEST_TIMEOUT
	);

	it(
		'has neither button when the host names neither feature',
		async () => {
			const user = userEvent.setup();
			await openPanel( 'view-settings' );

			await openNote( user );

			expect( screen.queryByRole( 'button', { name: 'Open full view' } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: 'Mark as unread' } ) ).not.toBeInTheDocument();
		},
		TEST_TIMEOUT
	);
} );
