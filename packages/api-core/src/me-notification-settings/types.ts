export interface WpcomNotificationSettings {
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

export interface NotificationSettings {
	new_comment: boolean;
	comment_like: boolean;
	post_like: boolean;
	follow: boolean;
	achievement: boolean;
	mentions: boolean;
	scheduled_publicize: boolean;
	store_order: boolean;
	blogging_prompt: boolean;
	draft_post_prompt: boolean;
	recommended_blog: boolean;
	comment_reply: boolean;
}

export interface DeviceNotificationSettings extends NotificationSettings {
	device_id: number;
}

export type OtherDeviceNotificationSettings = Pick<
	DeviceNotificationSettings,
	'device_id' | 'comment_like' | 'comment_reply'
>;
export interface OtherNotificationSettings {
	timeline: Pick< NotificationSettings, 'comment_like' | 'comment_reply' >;
	email: Pick< NotificationSettings, 'comment_like' | 'comment_reply' >;
	devices: OtherDeviceNotificationSettings[];
}

export interface BlogNotificationSettings {
	blog_id: number;
	devices: DeviceNotificationSettings[];
	email: NotificationSettings;
	timeline: NotificationSettings;
}
export interface UserNotificationSettings {
	blogs: BlogNotificationSettings[];
	other: OtherNotificationSettings;
	wpcom: WpcomNotificationSettings;
}

export type InputUserNotificationSettings = RecursivePartial< UserNotificationSettings >;

type RecursivePartial< T > = {
	[ P in keyof T ]?: T[ P ] extends ( infer U )[]
		? RecursivePartial< U >[]
		: T[ P ] extends object | undefined
		? RecursivePartial< T[ P ] >
		: T[ P ];
};
