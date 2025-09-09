import { wpcom } from '../wpcom-fetcher';
import type { DeviceNotificationSettings } from './types';

export const fetchNotificationSettings = async (): Promise< DeviceNotificationSettings > => {
	return await wpcom.req.get( {
		path: '/me/notifications/settings',
		apiVersion: '1.1',
	} );
};
