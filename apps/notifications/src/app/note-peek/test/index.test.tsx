/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { vi } from 'vitest';
import { recordTracksEvent } from '../../../panel/helpers/stats';
import { init as initStore } from '../../../panel/state';
import actions from '../../../panel/state/actions';
import { AppProvider } from '../../context';
import NoteList from '../../note-list';
import type { FilterName } from '../../types';

vi.mock( '../../../panel/helpers/stats', () => ( { recordTracksEvent: vi.fn() } ) );
// The preview only shows on wide screens; jsdom matches no media query.
vi.mock( '@wordpress/compose', async ( importOriginal ) => ( {
	...( await importOriginal< typeof import( '@wordpress/compose' ) >() ),
	useViewportMatch: () => true,
} ) );

const noop = () => {};
const client = { hasMoreNotes: () => false, loadMore: noop, setFilter: noop };

const COMMENT =
	'Checked them against the harbour office, and you are right: the spring tides are an hour out.';

const commentNote = {
	id: 1,
	type: 'comment',
	read: 0,
	noticon: '',
	timestamp: '2026-06-01T00:00:00+00:00',
	title: 'Comment title',
	subject: [
		{ text: 'Ben Quah commented on The tide tables', ranges: [], media: [] },
		{ text: 'Checked them against the harbour office…', ranges: [], media: [] },
	],
	body: [
		{ text: 'Ben Quah', ranges: [], media: [], type: 'user' },
		{ text: COMMENT, ranges: [], media: [], type: 'comment' },
	],
	meta: {
		summary: { text: 'Ben Quah commented', ranges: [] },
		site: { name: 'Harbour Notes', icon: '' },
		post: { title: 'The tide tables', url: '', date: null, author_name: '' },
		actor: { name: 'Ben Quah', avatar: '' },
	},
};

const renderList = ( {
	isPeekEnabled = true,
	selectedNoteId,
}: { isPeekEnabled?: boolean; selectedNoteId?: string } = {} ) => {
	const store = initStore();
	store.dispatch( actions.notes.addNotes( [ commentNote ] ) );
	store.dispatch( actions.ui.loadedNotes() );

	return render(
		<Provider store={ store }>
			<AppProvider
				client={ client as never }
				locale="en"
				isViewSettingsEnabled
				isPeekEnabled={ isPeekEnabled }
			>
				<NoteList
					filterName={ 'all' as FilterName }
					selectedNoteId={ selectedNoteId }
					setSelectedNoteId={ noop }
				/>
			</AppProvider>
		</Provider>
	);
};

const hoverRow = ( user: ReturnType< typeof userEvent.setup > ) =>
	user.hover( screen.getByText( 'Ben Quah commented' ) );

describe( 'NotePeek', () => {
	beforeAll( () => {
		Element.prototype.scrollIntoView = noop;
	} );

	beforeEach( () => {
		vi.mocked( recordTracksEvent ).mockClear();
	} );

	it( 'previews the whole comment after the pointer rests on its row', async () => {
		const user = userEvent.setup();
		renderList();

		await hoverRow( user );

		expect( await screen.findByText( COMMENT ) ).toBeVisible();
		expect( screen.getByText( 'Harbour Notes' ) ).toBeVisible();
		expect( screen.getByText( 'The tide tables' ) ).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_notification_peek', {
			note_type: 'comment',
		} );
	} );

	it( 'closes the preview on Escape', async () => {
		const user = userEvent.setup();
		renderList();

		await hoverRow( user );
		await screen.findByText( COMMENT );
		await user.keyboard( '{Escape}' );

		await waitFor( () => expect( screen.queryByText( COMMENT ) ).not.toBeInTheDocument() );
	} );

	it( 'closes the preview when the pointer leaves the list', async () => {
		const user = userEvent.setup();
		renderList();

		await hoverRow( user );
		await screen.findByText( COMMENT );
		await user.unhover( screen.getByText( 'Ben Quah commented' ) );

		await waitFor( () => expect( screen.queryByText( COMMENT ) ).not.toBeInTheDocument() );
	} );

	it( 'closes the preview while the list scrolls', async () => {
		const user = userEvent.setup();
		const { container } = renderList();

		await hoverRow( user );
		await screen.findByText( COMMENT );
		// User Event has no scrolling.
		fireEvent.scroll( container.querySelector( '.dataviews-view-list' ) as Element );

		await waitFor( () => expect( screen.queryByText( COMMENT ) ).not.toBeInTheDocument() );
	} );

	it( 'shows no preview without the flag', async () => {
		const user = userEvent.setup();
		renderList( { isPeekEnabled: false } );

		await hoverRow( user );
		await new Promise( ( resolve ) => setTimeout( resolve, 400 ) );

		expect( screen.queryByText( COMMENT ) ).not.toBeInTheDocument();
	} );

	it( 'shows no preview while a note is open beside the list', async () => {
		const user = userEvent.setup();
		renderList( { selectedNoteId: '2' } );

		await hoverRow( user );
		await new Promise( ( resolve ) => setTimeout( resolve, 400 ) );

		expect( screen.queryByText( COMMENT ) ).not.toBeInTheDocument();
	} );
} );
