import { act, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import { getClient, showNotes } from '../../app/client';
import { store, init as initState } from '../../panel/state';
import actions from '../../panel/state/actions';
import getIsPanelOpen from '../../panel/state/selectors/get-is-panel-open';
import getKeyboardShortcutsEnabled from '../../panel/state/selectors/get-keyboard-shortcuts-enabled';
import NotificationsInbox from '../index';

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

const renderInbox = ( selectedNoteId?: string ) =>
	render(
		<NotificationsInbox
			wpcom={ {} }
			locale="en"
			filterName="all"
			selectedNoteId={ selectedNoteId }
			setSelectedNoteId={ () => {} }
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
