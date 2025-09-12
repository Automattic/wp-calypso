import { wpcom } from '../wpcom-fetcher';
import type { WpcomNotificationSettings } from './types';

export async function updateWpcomNotificationSettings(
	data: Partial< WpcomNotificationSettings >
): Promise< Partial< WpcomNotificationSettings > > {
	const saveableKeys: ( keyof WpcomNotificationSettings )[] = [
		'marketing',
		'research',
		'community',
		'promotion',
		'news',
		'digest',
		'reports',
		'news_developer',
		'scheduled_updates',
		'jetpack_marketing',
		'jetpack_research',
		'jetpack_promotion',
		'jetpack_news',
		'jetpack_reports',
	];

	const wpcomPayload = Object.fromEntries(
		saveableKeys.filter( ( key ) => key in data ).map( ( key ) => [ key, data[ key ] ] )
	);

	return await wpcom.req.post( '/me/notifications/settings', { wpcom: wpcomPayload } );
}
