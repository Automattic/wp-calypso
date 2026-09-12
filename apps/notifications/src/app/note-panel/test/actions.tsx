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

const savedPreference = ( post: jest.Mock, key: string ) => {
	const call = post.mock.calls.find( ( [ , , body ] ) => {
		const prefs = ( body as { calypso_preferences: Record< string, unknown > } )
			.calypso_preferences;
		return key in prefs;
	} );
	return ( call?.[ 2 ] as { calypso_preferences: Record< string, unknown > } ).calypso_preferences;
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

describe( 'NotePanel settings menu', () => {
	it( 'leaves the gear unmarked until the preference has loaded', () => {
		renderPanel( { isViewSettingsEnabled: true } );

		// Nothing has resolved the preference yet, so the dot must not appear and then
		// correct itself a moment later.
		expect( screen.getByRole( 'button', { name: 'Settings' } ) ).not.toHaveClass( 'is-new' );
	} );

	it( 'marks the gear as new until the menu is opened', async () => {
		const { post, store } = renderPanel( { isViewSettingsEnabled: true } );
		store.dispatch( actions.ui.setViewSettingsSeen( false ) );

		const gear = await screen.findByRole( 'button', { name: 'Settings (new)' } );
		expect( gear ).toHaveClass( 'is-new' );

		await userEvent.click( gear );

		await waitFor( () => {
			expect( post ).toHaveBeenCalled();
		} );

		expect( savedPreference( post, 'notifications-view-settings-seen' ) ).toEqual( {
			'notifications-view-settings-seen': true,
		} );

		// The dot clears on open, so the menu carries the label that says what is new.
		expect( screen.getByText( 'New' ) ).toBeVisible();

		// The open menu makes the rest of the tree inert, so close it before looking again.
		await userEvent.keyboard( '{Escape}' );

		expect( screen.getByRole( 'button', { name: 'Settings' } ) ).not.toHaveClass( 'is-new' );
	} );

	it( 'does not mark the gear as new when view settings are off', async () => {
		renderPanel( { isViewSettingsEnabled: false } );

		expect( screen.getByRole( 'button', { name: 'Settings' } ) ).not.toHaveClass( 'is-new' );
	} );

	it( 'offers the layout options only when the host has enabled view settings', async () => {
		renderPanel( { isViewSettingsEnabled: false } );

		await userEvent.click( screen.getByRole( 'button', { name: 'Settings' } ) );

		expect( screen.queryByRole( 'menuitemradio', { name: 'Simplified' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'menuitem', { name: /Notification settings/ } ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/me/notifications'
		);
	} );

	it( 'marks the saved layout and saves a new one', async () => {
		const { post } = renderPanel( { isViewSettingsEnabled: true } );

		await userEvent.click( screen.getByRole( 'button', { name: /^Settings/ } ) );

		expect( screen.getByRole( 'menuitemradio', { name: 'Classic' } ) ).toHaveAttribute(
			'aria-checked',
			'true'
		);

		await userEvent.click( screen.getByRole( 'menuitemradio', { name: 'Simplified' } ) );

		await waitFor( () => {
			expect( post ).toHaveBeenCalled();
		} );

		expect( savedPreference( post, 'notifications-layout-style' ) ).toEqual( {
			'notifications-layout-style': 'simplified',
		} );
	} );
} );
