import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { vi } from 'vitest';
import { store, init as initState } from '../../panel/state';
import actions from '../../panel/state/actions';
import { spamNote as spamNoteAction } from '../../panel/state/notes/actions';
import NotificationsInbox from '../index';

let isLargeScreen = true;
vi.mock( '@wordpress/compose', async ( importOriginal ) => ( {
	...( await importOriginal< typeof import( '@wordpress/compose' ) >() ),
	useViewportMatch: () => isLargeScreen,
} ) );
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
	listNotes: vi.fn( async () => ( { notes: [] } ) ),
	markReadStatus: vi.fn(),
	markPostAsSeen: vi.fn(),
} ) );

// Each request to mark a comment as spam waits until the test lets it land.
const pending: Array< () => void > = [];
vi.mock( '../../panel/state/notes/thunks', async ( importOriginal ) => ( {
	...( await importOriginal< typeof import( '../../panel/state/notes/thunks' ) >() ),
	spamNote: ( note: { id: number } ) => async ( dispatch: ( action: unknown ) => void ) => {
		await new Promise< void >( ( resolve ) => pending.push( resolve ) );
		dispatch( spamNoteAction( note.id ) );
	},
} ) );

const comment = ( id: number, name: string, text: string ) => ( {
	id,
	type: 'comment',
	read: 1,
	noticon: '',
	timestamp: `2026-06-0${ id % 10 }T00:00:00+00:00`,
	title: 'Comment',
	subject: [ { text: `${ name } commented on Hello`, ranges: [] }, { text } ],
	body: [
		{ text: name, type: 'user', ranges: [] },
		{
			text,
			type: 'comment',
			actions: {
				'approve-comment': true,
				'spam-comment': false,
				'trash-comment': false,
				'edit-comment': true,
			},
			meta: { ids: { site: 1, post: 2, comment: id } },
		},
	],
	meta: {
		ids: { site: 1, post: 2, comment: id },
		post: { title: 'Hello', url: 'https://example.com/hello' },
		actor: { name, avatar: '', url: 'https://example.com' },
	},
} );

// Two panes from the large breakpoint; below it, the list or the open note, as the Dashboard does.
function Host() {
	const [ selectedNoteId, setSelectedNoteId ] = useState< string | undefined >( '801' );
	return (
		<NotificationsInbox
			wpcom={ {} }
			locale="en"
			filterName={ undefined }
			setFilterName={ () => {} }
			selectedNoteId={ selectedNoteId }
			setSelectedNoteId={ setSelectedNoteId }
			renderLayout={ ( { list, detail } ) =>
				isLargeScreen || ! selectedNoteId ? (
					<>
						<section aria-label="List">{ list }</section>
						<section aria-label="Open note">{ detail }</section>
					</>
				) : (
					<section aria-label="Open note">{ detail }</section>
				)
			}
		/>
	);
}

describe( 'marking a comment as spam, then opening another before it lands', () => {
	const list = () => within( screen.getByRole( 'region', { name: 'List' } ) );
	const openNote = () => within( screen.getByRole( 'region', { name: 'Open note' } ) );

	beforeAll( () => {
		Element.prototype.scrollIntoView = () => {};
	} );

	beforeEach( () => {
		initState();
		pending.length = 0;
		isLargeScreen = true;
		store.dispatch(
			actions.notes.addNotes( [
				comment( 801, 'Ada Example', 'First comment text' ),
				comment( 802, 'Eve Demo', 'Second comment text' ),
			] )
		);
		store.dispatch( actions.ui.loadedNotes() );
	} );

	const openSecondWhileFirstIsMarked = async () => {
		const user = userEvent.setup();
		render( <Host /> );

		await user.click( openNote().getByRole( 'button', { name: 'Mark comment as spam' } ) );
		expect( pending ).toHaveLength( 1 );

		await user.click( list().getByRole( 'button', { name: /Eve Demo/ } ) );
		expect( openNote().getByText( 'Second comment text' ) ).toBeVisible();
	};

	it( 'doesn’t show the other comment’s Spam as busy', async () => {
		await openSecondWhileFirstIsMarked();

		expect(
			openNote().getByRole( 'button', { name: 'Mark comment as spam' } )
		).not.toHaveAttribute( 'aria-disabled', 'true' );
	} );

	it( 'keeps the other comment open when the first one lands', async () => {
		await openSecondWhileFirstIsMarked();

		await act( async () => pending[ 0 ]() );

		expect( list().queryByText( /Ada Example/ ) ).not.toBeInTheDocument();
		expect( openNote().getByText( 'Second comment text' ) ).toBeVisible();
	} );

	it( 'keeps the other comment open when the first one lands, one pane at a time', async () => {
		isLargeScreen = false;
		const user = userEvent.setup();
		render( <Host /> );

		await user.click( openNote().getByRole( 'button', { name: 'Actions' } ) );
		await user.click( await screen.findByRole( 'menuitem', { name: 'Mark as spam' } ) );
		expect( pending ).toHaveLength( 1 );
		await user.click( openNote().getByRole( 'button', { name: /back to notifications/ } ) );
		await user.click( list().getByRole( 'button', { name: /Eve Demo/ } ) );
		expect( openNote().getByText( 'Second comment text' ) ).toBeVisible();

		await act( async () => pending[ 0 ]() );

		expect( openNote().getByText( 'Second comment text' ) ).toBeVisible();
	} );
} );
