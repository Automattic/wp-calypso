import {
	SIGNUP_STEPS_SITE_INFO_COLLECTION_UPDATE,
	SIGNUP_STEPS_SITE_INFO_UPDATE_CURRENT_SECTION,
	SIGNUP_COMPLETE_RESET,
} from 'calypso/state/action-types';
import { withSchemaValidation } from 'calypso/state/utils';
import { schema, initialState, SiteInfoCollectionData } from './schema';
import type { AnyAction } from 'redux';

export default withSchemaValidation(
	schema,
	( state = initialState, action: AnyAction ): SiteInfoCollectionData => {
		switch ( action.type ) {
			case SIGNUP_STEPS_SITE_INFO_COLLECTION_UPDATE:
				return {
					...state,
					siteInfo: {
						...action.payload,
					},
				};
			case SIGNUP_STEPS_SITE_INFO_UPDATE_CURRENT_SECTION:
				return {
					...state,
					initialOpenSectionId: action.payload,
					sectionsTouched: {
						...state.sectionsTouched,
						[ action.payload ]: true,
					},
				};
			case SIGNUP_COMPLETE_RESET: {
				return initialState;
			}
		}

		return state;
	}
);
