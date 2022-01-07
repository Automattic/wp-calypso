import {
	SIGNUP_STEPS_SITE_INFO_COLLECTION_UPDATE,
	SIGNUP_STEPS_SITE_INFO_UPDATE_CURRENT_INDEX,
	SIGNUP_COMPLETE_RESET,
} from 'calypso/state/action-types';
import { withSchemaValidation } from 'calypso/state/utils';
import { schema, initialState } from './schema';
import type { AnyAction } from 'redux';

export default withSchemaValidation( schema, ( state = initialState, action: AnyAction ) => {
	switch ( action.type ) {
		case SIGNUP_STEPS_SITE_INFO_COLLECTION_UPDATE:
			return {
				...state,
				...action.data,
			};
		case SIGNUP_STEPS_SITE_INFO_UPDATE_CURRENT_INDEX:
			return {
				...state,
				currentIndex: action.currentIndex,
			};
		case SIGNUP_COMPLETE_RESET: {
			return initialState;
		}
	}

	return state;
} );
