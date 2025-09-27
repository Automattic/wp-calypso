import { wpcom } from '../wpcom-fetcher';
import type { UserNotificationDevice } from './types';

export async function fetchUserNotificationDevices(): Promise< UserNotificationDevice[] > {
	return await wpcom.req.get( '/notifications/devices' );
}
