/**
 * External dependencies
 */
import debugFactory from 'debug';
import wpcom from 'lib/wp';
import { random } from 'lodash';

/**
 * Internal dependencies
 */
import {
	NPS_SURVEY_SETUP_ELIGIBILITY_REQUESTING,
	NPS_SURVEY_SUBMIT_REQUESTING,
	NPS_SURVEY_SUBMIT_REQUEST_FAILURE,
	NPS_SURVEY_SUBMIT_REQUEST_SUCCESS,
	NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUESTING,
	NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUEST_FAILURE,
	NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUEST_SUCCESS,
} from 'state/action-types';
import {
	NPS_SURVEY_RAND_MAX,
} from './constants';

const debug = debugFactory( 'calypso:nps-survey' );

export function setupNpsSurveyEligibility() {
	// TODO: add calls to API once eligibility endpoint is in
	return {
		type: NPS_SURVEY_SETUP_ELIGIBILITY_REQUESTING,
		isSessionPicked: 1 === random( 1, NPS_SURVEY_RAND_MAX ),
	};
}

export function submitNpsSurvey( surveyName, score ) {
	return ( dispatch ) => {
		debug( 'Submitting NPS survey...' );
		dispatch( submitNpsSurveyRequesting( surveyName, score ) );

		return wpcom
			.undocumented()
			.submitNPSSurvey( surveyName, score )
			.then( () => {
				debug( '...Successfully submitted NPS survey.' );
				dispatch( submitNpsSurveyRequestSuccess() );
			} )
			.catch( ( err ) => {
				debug( '...Error submitting NPS survey.', err );
				dispatch( submitNpsSurveyRequestFailure( err ) );
			} );
	};
}

export function submitNpsSurveyWithNoScore( surveyName ) {
	return ( dispatch ) => {
		debug( 'Submitting NPS survey with no score...' );
		dispatch( submitNpsSurveyWithNoScoreRequesting( surveyName ) );

		return wpcom
			.undocumented()
			.dismissNPSSurvey( surveyName )
			.then( () => {
				debug( '...Successfully submitted NPS survey with no score.' );
				dispatch( submitNpsSurveyWithNoScoreRequestSuccess() );
			} )
			.catch( ( err ) => {
				debug( '...Error submitting NPS survey with no score.', err );
				dispatch( submitNpsSurveyWithNoScoreRequestFailure( err ) );
			} );
	};
}

export function submitNpsSurveyRequesting( surveyName, score ) {
	return {
		type: NPS_SURVEY_SUBMIT_REQUESTING,
		surveyName,
		score,
	};
}

export function submitNpsSurveyRequestSuccess() {
	return {
		type: NPS_SURVEY_SUBMIT_REQUEST_SUCCESS,
	};
}

export function submitNpsSurveyRequestFailure( err ) {
	return {
		type: NPS_SURVEY_SUBMIT_REQUEST_FAILURE,
		error: err,
	};
}

export function submitNpsSurveyWithNoScoreRequesting( surveyName ) {
	return {
		type: NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUESTING,
		surveyName,
	};
}

export function submitNpsSurveyWithNoScoreRequestSuccess() {
	return {
		type: NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUEST_SUCCESS,
	};
}

export function submitNpsSurveyWithNoScoreRequestFailure( err ) {
	return {
		type: NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUEST_FAILURE,
		error: err,
	};
}
