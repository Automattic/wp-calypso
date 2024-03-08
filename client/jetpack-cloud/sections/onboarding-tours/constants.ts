/**
 * Constant holding all preference names for our onboarding tours.
 */
export const JETPACK_MANAGE_ONBOARDING_TOURS_PREFERENCE_NAME: Record< string, string > = {
	addSiteStep1: 'jetpack-manage-site-dashboard-add-new-site-tour-step-1',
	addSiteStep2: 'jetpack-manage-site-dashboard-add-new-site-tour-step-2',
	enableMonitorStep1: 'jetpack-manage-site-dashboard-enable-monitor-tour-step-1',
	enableMonitorStep2: 'jetpack-manage-site-dashboard-enable-monitor-tour-step-2',
	dashboardWalkthrough: 'jetpack-manage-sites-overview-dashboard-walkthrough-tour',
	pluginOverview: 'jetpack-manage-plugin-management-v2-plugin-overview-tour',
};

export const JETPACK_MANAGE_ONBOARDING_TOURS_EXAMPLE_SITE = [
	{
		site: {
			value: {
				url: 'example.jetpack.com',
				url_with_scheme: 'https://example.jetpack.com',
				blogname: 'Example WordPress Site',
				monitor_settings: {
					monitor_deferment_time: 5,
					check_interval: null,
					last_down_time: null,
					monitor_active: false,
					monitor_site_status: null,
					monitor_site_status_raw: null,
					monitor_notify_users_emails: [],
					monitor_user_emails: [],
					monitor_user_email_notifications: true,
					monitor_user_wp_note_notifications: true,
					monitor_user_sms_notifications: false,
					monitor_notify_additional_user_emails: [],
					monitor_notify_additional_user_sms: [],
					sms_sent_count: 0,
					sms_remaining_count: 0,
					sms_monthly_limit: 20,
					is_over_limit: null,
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
				desktop: null,
				mobile: null,
				overall: null,
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
				monitor_deferment_time: 5,
				check_interval: null,
				last_down_time: null,
				monitor_active: false,
				monitor_site_status: null,
				monitor_site_status_raw: null,
				monitor_notify_users_emails: [ 'example@example.jetpack.com' ],
				monitor_user_emails: [ 'diego.rodrigues@automattic.com' ],
				monitor_user_email_notifications: true,
				monitor_user_wp_note_notifications: true,
				monitor_user_sms_notifications: false,
				monitor_notify_additional_user_emails: [],
				monitor_notify_additional_user_sms: [],
				sms_sent_count: 0,
				sms_remaining_count: 0,
				sms_monthly_limit: 20,
				is_over_limit: null,
			},
		},
		plugin: {
			value: '0 Available',
			status: 'success',
			type: 'plugin',
			updates: 0,
		},
		isFavorite: false,
	},
];
