import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { vi } from 'vitest';
import { recordTracksEvent } from '../../../panel/helpers/stats';
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
		vi.mocked( recordTracksEvent ).mockClear();
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

	it( 'shows nothing until the unread notes on the account are counted', async () => {
		let answer: ( response: unknown ) => void = () => {};
		initWpcom( {
			req: {
				get: () => new Promise( ( resolve ) => ( answer = resolve ) ),
				post: ( _params: unknown, _query: unknown, body: unknown ) => markAll( body ),
			},
		} );
		store.dispatch( actions.notes.addNotes( [ makeNote( 1 ) ] ) );
		renderLink();

		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();

		await act( async () => answer( { notes: range( 30 ).map( ( id ) => ( { id } ) ) } ) );

		expect( await findLink( 'Mark 30 as read' ) ).toBeVisible();
	} );

	it( 'goes by the loaded notes, and asks first, when the account’s unread notes can’t be counted', async () => {
		const user = userEvent.setup();
		let isFailing = true;
		initWpcom( {
			req: {
				get: async () => {
					if ( isFailing ) {
						throw { status: 500 };
					}
					return { notes: serverUnreadIds.map( ( id ) => ( { id } ) ) };
				},
				post: ( _params: unknown, _query: unknown, body: unknown ) => markAll( body ),
			},
		} );
		store.dispatch( actions.notes.addNotes( [ makeNote( 1 ), makeNote( 2 ) ] ) );
		renderLink();

		await user.click( await findLink( 'Mark 2+ as read' ) );

		expect(
			within( screen.getByRole( 'dialog' ) ).getByRole( 'heading', {
				name: 'Mark all 2+ notifications as read?',
			} )
		).toBeVisible();
		expect( markAll ).not.toHaveBeenCalled();
		await user.click( screen.getByRole( 'button', { name: 'Cancel' } ) );
		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument() );

		isFailing = false;
		serverUnreadIds = [ 1, 2, 3 ];
		act( () => {
			store.dispatch( actions.notes.addNotes( [ makeNote( 3 ) ] ) );
		} );

		expect( await findLink( 'Mark 3 as read' ) ).toBeVisible();
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

	it( 'says "or more", and asks first, while the unread notes are counted again for a newer note', async () => {
		const user = userEvent.setup();
		serverUnreadIds = range( 19 );
		store.dispatch( actions.notes.addNotes( [ makeNote( 1 ) ] ) );
		renderLink();
		await findLink( 'Mark 19 as read' );

		let answer: ( response: unknown ) => void = () => {};
		initWpcom( {
			req: {
				get: () => new Promise( ( resolve ) => ( answer = resolve ) ),
				post: ( _params: unknown, _query: unknown, body: unknown ) => markAll( body ),
			},
		} );
		act( () => {
			store.dispatch( actions.notes.addNotes( [ makeNote( 22 ) ] ) );
		} );

		await user.click( await findLink( 'Mark 20+ as read' ) );

		const dialog = screen.getByRole( 'dialog' );
		expect(
			within( dialog ).getByRole( 'heading', { name: 'Mark all 20+ notifications as read?' } )
		).toBeVisible();
		expect( markAll ).not.toHaveBeenCalled();

		await act( async () => answer( { notes: range( 22 ).map( ( id ) => ( { id } ) ) } ) );

		expect(
			within( dialog ).getByRole( 'heading', { name: 'Mark all 22 notifications as read?' } )
		).toBeVisible();
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

		it( 'asks first, in a modal', async () => {
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

		it( 'lets its buttons wrap where their labels don’t fit side by side', async () => {
			const user = userEvent.setup();
			renderLink();

			await user.click( await findLink( `Mark ${ count } as read` ) );

			const dialog = screen.getByRole( 'dialog' );
			const row = within( dialog ).getByRole( 'button', { name: 'Cancel' } )
				.parentElement as HTMLElement;
			expect( row ).toContainElement(
				within( dialog ).getByRole( 'button', { name: 'Mark all as read' } )
			);
			// jsdom has no layout, so this checks the flex-wrap value Flex hands its styles.
			expect( row.style.getPropertyValue( '--wp-components-flex-wrap' ) ).toBe( 'wrap' );
		} );

		it( 'marks them all once confirmed, and hands the focus back as the link goes', async () => {
			const user = userEvent.setup();
			const onFocusLost = vi.fn();
			renderLink( onFocusLost );

			await user.click( await findLink( `Mark ${ count } as read` ) );
			await user.click( screen.getByRole( 'button', { name: 'Mark all as read' } ) );

			await waitFor( () => expect( markAll ).toHaveBeenCalledTimes( 1 ) );
			await waitFor( () => expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument() );
			await waitFor( () => expect( onFocusLost ).toHaveBeenCalledTimes( 1 ) );
			expect( recordTracksEvent ).not.toHaveBeenCalledWith(
				'calypso_notification_mark_all_read_cancel',
				expect.anything()
			);
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
			expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_notification_mark_all_read_cancel',
				{
					count,
					has_more: false,
				}
			);
		} );

		it( 'records one cancel when the modal is closed twice', async () => {
			const user = userEvent.setup();
			renderLink();

			await user.click( await findLink( `Mark ${ count } as read` ) );
			// Both presses land before the modal's exit animation ends.
			const dialog = screen.getByRole( 'dialog' );
			fireEvent.keyDown( dialog, { key: 'Escape' } );
			fireEvent.keyDown( dialog, { key: 'Escape' } );

			await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument() );
			await act( () => new Promise( ( resolve ) => setTimeout( resolve, 50 ) ) );
			expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'marks nothing when Mark all as read is pressed after Escape, as the modal closes', async () => {
			const user = userEvent.setup();
			renderLink();

			await user.click( await findLink( `Mark ${ count } as read` ) );
			const dialog = screen.getByRole( 'dialog' );
			fireEvent.keyDown( dialog, { key: 'Escape' } );
			fireEvent.click( within( dialog ).getByRole( 'button', { name: 'Mark all as read' } ) );

			await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument() );
			await act( () => new Promise( ( resolve ) => setTimeout( resolve, 50 ) ) );
			expect( markAll ).not.toHaveBeenCalled();
			expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_notification_mark_all_read_cancel',
				{ count, has_more: false }
			);
		} );
	} );

	it( 'asks first when the account has more unread notes than one request lists', async () => {
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
