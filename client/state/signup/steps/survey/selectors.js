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

export function getSurveySiteType( state ) {
	return get( state, 'signup.steps.survey.siteType', 'site' );
}
