import { render, screen, waitFor, within } from '@testing-library/react';
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

// The placement class sits on the dropdown wrapper, not the button inside it.
const pickerWrapper = () =>
	screen.getByRole( 'button', { name: 'Add or remove views' } ).closest( '.wpnc-app__view-picker' );

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

describe( 'NotePanel view picker placement', () => {
	// Five tabs already fill the panel, so the picker stops trailing the last one.
	it( 'sits at the panel edge with the default five views', () => {
		renderPanel( { isViewSettingsEnabled: true } );

		expect( pickerWrapper() ).toHaveClass( 'is-at-edge' );
	} );

	it( 'trails the last tab once a view is hidden', async () => {
		const { store } = renderPanel( { isViewSettingsEnabled: true } );
		store.dispatch( actions.ui.setViews( [ { name: 'likes', hidden: true } ] ) );

		await waitFor( () => {
			expect( pickerWrapper() ).not.toHaveClass( 'is-at-edge' );
		} );
	} );
} );

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

		const rows = within( screen.getByRole( 'list' ) );

		// Pinned views have nothing to press, so they are not buttons at all.
		expect( rows.queryByRole( 'button', { name: 'All' } ) ).not.toBeInTheDocument();
		expect( rows.queryByRole( 'button', { name: 'Unread' } ) ).not.toBeInTheDocument();
		expect( rows.getByText( 'All' ) ).toBeInTheDocument();
		expect( rows.getByText( 'Unread' ) ).toBeInTheDocument();

		expect( rows.getByRole( 'button', { name: 'Likes' } ) ).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		expect( rows.getByRole( 'button', { name: 'Store' } ) ).toHaveAttribute(
			'aria-pressed',
			'false'
		);
	} );

	it( 'adds a view to the tab strip and saves the whole list', async () => {
		const { post } = renderPanel( { isViewSettingsEnabled: true } );

		expect( screen.queryByRole( 'tab', { name: 'Store' } ) ).not.toBeInTheDocument();

		await userEvent.click( screen.getByRole( 'button', { name: 'Add or remove views' } ) );
		await userEvent.click( screen.getByRole( 'button', { name: 'Store' } ) );

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
		await userEvent.click( screen.getByRole( 'button', { name: 'Likes' } ) );

		await waitFor( () => {
			expect( screen.queryByRole( 'tab', { name: 'Likes' } ) ).not.toBeInTheDocument();
		} );
	} );
} );
