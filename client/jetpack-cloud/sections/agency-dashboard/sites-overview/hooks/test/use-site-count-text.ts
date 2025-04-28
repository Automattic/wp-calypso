/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { renderHook } from '@testing-library/react';
import { Site } from '../../types';
import useSiteCountText from '../use-site-count-text';

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

describe( 'useSiteCountText', () => {
	it( 'should return null when given an empty array of sites', () => {
		const {
			result: { current: text },
		} = renderHook( () => useSiteCountText( [] ) );
		expect( text ).toBeNull();
	} );

	it( 'should return the URL of a single site', () => {
		const {
			result: { current: text },
		} = renderHook( () => useSiteCountText( [ FAKE_SITE ] ) );
		expect( text ).toEqual( FAKE_SITE.url );
	} );

	it( 'should return the correct text for multiple sites', () => {
		const sites = [
			{ ...FAKE_SITE, blog_id: 1 },
			{ ...FAKE_SITE, blog_id: 2 },
		];

		const {
			result: { current: text },
		} = renderHook( () => useSiteCountText( sites ) );
		expect( text ).toEqual( '2 sites' );
	} );
} );
