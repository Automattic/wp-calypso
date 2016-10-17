/**
 * Internal dependencies
 */
import {
	SIGNUP_STEPS_SURVEY_SET,
} from 'state/action-types';

import { createReducer } from 'state/utils';
import { surveyStepSchema } from './schema';

export default createReducer( {},
	{
		[ SIGNUP_STEPS_SURVEY_SET ]: ( state = {}, action ) => {
			return {
				...state,
				vertical: action.survey.vertical,
				otherText: action.survey.otherText
			};
		},
	},
	surveyStepSchema
);
