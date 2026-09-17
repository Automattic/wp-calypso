import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
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
	const onPreferenceChange = jest.fn( () => Promise.resolve() );

	render(
		<Provider store={ store }>
			<AppProvider
				client={ null }
				locale="en"
				isViewSettingsEnabled={ isViewSettingsEnabled }
				onPreferenceChange={ onPreferenceChange }
			>
				<NotePanel { ...defaultProps } />
			</AppProvider>
		</Provider>
	);

	return { store, onPreferenceChange };
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

		const row = ( name: string ) => screen.getByRole( 'menuitemcheckbox', { name } );

		// Pinned views stay checked and cannot be unchecked, but remain reachable.
		// `aria-disabled`, not the native attribute, so the row is still reachable and
		// still announces its checked state.
		expect( await screen.findByRole( 'menuitemcheckbox', { name: 'All' } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
		expect( row( 'All' ) ).toHaveAttribute( 'aria-checked', 'true' );
		expect( row( 'Unread' ) ).toHaveAttribute( 'aria-disabled', 'true' );

		expect( row( 'Likes' ) ).toHaveAttribute( 'aria-checked', 'true' );
		expect( row( 'Likes' ) ).not.toHaveAttribute( 'aria-disabled', 'true' );
		expect( row( 'Store' ) ).toHaveAttribute( 'aria-checked', 'false' );
	} );

	it( 'adds a view to the tab strip and saves the whole list', async () => {
		const { onPreferenceChange } = renderPanel( { isViewSettingsEnabled: true } );

		expect( screen.queryByRole( 'tab', { name: 'Store' } ) ).not.toBeInTheDocument();

		await userEvent.click( screen.getByRole( 'button', { name: 'Add or remove views' } ) );
		await userEvent.click( await screen.findByRole( 'menuitemcheckbox', { name: 'Store' } ) );

		expect( await screen.findByRole( 'tab', { name: 'Store' } ) ).toBeVisible();

		await waitFor( () => {
			expect( onPreferenceChange ).toHaveBeenCalled();
		} );

		const [ key, saved ] = onPreferenceChange.mock.calls[ 0 ] as unknown[];
		expect( key ).toBe( 'notifications-views' );

		// The whole resolved list is written, so the order survives the round trip.
		expect( saved ).toEqual( expect.arrayContaining( [ { name: 'store', hidden: false } ] ) );
		expect( saved ).toHaveLength( 8 );
	} );

	it( 'removes a view from the tab strip', async () => {
		const { store } = renderPanel( { isViewSettingsEnabled: true } );
		store.dispatch( actions.ui.setViews( [ { name: 'likes', hidden: false } ] ) );

		await userEvent.click( screen.getByRole( 'button', { name: 'Add or remove views' } ) );
		await userEvent.click( await screen.findByRole( 'menuitemcheckbox', { name: 'Likes' } ) );

		await waitFor( () => {
			expect( screen.queryByRole( 'tab', { name: 'Likes' } ) ).not.toBeInTheDocument();
		} );
	} );
} );
