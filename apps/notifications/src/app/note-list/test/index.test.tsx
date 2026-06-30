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

const renderTab = (
	store: ReturnType< typeof initStore >,
	filterName: FilterName,
	clientOverride: Partial< typeof client > = {},
	selectedNoteId: string | undefined = undefined
) =>
	render(
		<Provider store={ store }>
			<AppProvider client={ { ...client, ...clientOverride } as never } locale="en">
				<NoteList
					filterName={ filterName }
					selectedNoteId={ selectedNoteId }
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
			store.dispatch( actions.ui.loadNotes( { filter: { unread: 1 } } ) );
		} );

		// The "all caught up" message must not show until the fetch settles.
		expect( screen.queryByText( "You're all caught up!" ) ).not.toBeInTheDocument();
		expect( container.querySelector( '.components-spinner' ) ).toBeTruthy();
	} );

	// Regression: the always-running unfiltered background poll clears the shared
	// loading flag, but it must not expose the Unread empty message while a
	// filtered fetch is still in flight (the "loading → empty → list" flash).
	it( 'keeps the loader when the background poll clears shared loading mid-fetch', () => {
		const store = initStore();
		store.dispatch( actions.ui.loadedNotes() );
		const { container } = renderUnread( store );
		expect( screen.getByText( "You're all caught up!" ) ).toBeVisible();

		// The Unread fetch begins.
		act( () => {
			store.dispatch( actions.ui.loadNotes( { filter: { unread: 1 } } ) );
		} );
		expect( screen.queryByText( "You're all caught up!" ) ).not.toBeInTheDocument();

		// A background all-notes poll completes and clears the shared loading flag
		// while the filtered fetch is still in flight: the message must stay hidden.
		act( () => {
			store.dispatch( actions.ui.loadedNotes() );
		} );
		expect( screen.queryByText( "You're all caught up!" ) ).not.toBeInTheDocument();
		expect( container.querySelector( '.components-spinner' ) ).toBeTruthy();
	} );

	// Regression: a refetch that empties the Unread list mid-flight must not
	// unmount DataViews — it binds its scroll listener once, on mount.
	it( 'keeps DataViews mounted when the Unread list empties mid-fetch', () => {
		const store = initStore();
		store.dispatch( actions.notes.addNotes( [ makeNote( 800, 'Unread one' ) ] ) );
		store.dispatch( actions.notes.setUnreadNoteIds( [ 800 ] ) );
		store.dispatch( actions.ui.loadedNotes() );
		const { container } = renderUnread( store );

		const dataViews = container.querySelector( '.dataviews-layout__container' );
		expect( dataViews ).toBeTruthy();

		// A refetch clears the id list and flips loading on: the list is empty while
		// the request is in flight.
		act( () => {
			store.dispatch( actions.notes.setUnreadNoteIds( [] ) );
			store.dispatch( actions.ui.loadNotes( { filter: { unread: 1 } } ) );
		} );

		// The same DataViews node is still mounted — it was not swapped for the
		// full-panel loader and remounted.
		expect( container.querySelector( '.dataviews-layout__container' ) ).toBe( dataViews );
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

	// Reading a note in-app must drop the row's unread indicator right away,
	// before any server refetch flips the note's raw `read` flag. The indicator
	// is the `is-unread` icon badge rendered for each unread row.
	it( 'drops the unread styling from a row the moment its note is read', () => {
		const store = initStore();
		store.dispatch( actions.notes.addNotes( [ makeNote( 950, 'Read me' ) ] ) );
		store.dispatch( actions.ui.loadedNotes() );

		renderTab( store, 'all' as FilterName );

		const getRow = () => screen.getByText( 'Read me' ).closest( '[role="article"]' );
		expect( getRow()?.querySelector( '.is-unread' ) ).toBeInTheDocument();

		act( () => {
			store.dispatch( actions.notes.readNote( 950 ) );
		} );

		expect( getRow()?.querySelector( '.is-unread' ) ).not.toBeInTheDocument();
	} );

	it( 'renders time-grouped section headers in newest-first order', () => {
		const store = initStore();
		const today = new Date().toISOString();
		store.dispatch(
			actions.notes.addNotes( [
				{ ...makeNote( 700, 'Fresh note' ), timestamp: today },
				{ ...makeNote( 701, 'Ancient note' ), timestamp: '2020-01-01T00:00:00+00:00' },
			] )
		);
		store.dispatch( actions.ui.loadedNotes() );

		const { container } = renderTab( store, 'all' as FilterName );

		const headers = Array.from(
			container.querySelectorAll( '.dataviews-view-list__group-header' )
		).map( ( el ) => el.textContent );
		expect( headers ).toEqual( [ 'Today', 'Older than a month' ] );
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

	// Once the cache is exhausted (no more to page), a background refresh must not
	// flash the spinner over the settled empty message.
	it( 'keeps the empty message on a settled client-filtered tab during a refresh', () => {
		const store = initStore();
		store.dispatch( actions.ui.loadedNotes() );
		renderTab( store, 'comments' as FilterName ); // client.hasMoreNotes() is false
		expect( screen.getByText( 'No new comments yet!' ) ).toBeVisible();

		act( () => {
			store.dispatch( actions.ui.loadNotes() );
		} );

		expect( screen.getByText( 'No new comments yet!' ) ).toBeVisible();
	} );

	// While a client-filtered tab still has cache pages to search, show the spinner
	// rather than flashing its empty message before matching notes arrive.
	it( 'shows the loader on a client-filtered tab while the cache still has pages', () => {
		const store = initStore();
		store.dispatch( actions.ui.loadedNotes() );
		const { container } = renderTab( store, 'comments' as FilterName, {
			hasMoreNotes: () => true,
		} );

		expect( screen.queryByText( 'No new comments yet!' ) ).not.toBeInTheDocument();
		expect( container.querySelector( '.components-spinner' ) ).toBeTruthy();
	} );

	it( 'marks only the open note row with the active highlight', () => {
		const store = initStore();
		store.dispatch(
			actions.notes.addNotes( [ makeNote( 300, 'Open me' ), makeNote( 301, 'Other note' ) ] )
		);
		store.dispatch( actions.ui.loadedNotes() );

		const { container } = renderTab( store, 'all' as FilterName, {}, '300' );

		const active = container.querySelectorAll( '.wpnc__subject.is-active' );
		expect( active ).toHaveLength( 1 );
		expect( active[ 0 ].textContent ).toContain( 'Open me' );
	} );
} );
