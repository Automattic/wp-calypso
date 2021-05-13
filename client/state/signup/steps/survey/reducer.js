/**
 * Internal dependencies
 */
import { SIGNUP_STEPS_SURVEY_SET, SIGNUP_COMPLETE_RESET } from 'calypso/state/action-types';

import { withSchemaValidation } from 'calypso/state/utils';
import { surveyStepSchema } from './schema';

export default withSchemaValidation( surveyStepSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case SIGNUP_STEPS_SURVEY_SET:
			return {
				...state,
				vertical: action.survey.vertical,
				otherText: action.survey.otherText,
				siteType: action.survey.siteType,
			};
		case SIGNUP_COMPLETE_RESET: {
			return {};
		}
	}

	return state;
} );
