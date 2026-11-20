import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { vi } from 'vitest';
import { init as initWpcom } from '../../../panel/rest-client/wpcom';
import { store, init as initState } from '../../../panel/state';
import actions from '../../../panel/state/actions';
import { AppProvider } from '../../context';
import MarkAllAsRead, { CONFIRM_ABOVE, UNREAD_IDS_LIMIT } from '../mark-all-read';
import type { Client } from '../../types';
import type { Mock } from 'vitest';

vi.mock( '../../../panel/helpers/log-error', () => ( {
	reportError: vi.fn(),
	reportRequestError: vi.fn(),
} ) );

vi.mock( '../../../panel/helpers/stats', () => ( { recordTracksEvent: vi.fn() } ) );

const makeNote = ( id: number, read = 0 ) => ( {
	id,
	type: 'comment',
	read,
	timestamp: `2026-06-${ String( id ).padStart( 2, '0' ) }T00:00:00+00:00`,
	subject: [ { text: `note ${ id }` } ],
	note_hash: `hash-${ id }`,
} );

const range = ( length: number, from = 1 ) => Array.from( { length }, ( _, i ) => from + i );

describe( 'MarkAllAsRead', () => {
	let serverUnreadIds: number[];
	let getCalls: { path: string; query: unknown }[];
	let markAll: Mock< ( body: unknown ) => Promise< unknown > >;
	const client = { refreshFilteredNotes: vi.fn() } as unknown as Client;

	const renderLink = ( onFocusLost?: () => void ) =>
		render(
			<Provider store={ store }>
				<AppProvider client={ client } locale="en">
					<MarkAllAsRead onFocusLost={ onFocusLost } />
				</AppProvider>
			</Provider>
		);

	const findLink = ( name: string ) => screen.findByRole( 'button', { name } );

	beforeEach( () => {
		localStorage.clear();
		// The redux store is a shared singleton; re-init it so each test starts empty.
		initState();

		serverUnreadIds = [];
		getCalls = [];
		markAll = vi.fn( async () => {
			serverUnreadIds = [];
			return { success: true, count: 0 };
		} );
		initWpcom( {
			req: {
				get: async ( { path }: { path: string }, query: unknown ) => {
					getCalls.push( { path, query } );
					return { notes: serverUnreadIds.map( ( id ) => ( { id } ) ) };
				},
				post: ( _params: unknown, _query: unknown, body: unknown ) => markAll( body ),
			},
		} );
	} );

	it( 'counts the unread notes on the account, not only the loaded ones', async () => {
		serverUnreadIds = range( 12 );
		store.dispatch( actions.notes.addNotes( [ makeNote( 1 ), makeNote( 2 ) ] ) );

		renderLink();

		expect( await findLink( 'Mark 12 as read' ) ).toBeVisible();
		expect( getCalls ).toEqual( [
			{
				path: '/notifications/',
				query: { unread: 1, fields: 'id', number: UNREAD_IDS_LIMIT },
			},
		] );
	} );

	it( 'says "or more" when the account has more unread notes than one request lists', async () => {
		serverUnreadIds = range( UNREAD_IDS_LIMIT );
		store.dispatch( actions.notes.addNotes( [ makeNote( 1 ) ] ) );

		renderLink();

		expect( await findLink( `Mark ${ UNREAD_IDS_LIMIT }+ as read` ) ).toBeVisible();
	} );

	it( 'shows nothing when every note is read', async () => {
		store.dispatch( actions.notes.addNotes( [ makeNote( 1, 1 ) ] ) );

		renderLink();

		await waitFor( () => expect( getCalls ).toHaveLength( 1 ) );
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
	} );

	it( 'shows nothing until the notes have loaded', () => {
		serverUnreadIds = range( 3 );

		renderLink();

		expect( getCalls ).toEqual( [] );
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
	} );

	it( 'counts down when a note is opened', async () => {
		serverUnreadIds = [ 1, 2 ];
		store.dispatch( actions.notes.addNotes( [ makeNote( 1 ), makeNote( 2 ) ] ) );
		renderLink();
		await findLink( 'Mark 2 as read' );

		act( () => {
			store.dispatch( actions.notes.readNote( 2 ) );
		} );

		expect( await findLink( 'Mark 1 as read' ) ).toBeVisible();
	} );

	it( 'counts again when a newer note arrives', async () => {
		serverUnreadIds = [ 1 ];
		store.dispatch( actions.notes.addNotes( [ makeNote( 1 ) ] ) );
		renderLink();
		await findLink( 'Mark 1 as read' );

		serverUnreadIds = [ 1, 7, 8 ];
		act( () => {
			store.dispatch( actions.notes.addNotes( [ makeNote( 8 ) ] ) );
		} );

		expect( await findLink( 'Mark 3 as read' ) ).toBeVisible();
	} );

	it( 'marks everything as read and goes away', async () => {
		const user = userEvent.setup();
		const onFocusLost = vi.fn();
		serverUnreadIds = range( 12 );
		store.dispatch( actions.notes.addNotes( [ makeNote( 1 ), makeNote( 2 ) ] ) );
		renderLink( onFocusLost );

		await user.click( await findLink( 'Mark 12 as read' ) );

		await waitFor( () => expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument() );
		expect( markAll ).toHaveBeenCalledTimes( 1 );
		expect( markAll ).toHaveBeenCalledWith( {
			time: Date.parse( makeNote( 2 ).timestamp ) / 1000,
		} );
		expect( client.refreshFilteredNotes ).toHaveBeenCalled();
		await waitFor( () => expect( onFocusLost ).toHaveBeenCalledTimes( 1 ) );
	} );

	it( 'cannot be clicked twice while the request is in flight', async () => {
		const user = userEvent.setup();
		let finish: ( response: unknown ) => void = () => {};
		markAll.mockImplementation( () => new Promise( ( resolve ) => ( finish = resolve ) ) );
		serverUnreadIds = [ 1 ];
		store.dispatch( actions.notes.addNotes( [ makeNote( 1 ) ] ) );
		renderLink();

		const link = await findLink( 'Mark 1 as read' );
		await user.click( link );
		await user.click( link );

		expect( markAll ).toHaveBeenCalledTimes( 1 );
		expect( link ).toHaveAttribute( 'aria-disabled', 'true' );
		expect( link ).not.toHaveClass( 'is-busy' );

		await act( async () => finish( { success: true, count: 1 } ) );
	} );

	it( `marks them without asking at ${ CONFIRM_ABOVE } or fewer`, async () => {
		const user = userEvent.setup();
		serverUnreadIds = range( CONFIRM_ABOVE );
		store.dispatch( actions.notes.addNotes( [ makeNote( 1 ) ] ) );
		renderLink();

		await user.click( await findLink( `Mark ${ CONFIRM_ABOVE } as read` ) );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		await waitFor( () => expect( markAll ).toHaveBeenCalledTimes( 1 ) );
	} );

	describe( `above ${ CONFIRM_ABOVE }`, () => {
		const count = CONFIRM_ABOVE + 1;

		beforeEach( () => {
			serverUnreadIds = range( count );
			store.dispatch( actions.notes.addNotes( [ makeNote( 1 ) ] ) );
		} );

		it( 'asks first, in a dialog', async () => {
			const user = userEvent.setup();
			renderLink();

			await user.click( await findLink( `Mark ${ count } as read` ) );

			const dialog = screen.getByRole( 'dialog' );
			expect(
				within( dialog ).getByRole( 'heading', {
					name: `Mark all ${ count } notifications as read?`,
				} )
			).toBeVisible();
			expect( within( dialog ).getByRole( 'button', { name: 'Mark all as read' } ) ).toBeVisible();
			expect( markAll ).not.toHaveBeenCalled();
		} );

		it( 'marks them all once confirmed', async () => {
			const user = userEvent.setup();
			renderLink();

			await user.click( await findLink( `Mark ${ count } as read` ) );
			await user.click( screen.getByRole( 'button', { name: 'Mark all as read' } ) );

			await waitFor( () => expect( markAll ).toHaveBeenCalledTimes( 1 ) );
			await waitFor( () => expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument() );
		} );

		it.each( [
			[
				'Cancel',
				( user: ReturnType< typeof userEvent.setup > ) =>
					user.click( screen.getByRole( 'button', { name: 'Cancel' } ) ),
			],
			[ 'Escape', ( user: ReturnType< typeof userEvent.setup > ) => user.keyboard( '{Escape}' ) ],
		] )( 'closes on %s and returns the focus to the link', async ( _, cancel ) => {
			const user = userEvent.setup();
			renderLink();

			await user.click( await findLink( `Mark ${ count } as read` ) );
			await cancel( user );

			await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument() );
			expect( await findLink( `Mark ${ count } as read` ) ).toHaveFocus();
			expect( markAll ).not.toHaveBeenCalled();
		} );
	} );

	it( 'asks first when there are more than one request lists', async () => {
		const user = userEvent.setup();
		serverUnreadIds = range( UNREAD_IDS_LIMIT );
		store.dispatch( actions.notes.addNotes( [ makeNote( 1 ) ] ) );
		renderLink();

		await user.click( await findLink( `Mark ${ UNREAD_IDS_LIMIT }+ as read` ) );

		expect(
			within( screen.getByRole( 'dialog' ) ).getByRole( 'heading', {
				name: `Mark all ${ UNREAD_IDS_LIMIT }+ notifications as read?`,
			} )
		).toBeVisible();
	} );

	it( 'keeps the notes unread and says so when the request fails', async () => {
		const user = userEvent.setup();
		markAll.mockRejectedValue( { status: 500 } );
		serverUnreadIds = [ 1, 2 ];
		store.dispatch( actions.notes.addNotes( [ makeNote( 1 ), makeNote( 2 ) ] ) );
		const { container } = renderLink();

		await user.click( await findLink( 'Mark 2 as read' ) );

		expect( await screen.findByRole( 'alert' ) ).toHaveTextContent(
			'Couldn’t mark your notifications as read. Try again.'
		);
		expect( container.querySelector( '.wpnc-app__mark-all-read-error' ) ).toBeVisible();
		expect( await findLink( 'Mark 2 as read' ) ).toBeEnabled();

		await user.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );

		expect( container.querySelector( '.wpnc-app__mark-all-read-error' ) ).not.toBeInTheDocument();
	} );
} );
