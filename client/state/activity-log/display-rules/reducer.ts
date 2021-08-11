/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer } from 'calypso/state/utils';
import {
	ACTIVITY_LOG_DISPLAY_RULES_REQUEST,
	ACTIVITY_LOG_DISPLAY_RULES_REQUEST_FAILURE,
	ACTIVITY_LOG_DISPLAY_RULES_REQUEST_SUCCESS,
	ACTIVITY_LOG_DISPLAY_RULES_SET,
} from 'calypso/state/action-types';

/**
 * Type dependencies
 */
import type { AppState } from 'calypso/types';

export const requestStatus = ( state: AppState = null, { type } ): AppState | string => {
	switch ( type ) {
		case ACTIVITY_LOG_DISPLAY_RULES_REQUEST:
			return 'pending';
		case ACTIVITY_LOG_DISPLAY_RULES_REQUEST_FAILURE:
			return 'failure';
		case ACTIVITY_LOG_DISPLAY_RULES_REQUEST_SUCCESS:
			return 'success';
	}

	return state;
};

export const visibleDays = (
	state: AppState = null,
	{ type, displayRules }
): AppState | number | undefined => {
	if ( type !== ACTIVITY_LOG_DISPLAY_RULES_SET ) {
		return state;
	}

	return displayRules.days;
};

export default keyedReducer(
	'siteId',
	combineReducers( {
		requestStatus,
		visibleDays,
	} )
);
