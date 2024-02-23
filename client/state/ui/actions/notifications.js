import { NOTIFICATIONS_PANEL_TOGGLE } from 'calypso/state/action-types';

import 'calypso/state/ui/init';

// Array of valid sources for the toggle action
const validSources = [ 'Masterbar', 'Sidebar' ];

/**
 * Sets ui state to toggle the notifications panel
 * @param {string} source The source of the toggle action (e.g., 'Sidebar', 'Masterbar')
 * @returns {Object} An action object
 */
export const toggleNotificationsPanel = ( source = 'Masterbar' ) => {
	// check that source is one of the expected values, if not set it to 'unknown'
	if ( ! validSources.includes( source ) ) {
		source = 'unknown';
	}
	return {
		type: NOTIFICATIONS_PANEL_TOGGLE,
		source,
	};
};
