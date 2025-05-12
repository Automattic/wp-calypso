/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { translate } from 'i18n-calypso';
import nock from 'nock';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SiteTableRow from '../index';
import type { SiteData } from '../../types';

jest.mock(
	'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-backup-staging',
	() => 'span'
);

describe( '<SiteTableRow>', () => {
	beforeAll( () => {
		window.matchMedia = jest.fn().mockImplementation( ( query ) => {
			return {
				matches: true,
				media: query,
				onchange: null,
				addListener: jest.fn(),
				removeListener: jest.fn(),
			};
		} );
	} );

	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/rest/v1.1/jetpack-blogs/1234/test-connection?is_stale_connection_healthy=true' )
		.reply( 200, {
			connected: false,
		} );
	const scanThreats = 4;
	const blogId = 1234;
	const pluginUpdates = [ 'plugin-1', 'plugin-2', 'plugin-3' ];
	const siteObj = {
		blog_id: blogId,
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
	const item: SiteData = {
		site: {
			value: siteObj,
			error: false,
			type: 'site',
			status: 'active',
		},
		stats: {
			type: 'stats',
			status: 'active',
			value: {
				views: {
					total: 0,
					trend: 'up',
					trend_change: 0,
				},
				visitors: {
					total: 0,
					trend: 'up',
					trend_change: 0,
				},
			},
		},
		backup: {
			type: 'backup',
			value: translate( 'Failed' ),
			status: 'critical',
		},
		monitor: {
			error: false,
			status: 'failed',
			type: 'monitor',
			value: translate( 'Site Down' ),
		},
		scan: {
			threats: 4,
			type: 'scan',
			status: 'failed',
			value: translate(
				'%(threats)d Threat',
				'%(threats)d Threats', // plural version of the string
				{
					count: scanThreats,
					args: {
						threats: scanThreats,
					},
				}
			),
		},
		plugin: {
			updates: pluginUpdates.length,
			type: 'plugin',
			value: `${ pluginUpdates.length } ${ translate( 'Available' ) }`,
			status: 'warning',
		},
	};
	const props = {
		item,
		columns: [],
		setExpanded: function (): void {
			throw new Error( 'Function not implemented.' );
		},
		isExpanded: false,
		index: 0,
	};
	const initialState = {
		partnerPortal: {
			partner: {
				isPartnerOAuthTokenLoaded: true,
			},
		},
		sites: {
			items: {
				[ blogId ]: siteObj,
			},
		},
		a8cForAgencies: {
			agencies: {},
		},
	};
	const mockStore = configureStore();
	const store = mockStore( initialState );
	const queryClient = new QueryClient();

	test( 'should render correctly and have the error message and the link to fix the issue', async () => {
		const { getByText } = render(
			<Provider store={ store }>
				<QueryClientProvider client={ queryClient }>
					<table>
						<tbody>
							<SiteTableRow { ...props } />
						</tbody>
					</table>
				</QueryClientProvider>
			</Provider>
		);

		await waitFor( () => {
			expect( getByText( 'Jetpack is unable to connect to this site' ) ).toBeVisible();
			expect( getByText( /fix now/i ) ).toBeVisible();
		} );
	} );
} );
