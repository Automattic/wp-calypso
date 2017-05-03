/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	NOTIFICATIONS_TOGGLE_PANEL,
} from 'state/action-types';

export const open = ( state = false, { type } ) => type === NOTIFICATIONS_TOGGLE_PANEL ? ! state : state;

export default combineReducers( { open } );
