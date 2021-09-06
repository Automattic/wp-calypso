import {
	REWIND_POLICIES_REQUEST,
	REWIND_POLICIES_REQUEST_FAILURE,
	REWIND_POLICIES_REQUEST_SUCCESS,
	REWIND_POLICIES_SET,
} from 'calypso/state/action-types';
import type { RewindPolicies } from './types';
import type { AppState } from 'calypso/types';
import type { AnyAction } from 'redux';

type RewindPoliciesActionType = AnyAction & {
	policies: RewindPolicies;
};

const policies = (
	state: AppState = {},
	{ type, policies }: AnyAction | RewindPoliciesActionType
): AppState | number | undefined => {
	switch ( type ) {
		case REWIND_POLICIES_REQUEST:
			return {
				...state,
				requestStatus: 'pending',
			};
		case REWIND_POLICIES_REQUEST_SUCCESS:
			return {
				...state,
				requestStatus: 'success',
			};
		case REWIND_POLICIES_REQUEST_FAILURE:
			return {
				...state,
				requestStatus: 'failure',
			};
		case REWIND_POLICIES_SET:
			return {
				requestStatus: state.requestStatus,
				...policies,
			};
	}

	return state;
};

export default policies;
