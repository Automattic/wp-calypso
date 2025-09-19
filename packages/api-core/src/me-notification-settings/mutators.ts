import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { UserNotificationSettings, WpcomNotificationSettings } from './types';

export async function updateUserNotificationSettings( {
	data,
	applyAll,
}: {
	data: Partial< UserNotificationSettings >;
	applyAll?: boolean;
} ): Promise< Partial< UserNotificationSettings > > {
	return await wpcom.req.post( addQueryArgs( '/me/notifications/settings', { applyAll } ), data );
}

export async function updateWpcomNotificationSettings(
	data: Partial< WpcomNotificationSettings >
): Promise< Partial< WpcomNotificationSettings > > {
	return await wpcom.req.post( '/me/notifications/settings', { wpcom: data } );
}
