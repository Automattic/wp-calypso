/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { hideMasterbar, showMasterbar } from 'calypso/state/ui/masterbar-visibility/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import StudioSyncConnect from '../sync-connect';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	...jest.requireActual( 'calypso/lib/analytics/tracks' ),
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/components/data/query-sites', () => () => null );

const STUDIO_SITE_ID = 'b419d647-95e0-4b32-95fc-6ee255aa465d';
const SITE_ID = 123;
const PARAMS = { studioSiteId: STUDIO_SITE_ID, remoteSiteId: SITE_ID, autoOpenPush: true };
const EXPECTED_DEEP_LINK = `wp-studio://sync-connect-site?studioSiteId=${ STUDIO_SITE_ID }&remoteSiteId=${ SITE_ID }&autoOpenPush=true`;

const siteInState = {
	sites: {
		items: {
			[ SITE_ID ]: {
				ID: SITE_ID,
				options: { admin_url: 'https://example.wpcomstaging.com/wp-admin/' },
			},
		},
	},
};

const setVisibility = ( visibilityState: DocumentVisibilityState ) =>
	Object.defineProperty( document, 'visibilityState', {
		configurable: true,
		get: () => visibilityState,
	} );

describe( 'StudioSyncConnect', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		setVisibility( 'visible' );
		Object.defineProperty( window, 'location', {
			value: { href: 'https://wordpress.com/checkout/studio-return' },
			writable: true,
		} );
	} );

	it( 'opens Studio on mount without waiting for a click', () => {
		renderWithProvider( <StudioSyncConnect { ...PARAMS } /> );

		expect( window.location.href ).toBe( EXPECTED_DEEP_LINK );
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_studio_sync_connect_site', {
			click: false,
			blog_id: SITE_ID,
			studio_site_id: STUDIO_SITE_ID,
			source: 'studio_return_page',
			auto_open_push: true,
			visibility: 'visible',
		} );
	} );

	it( 'does not open Studio again on re-render', () => {
		const { rerender } = renderWithProvider( <StudioSyncConnect { ...PARAMS } /> );

		rerender( <StudioSyncConnect { ...PARAMS } /> );

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'opens once from a background tab and records it as hidden', () => {
		setVisibility( 'hidden' );
		renderWithProvider( <StudioSyncConnect { ...PARAMS } /> );

		setVisibility( 'visible' );
		document.dispatchEvent( new Event( 'visibilitychange' ) );

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_studio_sync_connect_site',
			expect.objectContaining( { visibility: 'hidden' } )
		);
	} );

	it( 're-opens Studio from the button, recording it as a click', async () => {
		renderWithProvider( <StudioSyncConnect { ...PARAMS } /> );

		// The mount effect already navigated; reset so the click is observable on its own.
		window.location.href = 'https://wordpress.com/checkout/studio-return';

		await userEvent.click( screen.getByRole( 'button', { name: 'Open Studio' } ) );

		expect( window.location.href ).toBe( EXPECTED_DEEP_LINK );
		expect( recordTracksEvent ).toHaveBeenLastCalledWith(
			'calypso_studio_sync_connect_site',
			expect.objectContaining( { click: true } )
		);
	} );

	it( 'links to the site’s wp-admin Dashboard once the site is loaded', () => {
		renderWithProvider( <StudioSyncConnect { ...PARAMS } />, { initialState: siteInState } );

		expect( screen.getByRole( 'link', { name: /dashboard/i } ) ).toHaveAttribute(
			'href',
			'https://example.wpcomstaging.com/wp-admin/index.php'
		);
	} );

	it( 'links to /sites while the site is not loaded', () => {
		renderWithProvider( <StudioSyncConnect { ...PARAMS } /> );

		expect( screen.getByRole( 'link', { name: /dashboard/i } ) ).toHaveAttribute(
			'href',
			'/sites'
		);
	} );

	it( 'leaves autoOpenPush out of the link and the event when auto-push is off', () => {
		renderWithProvider( <StudioSyncConnect { ...PARAMS } autoOpenPush={ false } /> );

		expect( window.location.href ).not.toContain( 'autoOpenPush' );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_studio_sync_connect_site',
			expect.objectContaining( { auto_open_push: false } )
		);
	} );

	// Checkout's masterbar has a close button that would drop the user on the plans page.
	it( 'hides the masterbar while mounted and restores it on the way out', () => {
		const store = configureStore( [ thunk ] )( { sites: { items: {} } } );
		const { unmount } = renderWithProvider( <StudioSyncConnect { ...PARAMS } />, { store } );

		expect( store.getActions() ).toContainEqual( hideMasterbar() );
		expect( store.getActions() ).not.toContainEqual( showMasterbar() );

		unmount();

		expect( store.getActions() ).toContainEqual( showMasterbar() );
	} );
} );
