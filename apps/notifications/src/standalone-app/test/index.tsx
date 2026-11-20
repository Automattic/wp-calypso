import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

type HostMessage = { action: string; showing?: boolean };

const host = vi.hoisted( () => ( {
	send: ( () => {} ) as ( message: HostMessage ) => void,
	received: [] as string[],
} ) );

vi.mock( '../../standalone/client', () => ( {
	createClient: async () => ( { req: { get: async () => ( { ID: 1, username: 'example' } ) } } ),
} ) );
vi.mock( '../../standalone/messaging', () => ( {
	receiveMessage: ( receiver: ( message: HostMessage ) => void ) => {
		host.send = receiver;
		return () => {};
	},
	sendMessage: ( message: HostMessage ) => host.received.push( message.action ),
} ) );
vi.mock( '../../panel/helpers/stats', () => ( { recordTracksEvent: vi.fn() } ) );
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

// Boots the iframe app with the given `features` in its address, as the host page loads it, and opens the panel.
const openPanel = async ( features: string ) => {
	vi.resetModules();
	host.received = [];
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
	await waitFor( () => expect( host.received ).toContain( 'iFrameReady' ) );
	act( () => host.send( { action: 'togglePanel', showing: true } ) );
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
		vi.restoreAllMocks();
	} );

	it( 'opens the full page on the current tab, in a new browser tab, when the host turns the full view on', async () => {
		const user = userEvent.setup();
		await openPanel( 'view-settings,full-view' );

		await user.click( await screen.findByRole( 'button', { name: 'Open full view' } ) );
		expect( window.open ).toHaveBeenLastCalledWith(
			'https://my.wordpress.com/notifications',
			'_blank',
			'noopener'
		);

		await user.click( screen.getByRole( 'tab', { name: 'Unread' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Open full view' } ) );
		expect( window.open ).toHaveBeenLastCalledWith(
			'https://my.wordpress.com/notifications?filter=unread',
			'_blank',
			'noopener'
		);
	} );

	it( 'hands the open note to the full page', async () => {
		const user = userEvent.setup();
		await openPanel( 'view-settings,full-view' );

		const note = await openNote( user );
		await user.click( note.getByRole( 'button', { name: 'Open full view' } ) );

		expect( window.open ).toHaveBeenLastCalledWith(
			'https://my.wordpress.com/notifications?note=801',
			'_blank',
			'noopener'
		);
	} );

	it( 'shows "Mark as unread" on the open note when the host turns it on', async () => {
		const user = userEvent.setup();
		await openPanel( 'view-settings,mark-as-unread' );

		const note = await openNote( user );

		expect( note.getByRole( 'button', { name: 'Mark as unread' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Open full view' } ) ).not.toBeInTheDocument();
	} );

	it( 'has neither button when the host names neither feature', async () => {
		const user = userEvent.setup();
		await openPanel( 'view-settings' );

		await openNote( user );

		expect( screen.queryByRole( 'button', { name: 'Open full view' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Mark as unread' } ) ).not.toBeInTheDocument();
	} );
} );
