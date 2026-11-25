import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { recordTracksEvent } from '../../panel/helpers/stats';
import { store, init as initState } from '../../panel/state';
import actions from '../../panel/state/actions';
import NotificationApp from '../index';

vi.mock( '../../panel/helpers/stats', () => ( { recordTracksEvent: vi.fn() } ) );
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

const loadNote = ( id: number, label: string ) => {
	store.dispatch(
		actions.notes.addNotes( [
			{
				id,
				type: 'comment',
				read: 0,
				noticon: '',
				timestamp: '2026-06-01T00:00:00+00:00',
				title: `${ label } title`,
				subject: [ { text: label, ranges: [], media: [] } ],
				body: [],
			},
		] )
	);
	store.dispatch( actions.ui.loadedNotes() );
};

// Opens a note from the list and returns the pane it opens in. The list stays mounted behind it.
const openNote = async ( user: ReturnType< typeof userEvent.setup >, label: string ) => {
	await user.click( await screen.findByRole( 'button', { name: label } ) );
	const heading = await screen.findByRole( 'heading', { name: `${ label } title` } );
	return within( heading.closest( '.wpnc-app__detail-pane' ) as HTMLElement );
};

describe( 'NotificationApp full view', () => {
	beforeAll( () => {
		Element.prototype.scrollIntoView = () => {};
	} );

	beforeEach( () => {
		initState();
		vi.mocked( recordTracksEvent ).mockClear();
	} );

	it( 'opens the full view on the open note', async () => {
		const user = userEvent.setup();
		const onOpenFullView = vi.fn();
		loadNote( 801, 'First comment' );
		render( <NotificationApp wpcom={ {} } onOpenFullView={ onOpenFullView } /> );

		await openNote( user, 'First comment' );
		await user.click( screen.getByRole( 'button', { name: 'Open full view' } ) );

		expect( onOpenFullView ).toHaveBeenCalledWith( { filterName: 'all', noteId: '801' } );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_notification_full_view_click', {
			tab: 'all',
			is_note_open: true,
		} );
	} );
} );
