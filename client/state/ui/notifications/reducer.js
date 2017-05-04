/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	NOTIFICATIONS_SET_INDICATOR,
	NOTIFICATIONS_TOGGLE_PANEL,
} from 'state/action-types';

export const animationState = ( state = -1, { type, animationState } ) => type === NOTIFICATIONS_SET_INDICATOR ? animationState : state;
export const newNote = ( state = false, { type, newNote } ) => type === NOTIFICATIONS_SET_INDICATOR ? newNote : state;
export const open = ( state = false, { type } ) => type === NOTIFICATIONS_TOGGLE_PANEL ? ! state : state;

export default combineReducers( { animationState, newNote, open } );
