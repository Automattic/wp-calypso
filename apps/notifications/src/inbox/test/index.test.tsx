import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { getClient, showNotes } from '../../app/client';
import { store, init as initState } from '../../panel/state';
import actions from '../../panel/state/actions';
import getIsPanelOpen from '../../panel/state/selectors/get-is-panel-open';
import getKeyboardShortcutsEnabled from '../../panel/state/selectors/get-keyboard-shortcuts-enabled';
import NotificationsInbox from '../index';
import type { ComponentProps } from 'react';

type InboxProps = ComponentProps< typeof NotificationsInbox >;

vi.mock( '../../panel/rest-client', () => ( {
	default: vi.fn( function () {
		return {
			getNote: vi.fn(),
			hasMoreNotes: () => false,
			loadMore: vi.fn(),
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

const makeNote = ( id: number, label: string ) => ( {
	id,
	type: 'comment',
	read: 0,
	noticon: '',
	timestamp: `2026-06-0${ id % 10 }T00:00:00+00:00`,
	title: `${ label } title`,
	subject: [ { text: label, ranges: [], media: [] } ],
	body: [],
} );

const loadNotes = ( ...notes: ReturnType< typeof makeNote >[] ) => {
	store.dispatch( actions.notes.addNotes( notes ) );
	store.dispatch( actions.ui.loadedNotes() );
};

const renderInbox = (
	selectedNoteId?: string,
	{
		filterName,
		setFilterName = () => {},
		setSelectedNoteId = () => {},
	}: Partial< Pick< InboxProps, 'filterName' | 'setFilterName' | 'setSelectedNoteId' > > = {}
) =>
	render(
		<NotificationsInbox
			wpcom={ {} }
			locale="en"
			filterName={ filterName }
			setFilterName={ setFilterName }
			selectedNoteId={ selectedNoteId }
			setSelectedNoteId={ setSelectedNoteId }
			renderLayout={ ( { list, detail } ) => (
				<>
					<section aria-label="List">{ list }</section>
					<section aria-label="Open note">{ detail }</section>
				</>
			) }
		/>
	);

describe( 'NotificationsInbox', () => {
	beforeAll( () => {
		Element.prototype.scrollIntoView = () => {};
	} );

	beforeEach( () => {
		initState();
	} );

	it( 'hands the host the note list and the open note', () => {
		loadNotes( makeNote( 801, 'First comment' ), makeNote( 802, 'Second comment' ) );

		renderInbox( '802' );

		const list = within( screen.getByRole( 'region', { name: 'List' } ) );
		expect( list.getByText( 'First comment' ) ).toBeVisible();
		expect( list.getByText( 'Second comment' ) ).toBeVisible();
		expect(
			within( screen.getByRole( 'region', { name: 'Open note' } ) ).getByRole( 'heading', {
				name: 'Second comment title',
			} )
		).toBeVisible();
	} );

	it( 'titles the list with the page heading and the same tabs as the panel', async () => {
		loadNotes( makeNote( 801, 'First comment' ) );

		renderInbox();

		const list = within( screen.getByRole( 'region', { name: 'List' } ) );
		expect( list.getByRole( 'heading', { name: 'Notifications', level: 1 } ) ).toBeVisible();
		expect( await list.findByRole( 'tab', { name: 'All', selected: true } ) ).toBeVisible();
		expect( list.getAllByRole( 'tab' ).map( ( tab ) => tab.textContent ) ).toEqual( [
			'All',
			'Unread',
			'Comments',
			'Subscribers',
			'Likes',
		] );
	} );

	it( 'leaves out the panel settings and keyboard shortcuts buttons', async () => {
		renderInbox();

		await screen.findByRole( 'tab', { name: 'All', selected: true } );
		expect( screen.queryByRole( 'button', { name: 'Settings' } ) ).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Keyboard shortcuts' } )
		).not.toBeInTheDocument();
	} );

	it( 'opens on the tab the host names', async () => {
		renderInbox( undefined, { filterName: 'likes' } );

		expect( await screen.findByRole( 'tab', { name: 'Likes', selected: true } ) ).toBeVisible();
		expect( getClient().setFilter ).toHaveBeenLastCalledWith( 'likes' );
	} );

	it( 'shows every notification when the host names a tab that does not exist', async () => {
		renderInbox( undefined, { filterName: 'mentions' } );

		expect( await screen.findByRole( 'tab', { name: 'All', selected: true } ) ).toBeVisible();
		expect( getClient().setFilter ).toHaveBeenLastCalledWith( 'all' );
	} );

	it( 'tells the host the chosen tab and closes the open note', async () => {
		const user = userEvent.setup();
		const setFilterName = vi.fn();
		const setSelectedNoteId = vi.fn();
		loadNotes( makeNote( 801, 'First comment' ) );
		renderInbox( '801', { setFilterName, setSelectedNoteId } );

		await user.click( await screen.findByRole( 'tab', { name: 'Comments' } ) );

		expect( setFilterName ).toHaveBeenCalledWith( 'comments' );
		expect( setSelectedNoteId ).toHaveBeenLastCalledWith( undefined );
	} );

	it( 'shows no open note until one is selected', () => {
		loadNotes( makeNote( 801, 'First comment' ) );

		renderInbox();

		expect( screen.getByRole( 'region', { name: 'Open note' } ) ).toBeEmptyDOMElement();
	} );

	it( 'fetches a linked note that is not in the loaded list', () => {
		loadNotes( makeNote( 801, 'First comment' ) );

		renderInbox( '999' );

		expect( getClient().getNote ).toHaveBeenCalledWith( 999 );
		expect( screen.getByRole( 'region', { name: 'Open note' } ) ).toBeEmptyDOMElement();
	} );

	it( 'does not fetch a selected note that is already loaded', () => {
		loadNotes( makeNote( 801, 'First comment' ) );
		vi.mocked( getClient()?.getNote )?.mockClear();

		renderInbox( '801' );

		expect( getClient().getNote ).not.toHaveBeenCalled();
	} );

	it( 'keeps the notes showing while it is mounted', () => {
		const { unmount } = renderInbox();

		expect( getIsPanelOpen( store.getState() ) ).toBe( true );

		unmount();

		expect( getIsPanelOpen( store.getState() ) ).toBe( false );
	} );

	it( 'keeps the notes showing when the panel closes after the inbox has opened', () => {
		const closePanel = showNotes();
		renderInbox();

		act( () => closePanel() );

		expect( getIsPanelOpen( store.getState() ) ).toBe( true );
		expect( getClient().setVisibility ).toHaveBeenLastCalledWith(
			expect.objectContaining( { isShowing: true } )
		);
	} );

	it( 'turns off the panel keyboard shortcuts', () => {
		store.dispatch( actions.ui.enableKeyboardShortcuts() );

		renderInbox();

		expect( getKeyboardShortcutsEnabled( store.getState() ) ).toBe( false );
	} );

	it( 'opens a link from a note in a new tab', () => {
		const open = vi.spyOn( window, 'open' ).mockReturnValue( null );
		renderInbox();

		store.dispatch( { type: 'OPEN_LINK', href: 'https://example.com/post' } );

		expect( open ).toHaveBeenCalledWith( 'https://example.com/post', '_blank', 'noopener' );
		open.mockRestore();
	} );
} );
