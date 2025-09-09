/**
 * TypeScript interfaces for WordPress.com notification settings API
 */

export interface NotificationChannelSettings {
	new_comment?: boolean;
	comment_like: boolean;
	post_like?: boolean;
	follow?: boolean;
	achievement?: boolean;
	mentions?: boolean;
	scheduled_publicize?: boolean;
	store_order?: boolean;
	blogging_prompt?: boolean;
	draft_post_prompt?: boolean;
	recommended_blog?: boolean;
	comment_reply?: boolean;
}

interface DeviceSettings extends NotificationChannelSettings {
	device_id: number;
}

export interface BlogNotificationSettings {
	blog_id: number;
	timeline: NotificationChannelSettings;
	email: NotificationChannelSettings;
	devices: DeviceSettings[];
}

interface OtherNotificationSettings {
	timeline: NotificationChannelSettings;
	email: NotificationChannelSettings;
	devices: DeviceSettings[];
}

interface WPCOMNotificationSettings {
	marketing: boolean;
	research: boolean;
	affiliates: boolean;
	community: boolean;
	promotion: boolean;
	news: boolean;
	digest: boolean;
	reports: boolean;
	news_developer: boolean;
	wpcom_spain: boolean;
	scheduled_updates: boolean;
	learn: boolean;
	a4a_agencies: boolean;
	jetpack_agencies: boolean;
	jetpack_manage_onboarding: boolean;
	jetpack_marketing: boolean;
	jetpack_research: boolean;
	jetpack_promotion: boolean;
	jetpack_news: boolean;
	jetpack_reports: boolean;
	akismet_marketing: boolean;
	woopay_marketing: boolean;
	gravatar_onboarding: boolean;
}

export interface DeviceNotificationSettings {
	blogs: BlogNotificationSettings[];
	other: OtherNotificationSettings;
	wpcom: WPCOMNotificationSettings;
}
