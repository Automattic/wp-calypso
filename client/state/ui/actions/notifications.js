import { NOTIFICATIONS_PANEL_TOGGLE } from 'calypso/state/action-types';

import 'calypso/state/ui/init';

/**
 * Sets ui state to toggle the notifications panel
 *
 * @returns {Object} An action object
 */
export const toggleNotificationsPanel = () => {
	return {
		type: NOTIFICATIONS_PANEL_TOGGLE,
	};
};
