import { wpcom } from '../wpcom-fetcher';
import type { UserNotificationSettings } from './types';

export async function fetchUserNotificationSettings(): Promise< UserNotificationSettings > {
	return await wpcom.req.get( '/me/notifications/settings' );
}
