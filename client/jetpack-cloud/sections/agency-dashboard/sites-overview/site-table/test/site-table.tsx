/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { translate } from 'i18n-calypso';
import nock from 'nock';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import SiteTable from '../index';
import type { SiteData } from '../../types';

jest.mock(
	'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-backup-staging',
	() => 'span'
);

jest.mock( 'calypso/components/data/query-reader-teams', () => 'span' );

describe( '<SiteTable>', () => {
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
			connected: true,
		} );
	const scanThreats = 4;
	const blogId = 1234;
	const pluginUpdates = [ 'plugin-1', 'plugin-2', 'plugin-3' ];
	const siteUrl = 'test.jurassic.ninja';
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
		is_connected: true,
	};
	const items: Array< SiteData > = [
		{
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
		},
	];
	const props = {
		items,
		isLoading: false,
		columns: [
			{
				key: 'site',
				title: 'Site',
				isSortable: true,
			},
			{
				key: 'stats',
				title: 'Stats',
				className: 'width-fit-content',
				isExpandable: true,
			},
			{
				key: 'backup',
				title: 'Backup',
				className: 'fixed-site-column',
				isExpandable: true,
			},
			{
				key: 'scan',
				title: 'Scan',
				className: 'fixed-site-column',
			},
			{
				key: 'monitor',
				title: 'Monitor',
				className: 'min-width-100px',
				isExpandable: true,
			},
			{
				key: 'plugin',
				title: 'Plugins',
				className: 'width-fit-content',
			},
		],
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
		a8cForAgencies: { agencies: {} },
	};
	const mockStore = configureStore();
	const store = mockStore( initialState );
	const queryClient = new QueryClient();

	test( 'should render correctly and have href and status for each row', () => {
		const { getByTestId, getByText } = render(
			<Provider store={ store }>
				<QueryClientProvider client={ queryClient }>
					<SiteTable { ...props } />
				</QueryClientProvider>
			</Provider>
		);

		const backupEle = getByTestId( `row-${ blogId }-backup` );
		expect( backupEle.getAttribute( 'href' ) ).toEqual( `/backup/${ urlToSlug( siteUrl ) }` );
		expect( getByText( /failed/i ) ).toBeInTheDocument();

		const scanEle = getByTestId( `row-${ blogId }-scan` );
		expect( scanEle.getAttribute( 'href' ) ).toEqual( `/scan/${ urlToSlug( siteUrl ) }` );
		expect( getByText( `${ scanThreats } Threats` ) ).toBeInTheDocument();

		const pluginEle = getByTestId( `row-${ blogId }-plugin` );
		expect( pluginEle.getAttribute( 'href' ) ).toEqual(
			`/plugins/updates/${ urlToSlug( siteUrl ) }`
		);
		expect( getByText( `${ pluginUpdates.length } Available` ) ).toBeInTheDocument();
	} );
} );
