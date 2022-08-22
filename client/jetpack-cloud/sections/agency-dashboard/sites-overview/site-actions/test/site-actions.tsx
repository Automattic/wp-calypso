/**
 * @jest-environment jsdom
 */

import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SiteActions from '../index';
import type { SiteNode } from '../../types';

describe( '<SiteActions>', () => {
	test( 'should render correctly and have href for all the actions', () => {
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

		const { container } = render(
			<Provider store={ store }>
				<SiteActions site={ site } siteError={ false } />
			</Provider>
		);

		const [ button ] = container.getElementsByTagName( 'button' );
		fireEvent.click( button );

		const [ popoverMenu ] = container.parentElement.getElementsByClassName( 'popover__menu' );
		expect( popoverMenu ).toBeInTheDocument();

		const [ issueLicense, viewActivity, viewSite, visitWPAdmin ] =
			popoverMenu.getElementsByClassName( 'site-actions__menu-item' );

		expect( issueLicense ).toHaveProperty(
			'href',
			`https://example.com/partner-portal/issue-license/?site_id=${ site.value.blog_id }&source=dashboard`
		);
		expect( viewActivity ).toHaveProperty(
			'href',
			`https://example.com/activity-log/${ site.value.url }`
		);
		expect( viewSite ).toHaveProperty( 'href', site.value.url_with_scheme );
		expect( visitWPAdmin ).toHaveProperty(
			'href',
			`${ site.value.url_with_scheme }/wp-admin/admin.php?page=jetpack#/dashboard`
		);
	} );
} );
