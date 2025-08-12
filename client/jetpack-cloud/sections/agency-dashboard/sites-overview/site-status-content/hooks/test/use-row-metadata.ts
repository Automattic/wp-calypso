/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { renderHook } from '@testing-library/react';
import { Site, SiteData } from '../../../types';
import * as useIsMultisiteSupported from '../use-is-multisite-supported';
import useRowMetadata from '../use-row-metadata';

const FAKE_SITE: Site = {
	blog_id: 0,
	url: 'test.wordpress.com',
	url_with_scheme: 'https://test.wordpress.com',
	monitor_active: true,
	monitor_site_status: true,
	has_scan: true,
	has_backup: false,
	has_boost: true,
	has_paid_agency_monitor: true,
	latest_scan_threats_found: [],
	latest_backup_status: '',
	is_connection_healthy: true,
	awaiting_plugin_updates: [ 'plugin1', 'plugin2' ],
	is_favorite: true,
	monitor_settings: {
		monitor_active: true,
		monitor_site_status: true,
		last_down_time: '',
		check_interval: 0,
		monitor_user_emails: [],
		monitor_user_email_notifications: false,
		monitor_user_sms_notifications: false,
		monitor_user_wp_note_notifications: false,
		monitor_notify_additional_user_emails: [],
		monitor_notify_additional_user_sms: [],
		is_over_limit: false,
		sms_sent_count: 0,
		sms_monthly_limit: 0,
	},
	monitor_last_status_change: '2021-01-01T00:00:00+00:00',
	isSelected: true,
	site_stats: {
		visitors: {
			total: 1000,
			trend_change: 50,
			trend: 'up',
		},
		views: {
			total: 5000,
			trend_change: 100,
			trend: 'down',
		},
	},
	jetpack_boost_scores: {
		overall: 10,
		mobile: 10,
		desktop: 10,
	},
	php_version_num: 7.4,
	php_version: '0',
	is_atomic: false,
	sticker: [],
	blogname: '',
	wordpress_version: '',
	has_pending_boost_one_time_score: false,
	has_vulnerable_plugins: false,
	latest_scan_has_threats_found: false,
	active_paid_subscription_slugs: [],
	hosting_provider_guess: 'automattic',
};

const scanThreats = 4;
const pluginUpdates = [ 'plugin-1', 'plugin-2', 'plugin-3' ];
const rows: SiteData = {
	site: {
		value: FAKE_SITE,
		error: false,
		type: 'site',
		status: 'active',
	},
	backup: {
		type: 'backup',
		value: 'Failed',
		status: 'critical',
	},
	monitor: {
		error: false,
		status: 'failed',
		type: 'monitor',
		value: 'Site Down',
	},
	scan: {
		threats: 4,
		type: 'scan',
		status: 'failed',
		value: `${ scanThreats } Threats`,
	},
	plugin: {
		updates: pluginUpdates.length,
		type: 'plugin',
		value: `${ pluginUpdates.length } Available`,
		status: 'warning',
	},
	stats: {
		status: 'active',
		type: 'stats',
		value: FAKE_SITE.site_stats,
	},
	boost: {
		status: 'active',
		type: 'boost',
		value: FAKE_SITE.jetpack_boost_scores,
	},
};

