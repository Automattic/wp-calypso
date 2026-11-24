import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { getClient, initClient, showNotes } from '../../app/client';
import { markPanelMounted } from '../../app/panel-mounted';
import { listNotes } from '../../panel/rest-client/wpcom';
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
const { post } = vi.hoisted( () => ( { post: vi.fn( async () => ( {} ) ) } ) );
vi.mock( '../../panel/rest-client/wpcom', () => ( {
	init: vi.fn(),
	fetchSuggestions: vi.fn(),
	listNotes: vi.fn( async () => ( { notes: [] } ) ),
	markReadStatus: vi.fn(),
	markPostAsSeen: vi.fn(),
	wpcom: () => ( { req: { post } } ),
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

const makeComment = ( id: number, label: string ) => {
	const ids = { site: 10, post: 30, comment: 20 };
	return {
		...makeNote( id, label ),
		subject: [ { text: label, ranges: [ { type: 'b', indices: [ 0, 0 ] } ], media: [] } ],
		body: [
			{
				type: 'comment',
				text: 'A short reply',
				actions: { 'like-comment': false, 'replyto-comment': true },
				meta: { ids },
			},
		],
		meta: { ids },
	};
};

const loadNotes = (
	...notes: Array< ReturnType< typeof makeNote > | ReturnType< typeof makeComment > >
) => {
	store.dispatch( actions.notes.addNotes( notes ) );
	store.dispatch( actions.ui.loadedNotes() );
};

const renderInbox = (
	selectedNoteId?: string,
	{
		filterName,
		setFilterName = () => {},
		setSelectedNoteId = () => {},
		onViewSettings,
		isMarkAsUnreadEnabled,
		tracksSurface,
	}: Partial<
		Pick<
			InboxProps,
			| 'filterName'
			| 'setFilterName'
			| 'setSelectedNoteId'
			| 'onViewSettings'
			| 'isMarkAsUnreadEnabled'
			| 'tracksSurface'
		>
	> = {}
) =>
	render(
		<NotificationsInbox
			wpcom={ {} }
			locale="en"
			filterName={ filterName }
			setFilterName={ setFilterName }
			selectedNoteId={ selectedNoteId }
			setSelectedNoteId={ setSelectedNoteId }
			onViewSettings={ onViewSettings }
			isMarkAsUnreadEnabled={ isMarkAsUnreadEnabled }
			tracksSurface={ tracksSurface }
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

	it( 'shows "Mark as unread" on the open note only when the host turns it on', () => {
		loadNotes( makeNote( 801, 'First comment' ) );

		const { unmount } = renderInbox( '801' );
		expect( screen.queryByRole( 'button', { name: 'Mark as unread' } ) ).not.toBeInTheDocument();
		unmount();

		renderInbox( '801', { isMarkAsUnreadEnabled: true } );
		expect(
			within( screen.getByRole( 'region', { name: 'Open note' } ) ).getByRole( 'button', {
				name: 'Mark as unread',
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

	it( 'offers to mark every unread notification as read', async () => {
		vi.mocked( listNotes ).mockResolvedValueOnce( { notes: [ { id: 801 }, { id: 900 } ] } );
		loadNotes( makeNote( 801, 'First comment' ) );

		renderInbox();

		expect(
			await within( screen.getByRole( 'region', { name: 'List' } ) ).findByRole( 'button', {
				name: 'Mark 2 as read',
			} )
		).toBeVisible();
	} );

	it( 'leaves out the panel settings and keyboard shortcuts buttons when the host cannot open the settings', async () => {
		renderInbox();

		await screen.findByRole( 'tab', { name: 'All', selected: true } );
		expect( screen.queryByRole( 'button', { name: 'Settings' } ) ).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Keyboard shortcuts' } )
		).not.toBeInTheDocument();
	} );

	it( 'asks the host to open the settings from the list header', async () => {
		const user = userEvent.setup();
		const onViewSettings = vi.fn();
		renderInbox( undefined, { onViewSettings } );

		const list = within( screen.getByRole( 'region', { name: 'List' } ) );
		await user.click( await list.findByRole( 'button', { name: 'Settings' } ) );

		expect( onViewSettings ).toHaveBeenCalledTimes( 1 );
		expect(
			screen.queryByRole( 'button', { name: 'Keyboard shortcuts' } )
		).not.toBeInTheDocument();
	} );

	it( 'keeps one settings listener and calls the newest handler when the host passes a new one', async () => {
		const user = userEvent.setup();
		const firstHandler = vi.fn();
		const newestHandler = vi.fn();
		const inboxProps: Omit< InboxProps, 'onViewSettings' > = {
			wpcom: {},
			locale: 'en',
			filterName: undefined,
			setFilterName: () => {},
			selectedNoteId: undefined,
			setSelectedNoteId: () => {},
			renderLayout: ( { list } ) => <section aria-label="List">{ list }</section>,
		};
		const { rerender } = render(
			<NotificationsInbox { ...inboxProps } onViewSettings={ firstHandler } />
		);
		const dispatch = vi.spyOn( store, 'dispatch' );

		rerender( <NotificationsInbox { ...inboxProps } onViewSettings={ newestHandler } /> );

		expect( dispatch ).not.toHaveBeenCalled();
		dispatch.mockRestore();

		await user.click( await screen.findByRole( 'button', { name: 'Settings' } ) );

		expect( newestHandler ).toHaveBeenCalledTimes( 1 );
		expect( firstHandler ).not.toHaveBeenCalled();
	} );

	it( 'stops answering the settings button once it is unmounted', () => {
		const onViewSettings = vi.fn();
		const { unmount } = renderInbox( undefined, { onViewSettings } );

		unmount();
		store.dispatch( actions.ui.viewSettings() );

		expect( onViewSettings ).not.toHaveBeenCalled();
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

	it( 'tells the host the chosen tab and leaves closing the open note to it', async () => {
		const user = userEvent.setup();
		const setFilterName = vi.fn();
		const setSelectedNoteId = vi.fn();
		loadNotes( makeNote( 801, 'First comment' ) );
		renderInbox( '801', { setFilterName, setSelectedNoteId } );

		await user.click( await screen.findByRole( 'tab', { name: 'Comments' } ) );

		expect( setFilterName ).toHaveBeenCalledWith( 'comments' );
		expect( setSelectedNoteId ).not.toHaveBeenCalled();
	} );

	it( 'names the surface the host gives in the events it records, until it is unmounted', async () => {
		const user = userEvent.setup();
		const tracks = window as unknown as { _tkq: unknown[][] };
		tracks._tkq = [];
		loadNotes( makeNote( 801, 'First comment' ) );
		const { unmount } = renderInbox( undefined, { tracksSurface: 'dashboard_page' } );

		await user.click( await screen.findByRole( 'tab', { name: 'Comments' } ) );
		expect( tracks._tkq ).toContainEqual( [
			'recordEvent',
			'calypso_notification_tab_select',
			{ tab: 'comments', source: 'tab', surface: 'dashboard_page' },
		] );

		unmount();
		renderInbox();
		await user.click( await screen.findByRole( 'tab', { name: 'Likes' } ) );
		expect( tracks._tkq ).toContainEqual( [
			'recordEvent',
			'calypso_notification_tab_select',
			{ tab: 'likes', source: 'tab' },
		] );
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

	it( 'leaves the host to show its empty state when a selected note cannot be loaded', async () => {
		initClient( {} );
		vi.mocked( getClient().getNote ).mockResolvedValueOnce( false );
		const setSelectedNoteId = vi.fn();
		loadNotes( makeNote( 801, 'First comment' ) );

		renderInbox( '999', { setSelectedNoteId } );

		await waitFor( () => expect( setSelectedNoteId ).toHaveBeenCalledWith( undefined ) );
	} );

	it( 'keeps a selected note that the server returns', async () => {
		initClient( {} );
		const found = Promise.resolve( true );
		vi.mocked( getClient().getNote ).mockReturnValueOnce( found );
		const setSelectedNoteId = vi.fn();

		renderInbox( '999', { setSelectedNoteId } );
		await act( () => found );

		expect( setSelectedNoteId ).not.toHaveBeenCalled();
	} );

	it( 'keeps the selection when the note may still load', async () => {
		initClient( {} );
		const found = Promise.resolve( undefined );
		vi.mocked( getClient().getNote ).mockReturnValueOnce( found );
		const setSelectedNoteId = vi.fn();

		renderInbox( '999', { setSelectedNoteId } );
		await act( () => found );

		expect( setSelectedNoteId ).not.toHaveBeenCalled();
	} );

	it( 'keeps the newer selection when a note that cannot be loaded was selected before it', async () => {
		initClient( {} );
		let answer: ( found: boolean ) => void = () => {};
		vi.mocked( getClient().getNote ).mockReturnValueOnce(
			new Promise( ( resolve ) => ( answer = resolve ) )
		);
		const setSelectedNoteId = vi.fn();
		loadNotes( makeNote( 801, 'First comment' ) );
		const { rerender } = renderInbox( '999', { setSelectedNoteId } );

		rerender(
			<NotificationsInbox
				wpcom={ {} }
				locale="en"
				filterName={ undefined }
				setFilterName={ () => {} }
				selectedNoteId="801"
				setSelectedNoteId={ setSelectedNoteId }
				renderLayout={ ( { detail } ) => <section aria-label="Open note">{ detail }</section> }
			/>
		);
		await act( async () => answer( false ) );

		expect( setSelectedNoteId ).not.toHaveBeenCalled();
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

	describe( 'keyboard shortcuts', () => {
		beforeEach( () => {
			post.mockClear();
		} );

		it( "leaves the panel's shortcut switch alone", () => {
			// Off, as while the panel's reply box has focus.
			store.dispatch( actions.ui.disableKeyboardShortcuts() );

			renderInbox();

			expect( getKeyboardShortcutsEnabled( store.getState() ) ).toBe( false );
		} );

		it( 'likes the open comment with l', async () => {
			const user = userEvent.setup();
			loadNotes( makeComment( 801, 'First comment' ) );
			renderInbox( '801' );

			await user.keyboard( 'l' );

			expect( post ).toHaveBeenCalledWith( '/sites/10/comments/20/likes/new' );
		} );

		it( 'leaves l typed into a field elsewhere on the page alone', async () => {
			const user = userEvent.setup();
			loadNotes( makeComment( 801, 'First comment' ) );
			renderInbox( '801' );
			render( <input aria-label="Search" /> );

			await user.type( screen.getByRole( 'textbox', { name: 'Search' } ), 'l' );

			expect( post ).not.toHaveBeenCalled();
		} );

		it( 'leaves l typed into the reply box alone, whatever the shared switch says', async () => {
			const user = userEvent.setup();
			loadNotes( makeComment( 801, 'First comment' ) );
			renderInbox( '801' );
			const reply = within( screen.getByRole( 'region', { name: 'Open note' } ) ).getByRole(
				'textbox'
			);
			await user.click( reply );
			// On, as when React misses the reply box getting the focus back.
			act( () => {
				store.dispatch( actions.ui.enableKeyboardShortcuts() );
			} );

			await user.keyboard( 'l' );

			expect( reply ).toHaveValue( 'l' );
			expect( post ).not.toHaveBeenCalled();
		} );

		it( 'leaves l pressed with nothing focused to a panel opened over the page', async () => {
			const user = userEvent.setup();
			loadNotes( makeComment( 801, 'First comment' ) );
			renderInbox( '801' );
			const unmarkPanel = markPanelMounted();

			try {
				await user.keyboard( 'l' );
			} finally {
				unmarkPanel();
			}

			expect( post ).not.toHaveBeenCalled();
		} );

		it( "leaves moving through the notes and tabs to the page's own controls", async () => {
			const user = userEvent.setup();
			const setSelectedNoteId = vi.fn();
			const setFilterName = vi.fn();
			// On, as after the panel was opened.
			store.dispatch( actions.ui.enableKeyboardShortcuts() );
			loadNotes( makeNote( 801, 'First comment' ), makeNote( 802, 'Second comment' ) );
			const { unmount } = renderInbox( '802', { setSelectedNoteId } );

			await user.keyboard( 'j{ArrowDown}{ArrowRight}' );

			expect( setSelectedNoteId ).not.toHaveBeenCalled();
			expect( document.body ).toHaveFocus();
			unmount();

			renderInbox( undefined, { setFilterName } );

			await user.keyboard( 'u' );

			expect( setFilterName ).not.toHaveBeenCalled();
		} );
	} );

	it( 'opens a link from a note in a new tab', () => {
		const open = vi.spyOn( window, 'open' ).mockReturnValue( null );
		renderInbox();

		store.dispatch( { type: 'OPEN_LINK', href: 'https://example.com/post' } );

		expect( open ).toHaveBeenCalledWith( 'https://example.com/post', '_blank', 'noopener' );
		open.mockRestore();
	} );

	it( 'leaves links to a panel opened over the page, which opens them itself', () => {
		const open = vi.spyOn( window, 'open' ).mockReturnValue( null );
		renderInbox();
		const unmarkPanel = markPanelMounted();

		try {
			store.dispatch( { type: 'EDIT_COMMENT', href: 'https://example.com/edit' } );
		} finally {
			unmarkPanel();
		}

		expect( open ).not.toHaveBeenCalled();
		open.mockRestore();
	} );
} );
