/**
 * External dependencies
 */
import debugFactory from 'debug';
import wpcom from 'lib/wp';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { bumpStat } from 'lib/analytics/mc';
import {
	NPS_SURVEY_SET_ELIGIBILITY,
	NPS_SURVEY_SET_CONCIERGE_SESSION_AVAILABILITY,
	NPS_SURVEY_MARK_SHOWN_THIS_SESSION,
	NPS_SURVEY_SUBMIT_REQUESTING,
	NPS_SURVEY_SUBMIT_REQUEST_FAILURE,
	NPS_SURVEY_SUBMIT_REQUEST_SUCCESS,
	NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUESTING,
	NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUEST_FAILURE,
	NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUEST_SUCCESS,
	NPS_SURVEY_SEND_FEEDBACK_REQUESTING,
	NPS_SURVEY_SEND_FEEDBACK_REQUEST_SUCCESS,
	NPS_SURVEY_SEND_FEEDBACK_REQUEST_FAILURE,
} from 'state/action-types';

const debug = debugFactory( 'calypso:nps-survey' );

export function setNpsSurveyEligibility( isEligible ) {
	return {
		type: NPS_SURVEY_SET_ELIGIBILITY,
		isSessionPicked: isEligible,
	};
}

export function setNpsConciergeSessionAvailaibility( isAvailableForConciergeSession ) {
	return {
		type: NPS_SURVEY_SET_CONCIERGE_SESSION_AVAILABILITY,
		isAvailableForConciergeSession,
	};
}

export function setupNpsSurveyEligibility() {
	return dispatch => {
		debug( 'Checking NPS eligibility...' );

		return wpcom
			.undocumented()
			.checkNPSSurveyEligibility()
			.then( data => {
				debug( '...Eligibility returned from endpoint.', data );
				dispatch( setNpsSurveyEligibility( data.display_survey ) );
				dispatch( setNpsConciergeSessionAvailaibility( data.has_available_concierge_sessions ) );
			} )
			.catch( err => {
				debug( '...Error querying NPS survey eligibility.', err );
				dispatch( setNpsSurveyEligibility( false ) );
				dispatch( setNpsConciergeSessionAvailaibility( false ) );
			} );
	};
}

export function markNpsSurveyShownThisSession() {
	return {
		type: NPS_SURVEY_MARK_SHOWN_THIS_SESSION,
	};
}

export function submitNpsSurvey( surveyName, score ) {
	return dispatch => {
		debug( 'Submitting NPS survey...' );
		dispatch( submitNpsSurveyRequesting( surveyName, score ) );

		bumpStat( 'calypso_nps_survey', 'survey_submitted' );
		analytics.tracks.recordEvent( 'calypso_nps_survey_submitted' );

		return wpcom
			.undocumented()
			.submitNPSSurvey( surveyName, score )
			.then( () => {
				debug( '...Successfully submitted NPS survey.' );
				dispatch( submitNpsSurveyRequestSuccess() );
			} )
			.catch( err => {
				debug( '...Error submitting NPS survey.', err );
				dispatch( submitNpsSurveyRequestFailure( err ) );
			} );
	};
}

export function submitNpsSurveyWithNoScore( surveyName ) {
	return dispatch => {
		debug( 'Submitting NPS survey with no score...' );
		dispatch( submitNpsSurveyWithNoScoreRequesting( surveyName ) );

		bumpStat( 'calypso_nps_survey', 'survey_dismissed' );
		analytics.tracks.recordEvent( 'calypso_nps_survey_dismissed' );

		return wpcom
			.undocumented()
			.dismissNPSSurvey( surveyName )
			.then( () => {
				debug( '...Successfully submitted NPS survey with no score.' );
				dispatch( submitNpsSurveyWithNoScoreRequestSuccess() );
			} )
			.catch( err => {
				debug( '...Error submitting NPS survey with no score.', err );
				dispatch( submitNpsSurveyWithNoScoreRequestFailure( err ) );
			} );
	};
}

export function sendNpsSurveyFeedback( surveyName, feedback ) {
	return dispatch => {
		debug( 'Sending NPS survey feedback...' );
		dispatch( sendNpsSurveyFeedbackRequesting( surveyName, feedback ) );

		bumpStat( 'calypso_nps_survey', 'feedback_submitted' );
		analytics.tracks.recordEvent( 'calypso_nps_survey_feedback_submitted' );

		return wpcom
			.undocumented()
			.sendNPSSurveyFeedback( surveyName, feedback )
			.then( () => {
				debug( '...Successfully sent NPS survey feedback.' );
				dispatch( sendNpsSurveyFeedbackSuccess() );
			} )
			.catch( err => {
				debug( '...Error sending NPS survey feedback.' );
				dispatch( sendNpsSurveyFeedbackFailure( err ) );
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

export function sendNpsSurveyFeedbackRequesting( surveyName, feedback ) {
	return {
		type: NPS_SURVEY_SEND_FEEDBACK_REQUESTING,
		surveyName,
		feedback,
	};
}

export function sendNpsSurveyFeedbackSuccess() {
	return {
		type: NPS_SURVEY_SEND_FEEDBACK_REQUEST_SUCCESS,
	};
}

export function sendNpsSurveyFeedbackFailure( error ) {
	return {
		type: NPS_SURVEY_SEND_FEEDBACK_REQUEST_FAILURE,
		error,
	};
}
