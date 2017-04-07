/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	NOT_SUBMITTED,
	SUBMITTING,
	SUBMIT_FAILURE,
	SUBMITTED,
} from './constants';

export function isSessionEligibleForNpsSurvey( state ) {
	return get( state.npsSurvey, 'isSessionEligible', false );
}

function getNpsSurveyState( state ) {
	return get( state.npsSurvey, 'surveyState', NOT_SUBMITTED );
}

export function isNpsSurveyNotSubmitted( state ) {
	return getNpsSurveyState( state ) === NOT_SUBMITTED;
}

export function isNpsSurveySubmitting( state ) {
	return getNpsSurveyState( state ) === SUBMITTING;
}

export function isNpsSurveySubmitted( state ) {
	return getNpsSurveyState( state ) === SUBMITTED;
}

export function isNpsSurveySubmitFailure( state ) {
	return getNpsSurveyState( state ) === SUBMIT_FAILURE;
}

export function getNpsSurveyName( state ) {
	return get( state.npsSurvey, 'surveyName', null );
}

export function getNpsSurveyScore( state ) {
	return get( state.npsSurvey, 'score', null );
}

export function hasAnsweredNpsSurvey( state ) {
	return ! isNpsSurveyNotSubmitted( state ) &&
		Number.isInteger( getNpsSurveyScore( state ) );
}

export function hasAnsweredNpsSurveyWithNoScore( state ) {
	return ! isNpsSurveyNotSubmitted( state ) &&
		! Number.isInteger( getNpsSurveyScore( state ) );
}
