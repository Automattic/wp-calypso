/**
 * @vitest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { vi } from 'vitest';
import { init as initStore } from '../../state';
import actions from '../../state/actions';
import FilterBarController from '../filter-bar-controller';
import NoteList from '../note-list';

const ERROR_MESSAGE = 'Couldn’t load your notifications.';

const noop = () => {};

const renderNoteList = ( store ) => {
	const client = { loadMore: noop, retryLoad: vi.fn() };
	const view = render(
		<Provider store={ store }>
			<NoteList
				client={ client }
				filterController={ FilterBarController( noop ) }
				global={ {} }
				height={ 600 }
				initialLoad
				notes={ [] }
				closePanel={ noop }
				navigateToNoteById={ noop }
			/>
		</Provider>
	);
	return { ...view, client };
};

describe( 'Legacy NoteList when the first load fails', () => {
	it( 'replaces the spinner with an error and a button that tries again', async () => {
		const user = userEvent.setup();
		const store = initStore();
		const { container, client } = renderNoteList( store );
		expect( container.querySelector( '.wpnc__loading-indicator' ) ).toBeTruthy();

		act( () => {
			store.dispatch( actions.ui.loadNotesFailed() );
		} );

		expect( screen.getByText( ERROR_MESSAGE ) ).toBeVisible();
		expect( container.querySelector( '.wpnc__loading-indicator' ) ).toBeNull();
		// The error sits in the list, so the tabs stay.
		expect( screen.getByRole( 'radio', { name: 'Unread' } ) ).toBeVisible();

		await user.click( screen.getByRole( 'button', { name: 'Try again' } ) );
		expect( client.retryLoad ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'keeps the error up, with the button busy, while a retry is in flight', () => {
		const store = initStore();
		store.dispatch( actions.ui.loadNotesFailed() );
		const { container } = renderNoteList( store );

		act( () => {
			store.dispatch( actions.ui.loadNotes() );
		} );

		expect( screen.getByText( ERROR_MESSAGE ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Try again' } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
		expect( container.querySelector( '.wpnc__loading-indicator' ) ).toBeNull();
	} );

	it( 'removes the error once a load succeeds', () => {
		const store = initStore();
		store.dispatch( actions.ui.loadNotesFailed() );
		renderNoteList( store );

		act( () => {
			store.dispatch( actions.ui.loadedNotes() );
		} );

		expect( screen.queryByText( ERROR_MESSAGE ) ).not.toBeInTheDocument();
	} );
} );
