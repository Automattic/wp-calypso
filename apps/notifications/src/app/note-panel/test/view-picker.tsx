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
		expect( await screen.findByText( 'New' ) ).toBeVisible();

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

		// The menu opens a tick after the click, so wait for its contents before
		// concluding that the layout options are absent.
		expect(
			await screen.findByRole( 'menuitem', { name: /Notification settings/ } )
		).toHaveAttribute( 'href', 'https://wordpress.com/me/notifications' );
		expect( screen.queryByRole( 'menuitemradio', { name: 'Simplified' } ) ).not.toBeInTheDocument();
	} );

	it( 'opens the settings link in a new tab and says so', async () => {
		renderPanel( { isViewSettingsEnabled: true } );

		await userEvent.click( screen.getByRole( 'button', { name: /^Settings/ } ) );

		// The link has to be the menu item itself: wrapping an anchor in one puts the
		// label and the new-tab arrow outside the slots the item lays out.
		const link = await screen.findByRole( 'menuitem', {
			name: 'Notification settings (opens in a new tab)',
		} );
		expect( link.tagName ).toBe( 'A' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveAttribute( 'rel', 'noopener noreferrer' );
	} );

	it( 'marks the saved layout and saves a new one', async () => {
		const { post } = renderPanel( { isViewSettingsEnabled: true } );

		await userEvent.click( screen.getByRole( 'button', { name: /^Settings/ } ) );

		expect( await screen.findByRole( 'menuitemradio', { name: 'Classic' } ) ).toHaveAttribute(
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
