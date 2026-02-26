import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { InputUserNotificationSettings, UserNotificationSettings } from './types';

export async function updateUserNotificationSettings(
	data: InputUserNotificationSettings,
	applyToAll?: boolean
): Promise< UserNotificationSettings > {
	const queryArgs = applyToAll ? { applyToAll } : {};
	return await wpcom.req.post( addQueryArgs( '/me/notifications/settings', queryArgs ), data );
}
