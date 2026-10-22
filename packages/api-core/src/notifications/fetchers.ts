import { wpcom } from '../wpcom-fetcher';
import type { FetchNotificationsParams, NotificationsResponse } from './types';

export const fetchNotifications = (
	params: FetchNotificationsParams
): Promise< NotificationsResponse > =>
	wpcom.req.get( { path: '/notifications/', apiVersion: '1.1' }, params );
