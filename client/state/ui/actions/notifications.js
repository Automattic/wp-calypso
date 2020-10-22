/**
 * Internal dependencies
 */
import { NOTIFICATIONS_PANEL_TOGGLE } from 'calypso/state/action-types';

/**
 * Sets ui state to toggle the notifications panel
 *
 * @returns {object} An action object
 */
export const toggleNotificationsPanel = () => {
	return {
		type: NOTIFICATIONS_PANEL_TOGGLE,
	};
};
