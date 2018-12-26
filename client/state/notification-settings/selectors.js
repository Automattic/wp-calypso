/** @format */
/**
 * External dependencies
 */
import { get, isEqual } from 'lodash';

export const getNotificationSettings = ( state, source ) =>
	get( state, [ 'notificationSettings', 'settings', 'dirty', source ] );

export const getNotificationSettingsClean = ( state, source ) =>
	get( state, [ 'notificationSettings', 'settings', 'clean', source ] );

export const hasUnsavedNotificationSettingsChanges = ( state, source ) =>
	! isEqual(
		getNotificationSettingsClean( state, source ),
		getNotificationSettings( state, source )
	);
