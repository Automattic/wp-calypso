/**
 * @jest-environment jsdom
 */

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SiteActions from '../index';
import type { SiteNode } from '../../types';

const Wrapper = () => {
	const siteObj = {
		blog_id: 1234,
		url: 'test.jurassic.ninja',
		url_with_scheme: 'https://test.jurassic.ninja/',
		monitor_active: false,
		monitor_site_status: false,
		has_scan: true,
		has_backup: false,
		latest_scan_threats_found: [],
		latest_backup_status: '',
		is_connection_healthy: true,
		awaiting_plugin_updates: [],
		is_favorite: false,
	};
	const site: SiteNode = {
		value: siteObj,
		error: false,
		type: 'site',
		status: '',
	};
	const initialState = {};
	const mockStore = configureStore();
	const store = mockStore( initialState );

	return (
		<Provider store={ store }>
			<SiteActions site={ site } siteError={ false } />
		</Provider>
	);
};

const openPopoverMenu = async () => {
	await act( async () => {
		const user = userEvent.setup();
		const button = screen.getByRole( 'button' );
		await user.click( button );
	} );
};

describe( '<SiteActions>', () => {
	test( 'renders a popover menu item to issue a new license', async () => {
		render( <Wrapper /> );
		await openPopoverMenu();

		const issueLicense = screen.getByRole( 'menuitem', { name: 'Issue new license' } );
		expect( issueLicense.getAttribute( 'href' ) ).toEqual(
			'/partner-portal/issue-license/?site_id=1234&source=dashboard'
		);
	} );

	test( 'renders a popover menu item to view the activity log', async () => {
		render( <Wrapper /> );
		await openPopoverMenu();

		const viewActivity = screen.getByRole( 'menuitem', { name: 'View activity' } );
		expect( viewActivity.getAttribute( 'href' ) ).toEqual( '/activity-log/test.jurassic.ninja' );
	} );

	test( 'renders a popover menu item to view the site', async () => {
		render( <Wrapper /> );
		await openPopoverMenu();

		const viewSite = screen.getByRole( 'menuitem', { name: 'View site (opens in a new tab)' } );
		expect( viewSite.getAttribute( 'href' ) ).toEqual( 'https://test.jurassic.ninja/' );
	} );

	test( "renders a popover menu item to visit the site's wp-admin", async () => {
		render( <Wrapper /> );
		await openPopoverMenu();

		const visitWpAdmin = screen.getByRole( 'menuitem', {
			name: 'Visit WP Admin (opens in a new tab)',
		} );
		expect( visitWpAdmin.getAttribute( 'href' ) ).toEqual(
			'https://test.jurassic.ninja/wp-admin/admin.php?page=jetpack#/dashboard'
		);
	} );
} );
