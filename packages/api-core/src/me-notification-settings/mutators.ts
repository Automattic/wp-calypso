import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type {
	InputUserNotificationSettings,
	UserNotificationSettings,
	WpcomNotificationSettings,
} from './types';

export async function updateUserNotificationSettings(
	data: InputUserNotificationSettings,
	applyAll?: boolean
): Promise< UserNotificationSettings > {
	const queryArgs = applyAll ? { applyAll } : {};
	return await wpcom.req.post( addQueryArgs( '/me/notifications/settings', queryArgs ), data );
}

export async function updateWpcomNotificationSettings(
	data: Partial< WpcomNotificationSettings >
): Promise< Partial< WpcomNotificationSettings > > {
	return await wpcom.req.post( '/me/notifications/settings', { wpcom: data } );
}
