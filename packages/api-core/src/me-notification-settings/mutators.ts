import { wpcom } from '../wpcom-fetcher';
import type { WpcomNotificationSettings } from './types';

export async function updateWpcomNotificationSettings(
	data: Partial< WpcomNotificationSettings >
): Promise< Partial< WpcomNotificationSettings > > {
	const saveableKeys: ( keyof WpcomNotificationSettings )[] = [
		'marketing',
		'research',
		'affiliates',
		'community',
		'promotion',
		'news',
		'digest',
		'reports',
		'news_developer',
		'wpcom_spain',
		'scheduled_updates',
		'learn',
		'a4a_agencies',
		'jetpack_agencies',
		'jetpack_manage_onboarding',
		'jetpack_marketing',
		'jetpack_research',
		'jetpack_promotion',
		'jetpack_news',
		'jetpack_reports',
		'akismet_marketing',
		'woopay_marketing',
		'gravatar_onboarding',
	];

	const wpcomPayload = Object.fromEntries(
		saveableKeys.filter( ( key ) => key in data ).map( ( key ) => [ key, data[ key ] ] )
	);

	return await wpcom.req.post( '/me/notifications/settings', { wpcom: wpcomPayload } );
}
