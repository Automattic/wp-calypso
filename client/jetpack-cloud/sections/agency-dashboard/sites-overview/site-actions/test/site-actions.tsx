/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SiteActions from '../index';
import type { SiteNode } from '../../types';

describe( '<SiteActions>', () => {
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
		status: 'active',
	};
	const mockStore = configureStore();
	const queryClient = new QueryClient();
	let issueLicense: Element | null = null;
	let viewActivity: Element | null = null;
	let viewSite: Element | null = null;
	let visitWPAdmin: Element | null = null;

	test( 'should render correctly and have href for all four available actions', () => {
		const initialState = {
			partnerPortal: {
				partner: {
					current: {
						can_issue_licenses: true,
					},
				},
			},
			a8cForAgencies: {
				agencies: {},
			},
		};
		const store = mockStore( initialState );

		const { container } = render(
			<Provider store={ store }>
				<QueryClientProvider client={ queryClient }>
					<SiteActions site={ site } siteError={ false } />
				</QueryClientProvider>
			</Provider>
		);

		const [ button ] = container.getElementsByTagName( 'button' );
		fireEvent.click( button );

		const popoverMenu = container.parentElement?.getElementsByClassName(
			'popover__menu'
		)[ 0 ] as Element | null;

		expect( popoverMenu ).toBeInTheDocument();

		if ( popoverMenu ) {
			const menuItems = popoverMenu.getElementsByClassName( 'site-actions__menu-item' );
			if ( menuItems.length === 4 ) {
				[ issueLicense, viewActivity, viewSite, visitWPAdmin ] = menuItems;
			}
		}

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

	test( 'should render correctly and have href for all the actions except issuing licenses, if partner cannot issue new licenses', () => {
		const initialState = {
			partnerPortal: {
				partner: {
					current: {
						can_issue_licenses: false,
					},
				},
			},
			a8cForAgencies: {
				agencies: {
					activeAgency: 1,
				},
			},
		};
		const store = mockStore( initialState );

		const { container } = render(
			<Provider store={ store }>
				<QueryClientProvider client={ queryClient }>
					<SiteActions site={ site } siteError={ false } />
				</QueryClientProvider>
			</Provider>
		);

		const [ button ] = container.getElementsByTagName( 'button' );
		fireEvent.click( button );

		const popoverMenu = container.parentElement?.getElementsByClassName(
			'popover__menu'
		)[ 0 ] as Element | null;

		expect( popoverMenu ).toBeInTheDocument();

		if ( popoverMenu ) {
			const menuItems = popoverMenu.getElementsByClassName( 'site-actions__menu-item' );
			if ( menuItems.length === 3 ) {
				[ viewActivity, viewSite, visitWPAdmin ] = menuItems;
			}
		}

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
