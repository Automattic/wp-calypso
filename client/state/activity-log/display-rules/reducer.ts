import {
	ACTIVITY_LOG_DISPLAY_RULES_REQUEST,
	ACTIVITY_LOG_DISPLAY_RULES_REQUEST_FAILURE,
	ACTIVITY_LOG_DISPLAY_RULES_REQUEST_SUCCESS,
	ACTIVITY_LOG_DISPLAY_RULES_SET,
} from 'calypso/state/action-types';
import { combineReducers, keyedReducer } from 'calypso/state/utils';
import type { DisplayRules } from './types';
import type { AppState } from 'calypso/types';
import type { AnyAction } from 'redux';

export const requestStatus = ( state: AppState = null, { type }: AnyAction ): AppState | string => {
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

type DisplayRulesActionType = AnyAction & {
	displayRules: DisplayRules;
};

export const visibleDays = (
	state: AppState = null,
	{ type, displayRules }: DisplayRulesActionType
): AppState | number | undefined => {
	if ( type !== ACTIVITY_LOG_DISPLAY_RULES_SET ) {
		return state;
	}

	return displayRules.visibleDays ?? null;
};

export default keyedReducer(
	'siteId',
	combineReducers( {
		requestStatus,
		visibleDays,
	} )
);
