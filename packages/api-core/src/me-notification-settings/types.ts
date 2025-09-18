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

export interface UserNotificationSettings {
	blogs: Record< string, unknown >;
	other: Record< string, unknown >;
	wpcom: WpcomNotificationSettings;
}
