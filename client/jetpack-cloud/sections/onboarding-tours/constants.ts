import { SiteData } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

/**
 * Constant holding all preference names for our onboarding tours.
 */
export const JETPACK_MANAGE_ONBOARDING_TOURS_PREFERENCE_NAME: Record< string, string > = {
	addSiteStep1: 'jetpack-manage-site-dashboard-add-new-site-tour-step-1',
	addSiteStep2: 'jetpack-manage-site-dashboard-add-new-site-tour-step-2',
	enableMonitorStep1: 'jetpack-manage-site-dashboard-enable-monitor-tour-step-1',
	enableMonitorStep2: 'jetpack-manage-site-dashboard-enable-monitor-tour-step-2',
	dashboardWalkthrough: 'jetpack-manage-sites-overview-dashboard-walkthrough-tour',
};

export const JETPACK_MANAGE_ONBOARDING_TOURS_EXAMPLE_SITE: SiteData[] = [
	{
		site: {
			value: {
				url: 'example.jetpack.com',
				url_with_scheme: 'https://example.jetpack.com',
				blogname: 'Example WordPress Site',
				monitor_settings: {
					check_interval: 0,
					last_down_time: '',
					monitor_active: false,
					monitor_site_status: false,
					monitor_user_emails: [],
					monitor_user_email_notifications: true,
					monitor_user_wp_note_notifications: true,
					monitor_user_sms_notifications: false,
					monitor_notify_additional_user_emails: [],
					monitor_notify_additional_user_sms: [],
					sms_sent_count: 0,
					sms_monthly_limit: 20,
					is_over_limit: false,
				},
				site_stats: {
					visitors: {
						total: 0,
						trend: 'same',
						trend_change: 0,
					},
					views: {
						total: 0,
						trend: 'same',
						trend_change: 0,
					},
				},
				sticker: [],
				blog_id: 0,
				monitor_active: false,
				monitor_site_status: false,
				has_scan: false,
				has_backup: false,
				has_boost: false,
				latest_scan_threats_found: [],
				latest_backup_status: '',
				is_connection_healthy: false,
				awaiting_plugin_updates: [],
				is_favorite: false,
				monitor_last_status_change: '',
				jetpack_boost_scores: {
					overall: 0,
					mobile: 0,
					desktop: 0,
				},
				php_version_num: 0,
				php_version: '',
				wordpress_version: '',
				hosting_provider_guess: '',
				has_paid_agency_monitor: false,
				is_atomic: false,
				has_pending_boost_one_time_score: false,
				has_vulnerable_plugins: false,
				latest_scan_has_threats_found: false,
				active_paid_subscription_slugs: [],
				multisite: false,
			},
			error: false,
			status: 'active',
			type: 'site',
		},
		stats: {
			status: 'active',
			type: 'stats',
			value: {
				visitors: {
					total: 0,
					trend: 'same',
					trend_change: 0,
				},
				views: {
					total: 0,
					trend: 'same',
					trend_change: 0,
				},
			},
		},
		boost: {
			status: 'active',
			type: 'boost',
			value: {
				desktop: 0,
				mobile: 0,
				overall: 0,
			},
		},
		backup: {
			value: '',
			status: 'inactive',
			type: 'backup',
		},
		scan: {
			value: '',
			status: 'inactive',
			type: 'scan',
			threats: 0,
		},
		monitor: {
			value: '',
			status: 'disabled',
			type: 'monitor',
			error: false,
			settings: {
				check_interval: 0,
				last_down_time: '',
				monitor_active: false,
				monitor_site_status: false,
				monitor_user_emails: [ 'diego.rodrigues@automattic.com' ],
				monitor_user_email_notifications: true,
				monitor_user_wp_note_notifications: true,
				monitor_user_sms_notifications: false,
				monitor_notify_additional_user_emails: [],
				monitor_notify_additional_user_sms: [],
				sms_sent_count: 0,
				sms_monthly_limit: 20,
				is_over_limit: false,
			},
		},
		plugin: {
			value: '0 Available',
			status: 'success',
			type: 'plugin',
			updates: 0,
		},
		error: {
			value: '',
			status: 'failed',
			type: 'error',
		},
		isFavorite: false,
	},
];
