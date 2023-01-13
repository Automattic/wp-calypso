/**
 * @jest-environment jsdom
 */

import { translate } from 'i18n-calypso';
import * as utils from '../utils';
import type { SiteData } from '../types';

describe( 'utils', () => {
	describe( '#getActionEventName()', () => {
		test( 'should return the event name for a particular action', () => {
			const { getActionEventName } = utils;

			let isLargeScreen = true;
			expect( getActionEventName( 'issue_license', isLargeScreen ) ).toEqual(
				'calypso_jetpack_agency_dashboard_issue_license_large_screen'
			);

			isLargeScreen = false;
			expect( getActionEventName( 'visit_wp_admin', isLargeScreen ) ).toEqual(
				'calypso_jetpack_agency_dashboard_visit_wp_admin_small_screen'
			);
		} );
	} );

	describe( '#getRowMetaData()', () => {
		const scanThreats = 4;
		const pluginUpdates = [ 'plugin-1', 'plugin-2', 'plugin-3' ];
		const siteUrl = 'test.jurassic.ninja';
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
			monitor_last_status_change: '2020-12-01T00:00:00+00:00',
			monitor_settings: {
				monitor_active: true,
				last_down_time: '',
				monitor_deferment_time: 5,
				monitor_notify_users_emails: [],
			},
		};
		const rows: SiteData = {
			site: {
				value: siteObj,
				error: false,
				type: 'site',
				status: '',
			},
			backup: {
				type: 'backup',
				value: translate( 'Failed' ),
				status: 'failed',
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
		test( 'should return the meta data for the feature type', () => {
			const { getRowMetaData } = utils;
			let isLargeScreen = true;
			expect( getRowMetaData( rows, 'site', isLargeScreen ).row.value.url ).toEqual( siteUrl );

			const expectedBackupValue = {
				eventName: 'calypso_jetpack_agency_dashboard_backup_failed_click_large_screen',
				isExternalLink: false,
				link: `/backup/${ siteUrl }`,
				row: rows.backup,
				siteDown: false,
				siteError: false,
				tooltip: 'Latest backup failed',
				tooltipId: '1234-backup',
			};
			expect( getRowMetaData( rows, 'backup', isLargeScreen ) ).toEqual( expectedBackupValue );

			const expectedScanValue = {
				eventName: 'calypso_jetpack_agency_dashboard_scan_threats_click_large_screen',
				isExternalLink: false,
				link: `/scan/${ siteUrl }`,
				row: rows.scan,
				siteDown: false,
				siteError: false,
				tooltip: 'Potential threats found',
				tooltipId: '1234-scan',
			};
			expect( getRowMetaData( rows, 'scan', isLargeScreen ) ).toEqual( expectedScanValue );

			isLargeScreen = false;
			const expectedMonitorValue = {
				eventName: 'calypso_jetpack_agency_dashboard_monitor_site_down_click_small_screen',
				isExternalLink: true,
				link: `https://jptools.wordpress.com/debug/?url=${ siteUrl }`,
				row: rows.monitor,
				siteDown: false,
				siteError: false,
				tooltip: 'Site appears to be offline',
				tooltipId: '1234-monitor',
			};
			expect( getRowMetaData( rows, 'monitor', isLargeScreen ) ).toEqual( expectedMonitorValue );

			const expectedPluginValue = {
				eventName: 'calypso_jetpack_agency_dashboard_update_plugins_click_small_screen',
				isExternalLink: true,
				link: `https://wordpress.com/plugins/updates/${ siteUrl }`,
				row: rows.plugin,
				siteDown: false,
				siteError: false,
				tooltip: 'Plugin updates are available',
				tooltipId: '1234-plugin',
			};
			expect( getRowMetaData( rows, 'plugin', isLargeScreen ) ).toEqual( expectedPluginValue );
		} );
	} );

	describe( '#formatSites()', () => {
		let sites: any = [];

		test( 'should return any empty array', () => {
			const { formatSites } = utils;
			expect( formatSites( sites ) ).toEqual( [] );
		} );

		test( 'should return an array of formatted sites', () => {
			const { formatSites } = utils;
			sites = [
				{
					awaiting_plugin_updates: [ 'plugin-1' ],
					is_connection_healthy: false,
					has_backup: true,
					latest_backup_status: 'rewind_backup_complete',
					has_scan: true,
					latest_scan_threats_found: [ 'threat-1', 'threat-2' ],
					monitor_active: true,
					monitor_site_status: true,
					monitor_settings: {
						monitor_active: true,
					},
				},
			];
			expect( formatSites( sites ) ).toEqual( [
				{
					site: {
						error: true,
						status: '',
						type: 'site',
						value: sites[ 0 ],
					},
					backup: {
						status: 'success',
						type: 'backup',
						value: '',
					},
					scan: {
						status: 'failed',
						threats: 2,
						type: 'scan',
						value: '2 Threats',
					},
					monitor: {
						error: false,
						status: 'success',
						type: 'monitor',
						value: '',
						settings: {
							monitor_active: true,
						},
					},
					plugin: {
						status: 'warning',
						type: 'plugin',
						updates: 1,
						value: '1 Available',
					},
				},
			] );
		} );
	} );
} );
