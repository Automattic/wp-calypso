import { wpcom } from '../wpcom-fetcher';
import type { MeNotificationSettings } from './types';

export async function fetchMeNotificationSettings(): Promise< MeNotificationSettings > {
	return await wpcom.req.get( '/me/notifications/settings' );
}
