import type { Site } from '../../types';

const siteId = 12345678;

const site: Site = {
	blog_id: siteId,
	url: 'test.wordpress.com',
	url_with_scheme: 'https://test.wordpress.com',
	monitor_active: true,
	monitor_site_status: true,
	has_scan: true,
	has_backup: false,
	has_boost: true,
	latest_scan_threats_found: [],
	latest_backup_status: '',
	is_connection_healthy: true,
	awaiting_plugin_updates: [ 'plugin1', 'plugin2' ],
	is_favorite: true,
	monitor_settings: {
		monitor_active: true,
		monitor_site_status: true,
		last_down_time: '2021-01-01T00:00:00+00:00',
		check_interval: 5,
		monitor_user_emails: [ 'test.com' ],
		monitor_user_email_notifications: true,
		monitor_user_wp_note_notifications: true,
		monitor_user_sms_notifications: false,
		monitor_notify_additional_user_emails: [],
		monitor_notify_additional_user_sms: [],
		is_over_limit: false,
		sms_sent_count: 10,
		sms_monthly_limit: 20,
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
	is_connected: true,
	has_paid_agency_monitor: true,
};

export { site };
