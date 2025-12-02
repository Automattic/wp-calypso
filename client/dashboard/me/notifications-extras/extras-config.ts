import { __ } from '@wordpress/i18n';
import type { WpcomNotificationSettings } from '@automattic/api-core';

export const WPCOM_OPTION_KEYS = [
	'marketing',
	'research',
	'community',
	'promotion',
	'news',
	'digest',
	'reports',
	'news_developer',
	'scheduled_updates',
] as const;

export type WpcomOptionKey = Extract<
	keyof WpcomNotificationSettings,
	( typeof WPCOM_OPTION_KEYS )[ number ]
>;

export const WPCOM_TITLES: Record< WpcomOptionKey, string > = {
	marketing: __( 'Suggestions' ),
	research: __( 'Research' ),
	community: __( 'Community' ),
	promotion: __( 'Promotions' ),
	news: __( 'Newsletter' ),
	digest: __( 'Digests' ),
	reports: __( 'Reports' ),
	news_developer: __( 'Developer Newsletter' ),
	scheduled_updates: __( 'Scheduled updates' ),
};

export const WPCOM_DESCRIPTIONS: Record< WpcomOptionKey, string > = {
	marketing: __( 'Tips for getting the most out of WordPress.com.' ),
	research: __( 'Opportunities to participate in WordPress.com research and surveys.' ),
	community: __( 'Information on WordPress.com courses and events (online and in-person).' ),
	promotion: __( 'Sales and promotions for WordPress.com products and services.' ),
	news: __( 'WordPress.com news, announcements, and product spotlights.' ),
	digest: __( 'Popular content from the blogs you follow.' ),
	reports: __( 'Complimentary reports and updates regarding site performance and traffic.' ),
	news_developer: __( 'A once-monthly roundup of notable news for WordPress developers.' ),
	scheduled_updates: __( 'Complimentary reports regarding scheduled plugin updates.' ),
};

export const JETPACK_OPTION_KEYS = [
	'jetpack_marketing',
	'jetpack_research',
	'jetpack_promotion',
	'jetpack_news',
	'jetpack_reports',
] as const;

export type JetpackOptionKey = Extract<
	keyof WpcomNotificationSettings,
	( typeof JETPACK_OPTION_KEYS )[ number ]
>;

export const JETPACK_TITLES: Record< JetpackOptionKey, string > = {
	jetpack_marketing: __( 'Suggestions' ),
	jetpack_research: __( 'Research' ),
	jetpack_promotion: __( 'Promotions' ),
	jetpack_news: __( 'Newsletter' ),
	jetpack_reports: __( 'Reports' ),
};

export const JETPACK_DESCRIPTIONS: Record< JetpackOptionKey, string > = {
	jetpack_marketing: __( 'Tips for getting the most out of Jetpack.' ),
	jetpack_research: __( 'Opportunities to participate in Jetpack research and surveys.' ),
	jetpack_promotion: __( 'Sales and promotions for Jetpack products and services.' ),
	jetpack_news: __( 'Jetpack news, announcements, and product spotlights.' ),
	jetpack_reports: __( 'Jetpack security and performance reports.' ),
};

export const getSettingsTitle = ( settingsName: string ) => {
	return (
		WPCOM_TITLES[ settingsName as WpcomOptionKey ] ??
		JETPACK_TITLES[ settingsName as JetpackOptionKey ]
	);
};
