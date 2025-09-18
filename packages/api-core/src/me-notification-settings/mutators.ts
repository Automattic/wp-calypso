import { wpcom } from '../wpcom-fetcher';
import type { WpcomNotificationSettings } from './types';

export async function updateWpcomNotificationSettings(
	data: Partial< WpcomNotificationSettings >
): Promise< Partial< WpcomNotificationSettings > > {
	return await wpcom.req.post( '/me/notifications/settings', { wpcom: data } );
}
