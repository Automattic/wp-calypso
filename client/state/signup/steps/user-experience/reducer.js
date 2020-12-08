/**
 * Internal dependencies
 */
import {
	SIGNUP_COMPLETE_RESET,
	SIGNUP_STEPS_USER_EXPERIENCE_SET,
} from 'calypso/state/action-types';

import { withSchemaValidation } from 'calypso/state/utils';
import { userExperienceSchema } from './schema';

export default withSchemaValidation( userExperienceSchema, ( state = '', action ) => {
	switch ( action.type ) {
		case SIGNUP_STEPS_USER_EXPERIENCE_SET: {
			return action.userExperience;
		}
		case SIGNUP_COMPLETE_RESET: {
			return '';
		}
	}

	return state;
} );
