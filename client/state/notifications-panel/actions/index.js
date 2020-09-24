/**
 * Internal dependencies
 */
import 'state/notifications-panel/init';
import { NOTIFICATIONS_FORCE_REFRESH } from 'state/action-types';

export const setForceRefresh = function setForceRefresh( refresh ) {
	return {
		type: NOTIFICATIONS_FORCE_REFRESH,
		refresh,
	};
};

export const didForceRefresh = function didForceRefresh() {
	return {
		type: NOTIFICATIONS_FORCE_REFRESH,
		refresh: false,
	};
};
