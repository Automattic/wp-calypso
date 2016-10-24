/**
 * External dependencies
 */
import get from 'lodash/get';

export function getSurveyVertical( state ) {
	return get( state, 'signup.steps.survey.vertical', '' );
}

export function getSurveyOtherText( state ) {
	return get( state, 'signup.steps.survey.otherText', '' );
}
