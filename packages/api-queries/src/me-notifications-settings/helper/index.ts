import {
	BlogNotificationSettings,
	DeviceNotificationSettings,
	InputUserNotificationSettings,
	UserNotificationSettings,
} from '@automattic/api-core';
import deepmerge from 'deepmerge';

type Mergeable = DeviceNotificationSettings | BlogNotificationSettings;

const isDeviceNotificationSettings = ( data: Mergeable ): data is DeviceNotificationSettings => {
	return 'device_id' in data;
};

const isBlogNotificationSettings = ( data: Mergeable ): data is BlogNotificationSettings => {
	return 'blog_id' in data;
};

const mergeCollections = ( oldData: Mergeable[], newData: Mergeable[] ) => {
	if ( oldData.length === 0 ) {
		return newData;
	}

	if ( newData.length === 0 ) {
		return oldData;
	}

	return oldData.map( ( data ) => {
		if ( isDeviceNotificationSettings( data ) ) {
			const device = data as DeviceNotificationSettings;

			const toMerge = ( newData as DeviceNotificationSettings[] ).find(
				( newDevice ) => newDevice.device_id === device.device_id
			);

			if ( toMerge ) {
				return deepmerge( device, toMerge );
			}
		}

		if ( isBlogNotificationSettings( data ) ) {
			const blog = data as BlogNotificationSettings;
			const toMerge = ( newData as BlogNotificationSettings[] ).find(
				( newBlog ) => newBlog.blog_id === blog.blog_id
			);

			if ( toMerge ) {
				return deepmerge( blog, toMerge );
			}
		}
		return data;
	} );
};

export const mergeSettings = (
	oldData: UserNotificationSettings,
	newData: InputUserNotificationSettings
) => {
	return deepmerge( oldData, newData, {
		arrayMerge: mergeCollections,
	} ) as UserNotificationSettings;
};
