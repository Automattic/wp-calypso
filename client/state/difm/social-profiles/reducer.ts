import {
	SIGNUP_STEPS_SOCIAL_PROFILES_UPDATE,
	SIGNUP_COMPLETE_RESET,
	SIGNUP_STEPS_SOCIAL_PROFILES_RESET,
} from 'calypso/state/action-types';
import { withSchemaValidation } from 'calypso/state/utils';
import { schema, initialState, SUPPORTED_SOCIAL_PROFILES } from './schema';
import type { AnyAction } from 'redux';

export default withSchemaValidation( schema, ( state = initialState, action: AnyAction ) => {
	switch ( action.type ) {
		case SIGNUP_STEPS_SOCIAL_PROFILES_UPDATE:
			return {
				...state,
				...SUPPORTED_SOCIAL_PROFILES.reduce(
					( newState, socialProfile ) => ( {
						...newState,
						[ socialProfile ]: action.payload[ socialProfile ],
					} ),
					{}
				),
			};
		case SIGNUP_STEPS_SOCIAL_PROFILES_RESET:
		case SIGNUP_COMPLETE_RESET: {
			return initialState;
		}
	}

	return state;
} );
