import { wpcom } from '../wpcom-fetcher';
import { NotificationsDevice, NotificationsDeviceResponse } from './types';

export const createNotificationsDevice = (
	pushSubscription: NotificationsDevice
): Promise< NotificationsDeviceResponse > => {
	const { device_token, device_family, device_name } = pushSubscription;

	return wpcom.req.post( '/devices/new', {
		device_token: JSON.stringify( device_token ),
		device_family,
		device_name,
	} );
};

export const deleteNotificationsDevice = ( deviceId: string ) => {
	return wpcom.req.post( `/devices/${ deviceId }/delete` ) as Promise< void >;
};
