/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, fireEvent } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SiteCard from '../index';
import type { SiteData } from '../../types';

jest.mock(
	'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-backup-staging',
	() => 'span'
);

describe( '<SiteCard>', () => {
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
	test( 'should render correctly and expand card on click', () => {
		const blogId = 1234;
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
		const rows: SiteData = {
			site: {
				value: siteObj,
				error: true,
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
				status: 'inactive',
				value: '',
			},
			monitor: { error: false, type: 'monitor', status: 'inactive', value: '' },
			scan: { threats: 3, type: 'scan', status: 'failed', value: '3 Threats' },
			plugin: { updates: 3, type: 'plugin', status: 'warning', value: '3 Available' },
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

		const { container } = render(
			<Provider store={ store }>
				<QueryClientProvider client={ queryClient }>
					<SiteCard rows={ rows } columns={ [] } />
				</QueryClientProvider>
			</Provider>
		);

		const [ expandedContentBeforeClick ] = container.getElementsByClassName(
			'site-card__expanded-content'
		);
		expect( expandedContentBeforeClick ).toBeFalsy();

		const [ header ] = container.getElementsByClassName( 'site-card__title' );

		fireEvent.click( header );

		const [ expandedContent ] = container.getElementsByClassName( 'site-card__expanded-content' );

		expect( expandedContent ).toBeInTheDocument();
	} );
} );
