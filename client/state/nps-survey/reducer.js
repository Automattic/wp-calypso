/**
 * Internal dependencies
 */
import { withStorageKey } from '@automattic/state-utils';
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
	NPS_SURVEY_SEND_FEEDBACK_REQUEST_FAILURE,
	NPS_SURVEY_SEND_FEEDBACK_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import { NOT_SUBMITTED, SUBMITTING, SUBMIT_FAILURE, SUBMITTED } from './constants';
import notice from './notice/reducer';

export const isSessionEligible = ( state = false, action ) => {
	switch ( action.type ) {
		case NPS_SURVEY_SET_ELIGIBILITY:
			return action.isSessionPicked;
	}

	return state;
};

export const isAvailableForConciergeSession = ( state = false, action ) => {
	switch ( action.type ) {
		case NPS_SURVEY_SET_CONCIERGE_SESSION_AVAILABILITY:
			return action.isAvailableForConciergeSession;
	}

	return state;
};

export const wasShownThisSession = ( state = false, action ) => {
	switch ( action.type ) {
		case NPS_SURVEY_MARK_SHOWN_THIS_SESSION:
			return true;
	}

	return state;
};

export const surveyState = ( state = NOT_SUBMITTED, action ) => {
	switch ( action.type ) {
		case NPS_SURVEY_SUBMIT_REQUESTING:
			return SUBMITTING;
		case NPS_SURVEY_SUBMIT_REQUEST_FAILURE:
			return SUBMIT_FAILURE;
		case NPS_SURVEY_SUBMIT_REQUEST_SUCCESS:
			return SUBMITTED;
		case NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUESTING:
			return SUBMITTING;
		case NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUEST_FAILURE:
			return SUBMIT_FAILURE;
		case NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUEST_SUCCESS:
			return SUBMITTED;
		case NPS_SURVEY_SEND_FEEDBACK_REQUESTING:
			return SUBMITTING;
		case NPS_SURVEY_SEND_FEEDBACK_REQUEST_FAILURE:
			return SUBMIT_FAILURE;
		case NPS_SURVEY_SEND_FEEDBACK_REQUEST_SUCCESS:
			return SUBMITTED;
	}

	return state;
};

export const surveyName = ( state = null, action ) => {
	switch ( action.type ) {
		case NPS_SURVEY_SUBMIT_REQUESTING: {
			return action.surveyName;
		}
		case NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUESTING: {
			return action.surveyName;
		}
		case NPS_SURVEY_SEND_FEEDBACK_REQUESTING: {
			return action.surveyName;
		}
	}

	return state;
};

export const score = ( state = null, action ) => {
	switch ( action.type ) {
		case NPS_SURVEY_SUBMIT_REQUESTING: {
			return action.score;
		}
	}

	return state;
};

export const feedback = ( state = null, action ) => {
	switch ( action.type ) {
		case NPS_SURVEY_SEND_FEEDBACK_REQUESTING: {
			return action.feedback;
		}
	}

	return state;
};

const combinedReducer = combineReducers( {
	isSessionEligible,
	isAvailableForConciergeSession,
	wasShownThisSession,
	surveyState,
	surveyName,
	score,
	feedback,
	notice,
} );

export default withStorageKey( 'npsSurvey', combinedReducer );
