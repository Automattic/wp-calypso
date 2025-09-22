import {
	InputUserNotificationSettings,
	OtherDeviceNotificationSettings,
	UserNotificationSettings,
} from '@automattic/api-core';
import deepmerge from 'deepmerge';

const mergeDevices = (
	oldData: OtherDeviceNotificationSettings[],
	newData: OtherDeviceNotificationSettings[]
) => {
	return newData.map( ( device ) => {
		const oldDevice = oldData.find( ( oldDevice ) => oldDevice.device_id === device.device_id );

		if ( oldDevice ) {
			return {
				...oldDevice,
				...device,
			};
		}
		return device;
	} );
};

export const mergeSettings = (
	oldData: UserNotificationSettings,
	newData: InputUserNotificationSettings
) => {
	return deepmerge( oldData, newData, {
		arrayMerge: mergeDevices,
	} ) as UserNotificationSettings;
};
