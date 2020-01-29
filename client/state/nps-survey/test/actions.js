/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
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
jest.mock( 'lib/analytics', () => ( {
	mc: { bumpStat: jest.fn() },
	tracks: { recordEvent: jest.fn() },
} ) );

describe( 'actions', () => {
	const dispatch = jest.fn();

	describe( '#submitNpsSurvey()', () => {
		beforeEach( () => {
			analytics.mc.bumpStat.mockClear();
			analytics.tracks.recordEvent.mockClear();
			dispatch.mockClear();
		} );

		test( 'should track the successful survey submission', async () => {
			expect( analytics.mc.bumpStat.mock.calls ).toHaveLength( 0 );
			expect( analytics.tracks.recordEvent.mock.calls ).toHaveLength( 0 );

			await submitNpsSurvey( 'nps_test', 10 )( dispatch );

			expect( analytics.mc.bumpStat.mock.calls ).toHaveLength( 1 );
			expect( analytics.mc.bumpStat.mock.calls[ 0 ] ).toEqual( [
				'calypso_nps_survey',
				'survey_submitted',
			] );

			expect( analytics.tracks.recordEvent.mock.calls ).toHaveLength( 1 );
			expect( analytics.tracks.recordEvent.mock.calls[ 0 ] ).toEqual( [
				'calypso_nps_survey_submitted',
			] );
		} );
	} );

	describe( '#submitNpsSurveyWithNoScore', () => {
		beforeEach( () => {
			analytics.mc.bumpStat.mockClear();
			analytics.tracks.recordEvent.mockClear();
			dispatch.mockClear();
		} );

		test( 'should track the successful survey dismissal', async () => {
			expect( analytics.mc.bumpStat.mock.calls ).toHaveLength( 0 );
			expect( analytics.tracks.recordEvent.mock.calls ).toHaveLength( 0 );

			await submitNpsSurveyWithNoScore( 'nps_test' )( dispatch );

			expect( analytics.mc.bumpStat.mock.calls ).toHaveLength( 1 );
			expect( analytics.mc.bumpStat.mock.calls[ 0 ] ).toEqual( [
				'calypso_nps_survey',
				'survey_dismissed',
			] );

			expect( analytics.tracks.recordEvent.mock.calls ).toHaveLength( 1 );
			expect( analytics.tracks.recordEvent.mock.calls[ 0 ] ).toEqual( [
				'calypso_nps_survey_dismissed',
			] );
		} );
	} );

	describe( '#sendNpsSurveyFeedback', () => {
		beforeEach( () => {
			analytics.mc.bumpStat.mockClear();
			analytics.tracks.recordEvent.mockClear();
			dispatch.mockClear();
		} );

		test( 'should track the successful feedback submission', async () => {
			expect( analytics.mc.bumpStat.mock.calls ).toHaveLength( 0 );
			expect( analytics.tracks.recordEvent.mock.calls ).toHaveLength( 0 );

			await sendNpsSurveyFeedback( 'nps_test', 'dummy feedback data' )( dispatch );

			expect( analytics.mc.bumpStat.mock.calls ).toHaveLength( 1 );
			expect( analytics.mc.bumpStat.mock.calls[ 0 ] ).toEqual( [
				'calypso_nps_survey',
				'feedback_submitted',
			] );

			expect( analytics.tracks.recordEvent.mock.calls ).toHaveLength( 1 );
			expect( analytics.tracks.recordEvent.mock.calls[ 0 ] ).toEqual( [
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
