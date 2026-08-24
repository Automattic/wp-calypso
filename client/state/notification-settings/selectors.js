import isEqual from 'fast-deep-equal/es6';

import 'calypso/state/notification-settings/init';

export const getNotificationSettings = ( state, source ) =>
	state?.notificationSettings?.settings?.dirty?.[ source ];

export const getNotificationSettingsClean = ( state, source ) =>
	state?.notificationSettings?.settings?.clean?.[ source ];

export const hasUnsavedNotificationSettingsChanges = ( state, source ) =>
	! isEqual(
		getNotificationSettingsClean( state, source ),
		getNotificationSettings( state, source )
	);

export const isFetchingNotificationsSettings = ( state ) => state.notificationSettings?.isFetching;
