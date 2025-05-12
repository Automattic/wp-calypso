/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { renderHook } from '@testing-library/react';
import { MonitorSettings, Site } from '../../../types';
import useFormattedSites from '../use-formatted-sites';

const FAKE_MONITOR_SETTINGS: MonitorSettings = {
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
};

const FAKE_SITE: Site = {
	blog_id: 0,
	url: '',
	url_with_scheme: '',
	has_backup: true,
	has_scan: true,
	has_paid_agency_monitor: true,
	has_boost: true,
	is_favorite: false,
	monitor_last_status_change: '',
	php_version_num: 0,
	php_version: '0',
	wordpress_version: '0',
	awaiting_plugin_updates: [ 'plugin-1' ],
	is_connection_healthy: false,
	latest_backup_status: 'rewind_backup_complete',
	latest_scan_threats_found: [ 'threat-1', 'threat-2' ],
	monitor_active: true,
	monitor_site_status: true,
	monitor_settings: FAKE_MONITOR_SETTINGS,
	site_stats: {
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
	jetpack_boost_scores: {
		overall: 100,
		mobile: 50,
		desktop: 50,
	},
	sticker: [],
	blogname: '',
	is_atomic: false,
	has_pending_boost_one_time_score: false,
	has_vulnerable_plugins: false,
	latest_scan_has_threats_found: false,
	active_paid_subscription_slugs: [],
	hosting_provider_guess: 'automattic',
};

describe( 'useFormattedSites', () => {
	it( 'should return an empty array when given an empty array', () => {
		const {
			result: { current: formattedSites },
		} = renderHook( () => useFormattedSites( [] ) );
		expect( formattedSites ).toEqual( [] );
	} );

	it( 'should return correct "site" data for the given sites', () => {
		const {
			result: { current: formattedSites },
		} = renderHook( () => useFormattedSites( [ FAKE_SITE ] ) );

		const { site: data } = formattedSites[ 0 ];
		expect( data ).toEqual( {
			error: true,
			status: 'active',
			type: 'site',
			value: FAKE_SITE,
		} );
	} );

	it( 'should return correct "backup" data for the given sites', () => {
		const {
			result: { current: formattedSites },
		} = renderHook( () => useFormattedSites( [ FAKE_SITE ] ) );

		const { backup: data } = formattedSites[ 0 ];
		expect( data ).toEqual( {
			status: 'success',
			type: 'backup',
			value: '',
		} );
	} );

	it( 'should return correct "scan" data for the given sites', () => {
		const {
			result: { current: formattedSites },
		} = renderHook( () => useFormattedSites( [ FAKE_SITE ] ) );

		const { scan: data } = formattedSites[ 0 ];
		expect( data ).toEqual( {
			status: 'failed',
			threats: 2,
			type: 'scan',
			value: '2 Threats',
		} );
	} );

	it( 'should return correct "monitor" data for the given sites', () => {
		const {
			result: { current: formattedSites },
		} = renderHook( () => useFormattedSites( [ FAKE_SITE ] ) );

		const { monitor: data } = formattedSites[ 0 ];
		expect( data ).toEqual( {
			error: false,
			status: 'success',
			type: 'monitor',
			value: '',
			settings: FAKE_MONITOR_SETTINGS,
		} );
	} );

	it( 'should return correct "plugin" data for the given sites', () => {
		const {
			result: { current: formattedSites },
		} = renderHook( () => useFormattedSites( [ FAKE_SITE ] ) );

		const { plugin: data } = formattedSites[ 0 ];
		expect( data ).toEqual( {
			status: 'warning',
			type: 'plugin',
			updates: 1,
			value: '1 Available',
		} );
	} );

	it( 'should return correct "stats" data for the given sites', () => {
		const {
			result: { current: formattedSites },
		} = renderHook( () => useFormattedSites( [ FAKE_SITE ] ) );

		const { stats: data } = formattedSites[ 0 ];
		expect( data ).toEqual( {
			status: 'active',
			type: 'stats',
			value: FAKE_SITE.site_stats,
		} );
	} );

	it( 'should return correct "boost" data for the given sites', () => {
		const {
			result: { current: formattedSites },
		} = renderHook( () => useFormattedSites( [ FAKE_SITE ] ) );

		const { boost: data } = formattedSites[ 0 ];
		expect( data ).toEqual( {
			status: 'active',
			type: 'boost',
			value: FAKE_SITE.jetpack_boost_scores,
		} );
	} );
} );
