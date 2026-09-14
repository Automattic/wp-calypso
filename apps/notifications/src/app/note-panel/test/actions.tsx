import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { init as initStore } from '../../../panel/state';
import actions from '../../../panel/state/actions';
import { addListeners } from '../../../panel/state/create-listener-middleware';
import { AppProvider } from '../../context';
import NotePanel from '../index';
import type { FilterName } from '../../types';

const noop = () => {};

const tkq = () => ( window as unknown as { _tkq: unknown[] } )._tkq;

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

describe( 'NotePanel settings menu', () => {
	it( 'marks the gear as new until the menu is opened', async () => {
		const { onPreferenceChange, store } = renderPanel( { isViewSettingsEnabled: true } );
		store.dispatch( actions.ui.setViewSettingsSeen( false ) );

		const gear = await screen.findByRole( 'button', { name: 'Settings (new)' } );
		expect( gear ).toHaveClass( 'is-new' );

		await userEvent.click( gear );

		await waitFor( () => {
			expect( onPreferenceChange ).toHaveBeenCalledWith( 'notifications-view-settings-seen', true );
		} );

		// The dot clears on open, so the menu carries the label that says what is new.
		expect( screen.getByText( 'New' ) ).toBeVisible();

		// The open menu makes the rest of the tree inert, so close it before looking again.
		await userEvent.keyboard( '{Escape}' );

		expect( screen.getByRole( 'button', { name: 'Settings' } ) ).not.toHaveClass( 'is-new' );
	} );

	it( 'asks the host for the settings page when view settings are off', async () => {
		const { store } = renderPanel( { isViewSettingsEnabled: false } );
		// Hosts listen for VIEW_SETTINGS and open the settings page; listen the same way.
		const onViewSettings = jest.fn();
		store.dispatch( addListeners( { VIEW_SETTINGS: [ onViewSettings ] } ) );

		await userEvent.click( screen.getByRole( 'button', { name: 'Settings' } ) );

		// With no layout setting there is nothing worth opening a menu for, so the gear
		// does what it did before: hands off to the host, which shows the settings page.
		expect( onViewSettings ).toHaveBeenCalled();
		expect( screen.queryByRole( 'menuitemradio', { name: 'Simplified' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'menuitem' ) ).not.toBeInTheDocument();
	} );

	it( 'offers the layout options when the host has enabled view settings', async () => {
		renderPanel( { isViewSettingsEnabled: true } );

		await userEvent.click( screen.getByRole( 'button', { name: /^Settings/ } ) );

		expect( await screen.findByRole( 'menuitemradio', { name: 'Classic' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'menuitemradio', { name: 'Simplified' } ) ).toBeInTheDocument();
	} );

	it( 'hands the settings link to the host as well', async () => {
		const { store } = renderPanel( { isViewSettingsEnabled: true } );
		const onViewSettings = jest.fn();
		store.dispatch( addListeners( { VIEW_SETTINGS: [ onViewSettings ] } ) );

		await userEvent.click( screen.getByRole( 'button', { name: /^Settings/ } ) );
		await userEvent.click(
			await screen.findByRole( 'menuitem', { name: /Notification settings/ } )
		);

		// Not a hardcoded URL: each host knows which dashboard the settings live on.
		expect( onViewSettings ).toHaveBeenCalled();
	} );

	it( 'records opening the menu and switching layout', async () => {
		( window as unknown as { _tkq: unknown[] } )._tkq = [];
		renderPanel( { isViewSettingsEnabled: true } );

		await userEvent.click( screen.getByRole( 'button', { name: /^Settings/ } ) );
		await userEvent.click( await screen.findByRole( 'menuitemradio', { name: 'Simplified' } ) );

		expect( tkq() ).toEqual( [
			[ 'recordEvent', 'calypso_notification_settings_menu_open', undefined ],
			[
				'recordEvent',
				'calypso_notification_layout_style_change',
				{ from: 'classic', to: 'simplified' },
			],
		] );
	} );

	it( 'marks the saved layout and saves a new one', async () => {
		const { onPreferenceChange } = renderPanel( { isViewSettingsEnabled: true } );

		await userEvent.click( screen.getByRole( 'button', { name: /^Settings/ } ) );

		expect( screen.getByRole( 'menuitemradio', { name: 'Classic' } ) ).toHaveAttribute(
			'aria-checked',
			'true'
		);

		await userEvent.click( screen.getByRole( 'menuitemradio', { name: 'Simplified' } ) );

		await waitFor( () => {
			expect( onPreferenceChange ).toHaveBeenCalledWith(
				'notifications-layout-style',
				'simplified'
			);
		} );
	} );
} );
