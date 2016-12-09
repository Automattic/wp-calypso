/**
 * Internal dependencies
 */
import {
	SIGNUP_STEPS_SURVEY_SET,
	SIGNUP_COMPLETE_RESET,
} from 'state/action-types';

import { createReducer } from 'state/utils';
import { surveyStepSchema } from './schema';

export default createReducer( {},
	{
		[ SIGNUP_STEPS_SURVEY_SET ]: ( state = {}, action ) => {
			return {
				...state,
				vertical: action.survey.vertical,
				otherText: action.survey.otherText,
				siteType: action.survey.siteType,
			};
		},
		[ SIGNUP_COMPLETE_RESET ]: () => {
			return {};
		},
	},
	surveyStepSchema
);
