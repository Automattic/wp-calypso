/**
 * @vitest-environment jsdom
 */
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { vi } from 'vitest';
import { init as initStore } from '../../../panel/state';
import actions from '../../../panel/state/actions';
import { AppProvider } from '../../context';
import NoteList from '../index';
import type { FilterName } from '../../types';

const ERROR_MESSAGE = 'Notifications unavailable';

const noop = () => {};

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

const renderTab = ( store: ReturnType< typeof initStore >, filterName: FilterName = 'all' ) => {
	const client = {
		hasMoreNotes: () => false,
		loadMore: noop,
		setFilter: noop,
		retryLoad: vi.fn(),
	};
	const view = render(
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
	return { ...view, client };
};

describe( 'NoteList when the first load fails', () => {
	beforeAll( () => {
		Element.prototype.scrollIntoView = noop;
	} );

	it( 'replaces the spinner with an error and announces it', async () => {
		const store = initStore();
		const { container } = renderTab( store );
		expect( container.querySelector( '.components-spinner' ) ).toBeTruthy();

		act( () => {
			store.dispatch( actions.ui.loadNotesFailed() );
		} );

		expect( screen.getByText( ERROR_MESSAGE ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Try again' } ) ).toBeVisible();
		expect( container.querySelector( '.components-spinner' ) ).toBeNull();
		await waitFor( () =>
			expect( screen.getByRole( 'status' ) ).toHaveTextContent( ERROR_MESSAGE )
		);
	} );

	it( 'tries again once per click', async () => {
		const user = userEvent.setup();
		const store = initStore();
		store.dispatch( actions.ui.loadNotesFailed() );
		const { client } = renderTab( store );

		await user.click( screen.getByRole( 'button', { name: 'Try again' } ) );

		expect( client.retryLoad ).toHaveBeenCalledTimes( 1 );
		expect( client.retryLoad ).toHaveBeenCalledWith( 'all' );
	} );

	it( 'announces an error that was already there when the list opened', async () => {
		const store = initStore();
		store.dispatch( actions.ui.loadNotesFailed() );

		renderTab( store );

		await waitFor( () =>
			expect( screen.getByRole( 'status' ) ).toHaveTextContent( ERROR_MESSAGE )
		);
	} );

	it( 'moves focus to the first note when a retry brings the notes', async () => {
		const user = userEvent.setup();
		const store = initStore();
		store.dispatch( actions.ui.loadNotesFailed() );
		const { container } = renderTab( store );

		await user.click( await screen.findByRole( 'button', { name: 'Try again' } ) );
		act( () => {
			store.dispatch( actions.notes.addNotes( [ makeNote( 801, 'A comment' ) ] ) );
			store.dispatch( actions.ui.loadedNotes() );
		} );

		expect( container.querySelector( '.dataviews-view-list__item' ) ).toHaveFocus();
	} );

	it( 'keeps the error up, with the button busy, while a retry is in flight', () => {
		const store = initStore();
		store.dispatch( actions.ui.loadNotesFailed() );
		renderTab( store );

		act( () => {
			store.dispatch( actions.ui.loadNotes() );
		} );

		expect( screen.getByText( ERROR_MESSAGE ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Try again' } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
	} );

	it( 'shows the notes once a load succeeds', () => {
		const store = initStore();
		store.dispatch( actions.ui.loadNotesFailed() );
		renderTab( store );

		act( () => {
			store.dispatch( actions.notes.addNotes( [ makeNote( 801, 'A comment' ) ] ) );
			store.dispatch( actions.ui.loadedNotes() );
		} );

		expect( screen.getByText( 'A comment' ) ).toBeVisible();
		expect( screen.queryByText( ERROR_MESSAGE ) ).not.toBeInTheDocument();
	} );

	it( 'shows the error over notes that another tab loaded', () => {
		const store = initStore();
		store.dispatch( actions.ui.loadNotesFailed() );
		store.dispatch( actions.notes.addNotes( [ makeNote( 801, 'A comment' ) ] ) );
		store.dispatch( actions.notes.setFilteredNoteIds( 'comments', [ 801 ] ) );
		store.dispatch( actions.ui.loadedNotes( { filter: 'comments' } ) );

		renderTab( store );

		expect( screen.getByText( ERROR_MESSAGE ) ).toBeVisible();
		expect( screen.queryByText( 'A comment' ) ).not.toBeInTheDocument();
	} );

	it( 'shows a filtered tab’s error on that tab only', () => {
		const store = initStore();
		store.dispatch( actions.notes.addNotes( [ makeNote( 801, 'A comment' ) ] ) );
		store.dispatch( actions.ui.loadedNotes() );
		store.dispatch( actions.ui.loadNotesFailed( { filter: 'unread' } ) );

		const allTab = renderTab( store );
		expect( screen.getByText( 'A comment' ) ).toBeVisible();
		expect( screen.queryByText( ERROR_MESSAGE ) ).not.toBeInTheDocument();
		allTab.unmount();

		renderTab( store, 'unread' as FilterName );
		expect( screen.getByText( ERROR_MESSAGE ) ).toBeVisible();
	} );
} );