describe( 'useRowMetadata', () => {
	it( 'should return the expected site metadata', () => {
		jest.spyOn( useIsMultisiteSupported, 'default' ).mockReturnValue( true );
		const {
			result: { current: metadata },
		} = renderHook( () => useRowMetadata( rows, 'site', true ) );
		expect( ( metadata.row.value as Site ).url ).toEqual( FAKE_SITE.url );
	} );

	it( 'should return the expected Backup metadata', () => {
		jest.spyOn( useIsMultisiteSupported, 'default' ).mockReturnValue( true );
		const {
			result: { current: metadata },
		} = renderHook( () => useRowMetadata( rows, 'backup', true ) );

		const expected = {
			eventName: 'calypso_jetpack_agency_dashboard_backup_failed_click_large_screen',
			isExternalLink: false,
			link: `/backup/${ FAKE_SITE.url }`,
			isSupported: true,
			row: rows.backup,
			siteDown: false,
			tooltip: 'Latest backup failed',
			tooltipId: `${ FAKE_SITE.blog_id }-backup`,
		};
		expect( metadata ).toEqual( expected );
	} );

	it( 'should return the expected Backup metadata for atomic sites.', () => {
		jest.spyOn( useIsMultisiteSupported, 'default' ).mockReturnValue( true );
		const {
			result: { current: metadata },
		} = renderHook( () =>
			useRowMetadata(
				{
					...rows,
					site: {
						...rows.site,
						value: { ...FAKE_SITE, is_atomic: true },
					},
					backup: {
						type: 'backup',
						value: 'success',
						status: 'success',
					},
				},
				'backup',
				true
			)
		);

		const expected = {
			eventName: 'calypso_jetpack_agency_dashboard_backup_success_click_large_screen',
			isExternalLink: true,
			link: `https://wordpress.com/backup/${ FAKE_SITE.url }`,
			isSupported: true,
			row: {
				type: 'backup',
				value: 'success',
				status: 'success',
			},
			siteDown: false,
			tooltip: 'Latest backup completed successfully',
			tooltipId: `${ FAKE_SITE.blog_id }-backup`,
		};
		expect( metadata ).toEqual( expected );
	} );

	it( 'should return the expected Scan metadata', () => {
		jest.spyOn( useIsMultisiteSupported, 'default' ).mockReturnValue( true );
		const {
			result: { current: metadata },
		} = renderHook( () => useRowMetadata( rows, 'scan', true ) );

		const expected = {
			eventName: 'calypso_jetpack_agency_dashboard_scan_threats_click_large_screen',
			isExternalLink: false,
			link: `/scan/${ FAKE_SITE.url }`,
			isSupported: true,
			row: rows.scan,
			siteDown: false,
			tooltip: 'Potential threats found',
			tooltipId: `${ FAKE_SITE.blog_id }-scan`,
		};
		expect( metadata ).toEqual( expected );
	} );

	it( 'should return the expected Scan metadata for atomic sites.', () => {
		jest.spyOn( useIsMultisiteSupported, 'default' ).mockReturnValue( true );
		const {
			result: { current: metadata },
		} = renderHook( () =>
			useRowMetadata(
				{
					...rows,
					site: {
						...rows.site,
						value: { ...FAKE_SITE, is_atomic: true },
					},
				},
				'scan',
				true
			)
		);

		const expected = {
			eventName: 'calypso_jetpack_agency_dashboard_scan_threats_click_large_screen',
			isExternalLink: true,
			link: `https://wordpress.com/scan/${ FAKE_SITE.url }`,
			isSupported: true,
			row: rows.scan,
			siteDown: false,
			tooltip: 'Potential threats found',
			tooltipId: `${ FAKE_SITE.blog_id }-scan`,
		};
		expect( metadata ).toEqual( expected );
	} );

	it( 'should return the expected Monitor metadata', () => {
		jest.spyOn( useIsMultisiteSupported, 'default' ).mockReturnValue( true );
		const {
			result: { current: metadata },
		} = renderHook( () => useRowMetadata( rows, 'monitor', false ) );

		const expected = {
			eventName: 'calypso_jetpack_agency_dashboard_monitor_site_down_click_small_screen',
			isExternalLink: true,
			link: `https://jptools.wordpress.com/debug/?url=${ FAKE_SITE.url }`,
			isSupported: true,
			row: rows.monitor,
			siteDown: false,
			tooltip: 'Site appears to be offline',
			tooltipId: `${ FAKE_SITE.blog_id }-monitor`,
		};
		expect( metadata ).toEqual( expected );
	} );

	it( 'should return the expected plugin metadata', () => {
		jest.spyOn( useIsMultisiteSupported, 'default' ).mockReturnValue( true );
		const {
			result: { current: metadata },
		} = renderHook( () => useRowMetadata( rows, 'plugin', false ) );

		const expected = {
			eventName: 'calypso_jetpack_agency_dashboard_update_plugins_click_small_screen',
			isExternalLink: false,
			link: `/plugins/updates/${ FAKE_SITE.url }`,
			isSupported: true,
			row: rows.plugin,
			siteDown: false,
			tooltip: 'Plugin updates are available',
			tooltipId: `${ FAKE_SITE.blog_id }-plugin`,
		};
		expect( metadata ).toEqual( expected );
	} );

	it( 'should return the expected Stats metadata', () => {
		jest.spyOn( useIsMultisiteSupported, 'default' ).mockReturnValue( true );
		const {
			result: { current: metadata },
		} = renderHook( () => useRowMetadata( rows, 'stats', false ) );

		const expected = {
			eventName: undefined,
			isExternalLink: false,
			link: '',
			isSupported: true,
			row: rows.stats,
			siteDown: false,
			tooltip: undefined,
			tooltipId: `${ FAKE_SITE.blog_id }-stats`,
		};
		expect( metadata ).toEqual( expected );
	} );

	it( 'should return the expected Boost metadata', () => {
		jest.spyOn( useIsMultisiteSupported, 'default' ).mockReturnValue( true );
		const {
			result: { current: metadata },
		} = renderHook( () => useRowMetadata( rows, 'boost', false ) );

		const expected = {
			eventName: undefined,
			isExternalLink: false,
			link: '',
			isSupported: true,
			row: rows.boost,
			siteDown: false,
			tooltip: undefined,
			tooltipId: `${ FAKE_SITE.blog_id }-boost`,
		};
		expect( metadata ).toEqual( expected );
	} );

	it( 'should return not multisite supported for backup with license', () => {
		jest.spyOn( useIsMultisiteSupported, 'default' ).mockReturnValue( false );
		const {
			result: { current: metadata },
		} = renderHook( () =>
			useRowMetadata(
				{ ...rows, site: { ...rows.site, value: { ...rows.site.value, has_backup: true } } },
				'backup',
				true
			)
		);

		expect( metadata.isSupported ).toEqual( false );
	} );

	it( 'should return not multisite supported for scan', () => {
		jest.spyOn( useIsMultisiteSupported, 'default' ).mockReturnValue( false );
		const {
			result: { current: metadata },
		} = renderHook( () => useRowMetadata( rows, 'scan', true ) );

		expect( metadata.isSupported ).toEqual( false );
	} );
} );
