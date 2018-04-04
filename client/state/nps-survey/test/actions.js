/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	sendNpsSurveyFeedbackRequesting,
	sendNpsSurveyFeedbackSuccess,
	sendNpsSurveyFeedbackFailure,
} from '../actions';
import {
	NPS_SURVEY_SEND_FEEDBACK_REQUESTING,
	NPS_SURVEY_SEND_FEEDBACK_REQUEST_SUCCESS,
	NPS_SURVEY_SEND_FEEDBACK_REQUEST_FAILURE,
} from 'state/action-types';

describe( 'actions', () => {
	describe( 'creators functions', () => {
		test( '#sendNpsSurveyFeedbackRequesting()', () => {
			const surveyName = 'dummy-nps-survey';
			const feedback = 'dummy contextual feedback';
			const action = sendNpsSurveyFeedbackRequesting( surveyName, feedback );
			expect( action ).to.eql( {
				type: NPS_SURVEY_SEND_FEEDBACK_REQUESTING,
				surveyName,
				feedback,
			} );
		} );

		test( '#sendNpsSurveyFeedbackSuccess()', () => {
			const action = sendNpsSurveyFeedbackSuccess();
			expect( action ).to.eql( { type: NPS_SURVEY_SEND_FEEDBACK_REQUEST_SUCCESS } );
		} );

		test( '#sendNpsSurveyFeedbackFailure()', () => {
			const error = { message: 'dummy error message' };
			const action = sendNpsSurveyFeedbackFailure( error );
			expect( action ).to.eql( {
				type: NPS_SURVEY_SEND_FEEDBACK_REQUEST_FAILURE,
				error,
			} );
		} );
	} );
} );
