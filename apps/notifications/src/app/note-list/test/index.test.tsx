/**
 * @jest-environment jsdom
 */
import { render, screen, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { init as initStore } from '../../../panel/state';
import actions from '../../../panel/state/actions';
import { AppProvider } from '../../context';
import NoteList from '../index';
import type { FilterName } from '../../types';

const noop = () => {};
const client = { hasMoreNotes: () => false, loadMore: noop, setFilter: noop };

const makeNote = ( id: number, label: string, type = 'comment' ) => ( {
	id,
	type,
	read: 0,
	noticon: '',
	timestamp: `2026-06-0${ id % 10 }T00:00:00+00:00`,
	title: `${ label } title`,
	subject: [ { text: label, ranges: [], media: [] } ],
} );

const renderTab = ( store: ReturnType< typeof initStore >, filterName: FilterName ) =>
	render(
		<Provider store={ store }>
			<AppProvider client={ client as never } locale="en">
				<NoteList
					filterName={ filterName }
					selectedNoteId={ undefined }
					setSelectedNoteId={ noop }
				/>
			</AppProvider>
		</Provider>
	);

const renderUnread = ( store: ReturnType< typeof initStore > ) =>
	renderTab( store, 'unread' as FilterName );

describe( 'NoteList loading state', () => {
	beforeAll( () => {
		Element.prototype.scrollIntoView = noop;
	} );

	it( 'shows the loader, not the empty message, while a filtered fetch is in flight', () => {
		const store = initStore();
		// Settle once with no notes so DataViews has mounted and shows its empty state.
		store.dispatch( actions.ui.loadedNotes() );
		const { container } = renderUnread( store );
		expect( screen.getByText( "You're all caught up!" ) ).toBeVisible();

		// A filtered fetch begins: loading is true while the data is still empty.
		act( () => {
			store.dispatch( actions.ui.loadNotes() );
		} );

		// The "all caught up" message must not show until the fetch settles.
		expect( screen.queryByText( "You're all caught up!" ) ).not.toBeInTheDocument();
		expect( container.querySelector( '.components-spinner' ) ).toBeTruthy();
	} );

	it( 'renders only the notes in the unread id list, not the whole cache', () => {
		const store = initStore();
		// Two cached notes the client would both treat as unread; only one is in
		// the server's unread id list.
		store.dispatch(
			actions.notes.addNotes( [
				makeNote( 800, 'In unread list' ),
				makeNote( 801, 'Only in cache' ),
			] )
		);
		store.dispatch( actions.notes.setUnreadNoteIds( [ 800 ] ) );
		store.dispatch( actions.ui.loadedNotes() );

		renderUnread( store );

		expect( screen.getByText( 'In unread list' ) ).toBeVisible();
		expect( screen.queryByText( 'Only in cache' ) ).not.toBeInTheDocument();
	} );

	// A note read in-app leaves the Unread view even though the server id list
	// still contains it (the read predicate runs on top of the list).
	it( 'excludes a read note from the Unread view even if it is in the id list', () => {
		const store = initStore();
		store.dispatch(
			actions.notes.addNotes( [ makeNote( 800, 'Unread one' ), makeNote( 801, 'Unread two' ) ] )
		);
		store.dispatch( actions.notes.setUnreadNoteIds( [ 800, 801 ] ) );
		store.dispatch( actions.notes.readNote( 800 ) );
		store.dispatch( actions.ui.loadedNotes() );

		renderUnread( store );

		expect( screen.queryByText( 'Unread one' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Unread two' ) ).toBeVisible();
	} );

	it( 'excludes a trashed note from the Unread view', () => {
		const store = initStore();
		store.dispatch(
			actions.notes.addNotes( [ makeNote( 810, 'Keep me' ), makeNote( 811, 'Trash me' ) ] )
		);
		store.dispatch( actions.notes.setUnreadNoteIds( [ 810, 811 ] ) );
		store.dispatch( actions.notes.trashNote( 811 ) );
		store.dispatch( actions.ui.loadedNotes() );

		renderUnread( store );

		expect( screen.getByText( 'Keep me' ) ).toBeVisible();
		expect( screen.queryByText( 'Trash me' ) ).not.toBeInTheDocument();
	} );

	it( 'client-filters the Comments tab from the shared cache', () => {
		const store = initStore();
		store.dispatch(
			actions.notes.addNotes( [
				makeNote( 900, 'A comment', 'comment' ),
				makeNote( 901, 'A like', 'like' ),
			] )
		);
		store.dispatch( actions.ui.loadedNotes() );

		renderTab( store, 'comments' as FilterName );

		expect( screen.getByText( 'A comment' ) ).toBeVisible();
		expect( screen.queryByText( 'A like' ) ).not.toBeInTheDocument();
	} );

	// A client-filtered tab pages through the shared cache and is often empty
	// mid-paging. The full loader must not re-take over on each page (that looked
	// like it continually restarted); the empty/DataViews view stays put.
	it( 'keeps the view (not the loader) while a client-filtered tab pages empty', () => {
		const store = initStore();
		// Settle once with no notes so DataViews has mounted on the Comments tab.
		store.dispatch( actions.ui.loadedNotes() );
		renderTab( store, 'comments' as FilterName );
		expect( screen.getByText( 'No new comments yet!' ) ).toBeVisible();

		// A paging fetch begins while no comments are loaded yet.
		act( () => {
			store.dispatch( actions.ui.loadNotes() );
		} );

		// The empty view stays — the full loader does not take over per page.
		expect( screen.getByText( 'No new comments yet!' ) ).toBeVisible();
	} );
} );
