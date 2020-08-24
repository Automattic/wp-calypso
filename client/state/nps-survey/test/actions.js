/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'lib/analytics/tracks';
import { bumpStat } from 'lib/analytics/mc';
import {
	submitNpsSurvey,
	submitNpsSurveyWithNoScore,
	sendNpsSurveyFeedback,
	sendNpsSurveyFeedbackRequesting,
	sendNpsSurveyFeedbackSuccess,
	sendNpsSurveyFeedbackFailure,
} from '../actions';
import {
	NPS_SURVEY_SEND_FEEDBACK_REQUESTING,
	NPS_SURVEY_SEND_FEEDBACK_REQUEST_SUCCESS,
	NPS_SURVEY_SEND_FEEDBACK_REQUEST_FAILURE,
} from 'state/action-types';

// mock modules
jest.mock( 'lib/wp', () => ( {
	undocumented: () => ( {
		// TODO: use mockResolvedValue instead when we update jest to 22.2 or later
		submitNPSSurvey: jest.fn().mockReturnValue( Promise.resolve() ),
		dismissNPSSurvey: jest.fn().mockReturnValue( Promise.resolve() ),
		sendNPSSurveyFeedback: jest.fn().mockReturnValue( Promise.resolve() ),
	} ),
} ) );
jest.mock( 'lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );
jest.mock( 'lib/analytics/mc', () => ( {
	bumpStat: jest.fn(),
} ) );

describe( 'actions', () => {
	const dispatch = jest.fn();

	describe( '#submitNpsSurvey()', () => {
		beforeEach( () => {
			bumpStat.mockClear();
			recordTracksEvent.mockClear();
			dispatch.mockClear();
		} );

		test( 'should track the successful survey submission', async () => {
			expect( bumpStat.mock.calls ).toHaveLength( 0 );
			expect( recordTracksEvent.mock.calls ).toHaveLength( 0 );

			await submitNpsSurvey( 'nps_test', 10 )( dispatch );

			expect( bumpStat.mock.calls ).toHaveLength( 1 );
			expect( bumpStat.mock.calls[ 0 ] ).toEqual( [ 'calypso_nps_survey', 'survey_submitted' ] );

			expect( recordTracksEvent.mock.calls ).toHaveLength( 1 );
			expect( recordTracksEvent.mock.calls[ 0 ] ).toEqual( [ 'calypso_nps_survey_submitted' ] );
		} );
	} );

	describe( '#submitNpsSurveyWithNoScore', () => {
		beforeEach( () => {
			bumpStat.mockClear();
			recordTracksEvent.mockClear();
			dispatch.mockClear();
		} );

		test( 'should track the successful survey dismissal', async () => {
			expect( bumpStat.mock.calls ).toHaveLength( 0 );
			expect( recordTracksEvent.mock.calls ).toHaveLength( 0 );

			await submitNpsSurveyWithNoScore( 'nps_test' )( dispatch );

			expect( bumpStat.mock.calls ).toHaveLength( 1 );
			expect( bumpStat.mock.calls[ 0 ] ).toEqual( [ 'calypso_nps_survey', 'survey_dismissed' ] );

			expect( recordTracksEvent.mock.calls ).toHaveLength( 1 );
			expect( recordTracksEvent.mock.calls[ 0 ] ).toEqual( [ 'calypso_nps_survey_dismissed' ] );
		} );
	} );

	describe( '#sendNpsSurveyFeedback', () => {
		beforeEach( () => {
			bumpStat.mockClear();
			recordTracksEvent.mockClear();
			dispatch.mockClear();
		} );

		test( 'should track the successful feedback submission', async () => {
			expect( bumpStat.mock.calls ).toHaveLength( 0 );
			expect( recordTracksEvent.mock.calls ).toHaveLength( 0 );

			await sendNpsSurveyFeedback( 'nps_test', 'dummy feedback data' )( dispatch );

			expect( bumpStat.mock.calls ).toHaveLength( 1 );
			expect( bumpStat.mock.calls[ 0 ] ).toEqual( [ 'calypso_nps_survey', 'feedback_submitted' ] );

			expect( recordTracksEvent.mock.calls ).toHaveLength( 1 );
			expect( recordTracksEvent.mock.calls[ 0 ] ).toEqual( [
				'calypso_nps_survey_feedback_submitted',
			] );
		} );
	} );

	describe( '#sendNpsSurveyFeedbackRequesting()', () => {
		test( 'should create a valid NPS_SURVEY_SEND_FEEDBACK_REQUESTING action', () => {
			const surveyName = 'dummy-nps-survey';
			const feedback = 'dummy contextual feedback';
			const action = sendNpsSurveyFeedbackRequesting( surveyName, feedback );
			expect( action ).toEqual( {
				type: NPS_SURVEY_SEND_FEEDBACK_REQUESTING,
				surveyName,
				feedback,
			} );
		} );
	} );

	describe( '#sendNpsSurveyFeedbackSuccess()', () => {
		test( 'should create a valid NPS_SURVEY_SEND_FEEDBACK_REQUEST_SUCCESS action', () => {
			const action = sendNpsSurveyFeedbackSuccess();
			expect( action ).toEqual( { type: NPS_SURVEY_SEND_FEEDBACK_REQUEST_SUCCESS } );
		} );
	} );

	describe( '#sendNpsSurveyFeedbackFailure()', () => {
		test( 'should create a valid NPS_SURVEY_SEND_FEEDBACK_REQUEST_FAILURE action', () => {
			const error = { message: 'dummy error message' };
			const action = sendNpsSurveyFeedbackFailure( error );
			expect( action ).toEqual( {
				type: NPS_SURVEY_SEND_FEEDBACK_REQUEST_FAILURE,
				error,
			} );
		} );
	} );
} );
