/**
 * Internal dependencies
 */
import { SIGNUP_STEPS_SURVEY_SET } from 'state/action-types';

export function setSurvey(survey) {
    return {
        type: SIGNUP_STEPS_SURVEY_SET,
        survey,
    };
}
