/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer } from 'calypso/state/utils';
import {
	ACTIVITY_LOG_RETENTION_POLICY_REQUEST,
	ACTIVITY_LOG_RETENTION_POLICY_REQUEST_FAILURE,
	ACTIVITY_LOG_RETENTION_POLICY_REQUEST_SUCCESS,
	ACTIVITY_LOG_RETENTION_POLICY_SET,
} from 'calypso/state/action-types';

/**
 * Type dependencies
 */
import type { AppState } from 'calypso/types';

export const requestStatus = ( state: AppState = {}, { type } ): AppState | string => {
	switch ( type ) {
		case ACTIVITY_LOG_RETENTION_POLICY_REQUEST:
			return 'pending';
		case ACTIVITY_LOG_RETENTION_POLICY_REQUEST_FAILURE:
			return 'failure';
		case ACTIVITY_LOG_RETENTION_POLICY_REQUEST_SUCCESS:
			return 'success';
	}

	return state;
};

export const days = (
	state: AppState = {},
	{ type, retentionPolicy }
): AppState | number | undefined => {
	if ( type !== ACTIVITY_LOG_RETENTION_POLICY_SET ) {
		return state;
	}

	return retentionPolicy.days;
};

export default keyedReducer(
	'siteId',
	combineReducers( {
		requestStatus,
		days,
	} )
);
