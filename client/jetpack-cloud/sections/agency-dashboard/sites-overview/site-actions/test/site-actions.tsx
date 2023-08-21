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

const createFakeSite = ( changes = {} ) => ( {
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
	...changes,
} );

const Wrapper = ( { site = createFakeSite(), siteError = false } ) => {
	const siteData: SiteNode = {
		value: site,
		error: false,
		type: 'site',
		status: '',
	};
	const initialState = {};
	const mockStore = configureStore();
	const store = mockStore( initialState );

	return (
		<Provider store={ store }>
			<SiteActions site={ siteData } siteError={ siteError } />
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
	test( 'renders a popover menu when the button is clicked', async () => {
		render( <Wrapper /> );

		expect( screen.queryByRole( 'menu' ) ).not.toBeInTheDocument();

		await openPopoverMenu();
		expect( screen.queryByRole( 'menu' ) ).toBeInTheDocument();
	} );

	test( 'renders a popover menu item to issue a new license', async () => {
		render( <Wrapper /> );
		await openPopoverMenu();

		const issueLicense = screen.getByRole( 'menuitem', { name: 'Issue new license' } );
		expect( issueLicense.getAttribute( 'href' ) ).toEqual(
			'/partner-portal/issue-license/?site_id=1234&source=dashboard'
		);
	} );

	test( 'does not render a popover menu item to issue a new license if there is a site error', async () => {
		render( <Wrapper siteError /> );
		await openPopoverMenu();

		expect(
			screen.queryByRole( 'menuitem', { name: 'Issue new license' } )
		).not.toBeInTheDocument();
	} );

	test( 'renders a popover menu item to view the activity log', async () => {
		render( <Wrapper /> );
		await openPopoverMenu();

		const viewActivity = screen.getByRole( 'menuitem', { name: 'View activity' } );
		expect( viewActivity.getAttribute( 'href' ) ).toEqual( '/activity-log/test.jurassic.ninja' );
	} );

	test( 'does not render a popover menu item to view the activity log if there is a site error', async () => {
		render( <Wrapper siteError /> );
		await openPopoverMenu();

		expect( screen.queryByRole( 'menuitem', { name: 'View activity' } ) ).not.toBeInTheDocument();
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

	test( 'renders a popover menu item to copy the site if the site has Backup', async () => {
		render( <Wrapper site={ createFakeSite( { has_backup: true } ) } /> );
		await openPopoverMenu();

		const copyThisSite = screen.getByRole( 'menuitem', {
			name: 'Copy this site',
		} );
		expect( copyThisSite.getAttribute( 'href' ) ).toEqual( '/backup/test.jurassic.ninja/clone' );
	} );

	test( 'renders a popover menu item to view site settings if the site has Backup', async () => {
		render( <Wrapper site={ createFakeSite( { has_backup: true } ) } /> );
		await openPopoverMenu();

		const siteSettings = screen.getByRole( 'menuitem', {
			name: 'Site settings',
		} );
		expect( siteSettings.getAttribute( 'href' ) ).toEqual( '/settings/test.jurassic.ninja' );
	} );
} );
