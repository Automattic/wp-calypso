/**
 * Internal dependencies
 */
import {
	NOTIFICATIONS_SET_INDICATOR,
	NOTIFICATIONS_TOGGLE_PANEL,
} from 'state/action-types';

export const setNotificationsIndicator = ( animationState, newNote ) => ( {
	type: NOTIFICATIONS_SET_INDICATOR,
	animationState,
	newNote
} );

export const toggleNotificationsPanel = () => ( { type: NOTIFICATIONS_TOGGLE_PANEL } );
