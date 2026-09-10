import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { init as initAPI } from '../../../panel/rest-client/wpcom';
import { init as initStore } from '../../../panel/state';
import actions from '../../../panel/state/actions';
import { AppProvider } from '../../context';
import NotePanel from '../index';
import type { FilterName } from '../../types';

const noop = () => {};

const defaultProps = {
	filterName: 'all' as FilterName,
	setFilterName: noop,
	selectedNoteId: undefined,
	setSelectedNoteId: noop,
};

const renderPanel = ( { isViewSettingsEnabled }: { isViewSettingsEnabled: boolean } ) => {
	const store = initStore();
	const post = jest.fn( () => Promise.resolve( {} ) );
	initAPI( { req: { post } } );

	render(
		<Provider store={ store }>
			<AppProvider client={ null } locale="en" isViewSettingsEnabled={ isViewSettingsEnabled }>
				<NotePanel { ...defaultProps } />
			</AppProvider>
		</Provider>
	);

	return { store, post };
};

describe( 'NotePanel view picker', () => {
	it( 'is not offered when the host has not enabled view settings', () => {
		renderPanel( { isViewSettingsEnabled: false } );

		expect(
			screen.queryByRole( 'button', { name: 'Add or remove views' } )
		).not.toBeInTheDocument();
	} );

	it( 'lists every view, with the pinned ones locked on', async () => {
		renderPanel( { isViewSettingsEnabled: true } );

		await userEvent.click( screen.getByRole( 'button', { name: 'Add or remove views' } ) );

		expect( screen.getByRole( 'checkbox', { name: 'All' } ) ).toBeDisabled();
		expect( screen.getByRole( 'checkbox', { name: 'Unread' } ) ).toBeDisabled();
		expect( screen.getByRole( 'checkbox', { name: 'Likes' } ) ).toBeChecked();
		expect( screen.getByRole( 'checkbox', { name: 'Store' } ) ).not.toBeChecked();
	} );

	it( 'adds a view to the tab strip and saves the whole list', async () => {
		const { post } = renderPanel( { isViewSettingsEnabled: true } );

		expect( screen.queryByRole( 'tab', { name: 'Store' } ) ).not.toBeInTheDocument();

		await userEvent.click( screen.getByRole( 'button', { name: 'Add or remove views' } ) );
		await userEvent.click( screen.getByRole( 'checkbox', { name: 'Store' } ) );

		expect( await screen.findByRole( 'tab', { name: 'Store' } ) ).toBeVisible();

		await waitFor( () => {
			expect( post ).toHaveBeenCalled();
		} );

		const [ , , body ] = post.mock.calls[ 0 ] as unknown[];
		const saved = ( body as { calypso_preferences: { 'notifications-views': unknown } } )
			.calypso_preferences[ 'notifications-views' ];

		// The whole resolved list is written, so the order survives the round trip.
		expect( saved ).toEqual( expect.arrayContaining( [ { name: 'store', hidden: false } ] ) );
		expect( saved ).toHaveLength( 8 );
	} );

	it( 'removes a view from the tab strip', async () => {
		const { store } = renderPanel( { isViewSettingsEnabled: true } );
		store.dispatch( actions.ui.setViews( [ { name: 'likes', hidden: false } ] ) );

		await userEvent.click( screen.getByRole( 'button', { name: 'Add or remove views' } ) );
		await userEvent.click( screen.getByRole( 'checkbox', { name: 'Likes' } ) );

		await waitFor( () => {
			expect( screen.queryByRole( 'tab', { name: 'Likes' } ) ).not.toBeInTheDocument();
		} );
	} );
} );
