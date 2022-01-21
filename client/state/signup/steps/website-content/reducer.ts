import {
	SIGNUP_STEPS_WEBSITE_CONTENT_UPDATE_CURRENT_INDEX,
	SIGNUP_STEPS_WEBSITE_CONTENT_UPDATE,
	SIGNUP_COMPLETE_RESET,
} from 'calypso/state/action-types';
import { withSchemaValidation } from 'calypso/state/utils';
import { schema, initialState, WebsiteContentCollection } from './schema';
import type { AnyAction } from 'redux';

export default withSchemaValidation(
	schema,
	( state = initialState, action: AnyAction ): WebsiteContentCollection => {
		switch ( action.type ) {
			case SIGNUP_STEPS_WEBSITE_CONTENT_UPDATE:
				return {
					...state,
					websiteContent: [ ...action.payload ],
				};
			case SIGNUP_STEPS_WEBSITE_CONTENT_UPDATE_CURRENT_INDEX:
				return {
					...state,
					currentIndex: action.payload,
				};
			case SIGNUP_COMPLETE_RESET: {
				return initialState;
			}
		}

		return state;
	}
);
