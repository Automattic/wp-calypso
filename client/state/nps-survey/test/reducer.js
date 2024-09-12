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
} from 'calypso/state/action-types';
import { NOT_SUBMITTED, SUBMITTING, SUBMIT_FAILURE, SUBMITTED } from '../constants';
import reducer, {
	isSessionEligible,
	isAvailableForConciergeSession,
	wasShownThisSession,
	surveyState,
	surveyName,
	score,
	feedback,
} from '../reducer';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [
				'isSessionEligible',
				'isAvailableForConciergeSession',
				'wasShownThisSession',
				'surveyState',
				'surveyName',
				'score',
				'feedback',
				'notice',
			] )
		);
	} );

	describe( '#isSessionEligible()', () => {
		test( 'should default to not eligible', () => {
			const state = isSessionEligible( undefined, {} );

			expect( state ).toBe( false );
		} );

		test( 'should track if session is eligible', () => {
			const state = isSessionEligible( undefined, {
				type: NPS_SURVEY_SET_ELIGIBILITY,
				isSessionPicked: true,
			} );

			expect( state ).toBe( true );
		} );

		test( 'should track if session is not eligible', () => {
			const state = isSessionEligible( undefined, {
				type: NPS_SURVEY_SET_ELIGIBILITY,
				isSessionPicked: false,
			} );

			expect( state ).toBe( false );
		} );
	} );

	describe( '#isAvailableForConciergeSession()', () => {
		test( 'should default to not available', () => {
			const state = isAvailableForConciergeSession( undefined, {} );

			expect( state ).toBe( false );
		} );

		test( 'should track if user is available for concierge session', () => {
			const state = isAvailableForConciergeSession( undefined, {
				type: NPS_SURVEY_SET_CONCIERGE_SESSION_AVAILABILITY,
				isAvailableForConciergeSession: true,
			} );

			expect( state ).toBe( true );
		} );

		test( 'should track if user is not available for concierge session', () => {
			const state = isAvailableForConciergeSession( undefined, {
				type: NPS_SURVEY_SET_CONCIERGE_SESSION_AVAILABILITY,
				isAvailableForConciergeSession: false,
			} );

			expect( state ).toBe( false );
		} );
	} );

	describe( '#wasShownThisSession()', () => {
		test( 'should default to not shown', () => {
			const state = wasShownThisSession( undefined, {} );

			expect( state ).toBe( false );
		} );

		test( 'should track if survey was shown', () => {
			const state = wasShownThisSession( undefined, {
				type: NPS_SURVEY_MARK_SHOWN_THIS_SESSION,
			} );

			expect( state ).toBe( true );
		} );
	} );

	describe( '#surveyState()', () => {
		test( 'should default to not submitted', () => {
			const state = surveyState( undefined, {} );

			expect( state ).toEqual( NOT_SUBMITTED );
		} );

		test( 'should track if submitting', () => {
			const state = surveyState( undefined, {
				type: NPS_SURVEY_SUBMIT_REQUESTING,
				surveyName: 'boo',
				score: 7,
			} );

			expect( state ).toEqual( SUBMITTING );
		} );

		test( 'should track if submitted', () => {
			const state = surveyState( undefined, {
				type: NPS_SURVEY_SUBMIT_REQUEST_SUCCESS,
			} );

			expect( state ).toEqual( SUBMITTED );
		} );

		test( 'should track if failed to submit', () => {
			const state = surveyState( undefined, {
				type: NPS_SURVEY_SUBMIT_REQUEST_FAILURE,
			} );

			expect( state ).toEqual( SUBMIT_FAILURE );
		} );

		test( 'should track if submitting with no score', () => {
			const state = surveyState( undefined, {
				type: NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUESTING,
				surveyName: 'boo',
			} );

			expect( state ).toEqual( SUBMITTING );
		} );

		test( 'should track if submitted with no score', () => {
			const state = surveyState( undefined, {
				type: NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUEST_SUCCESS,
			} );

			expect( state ).toEqual( SUBMITTED );
		} );

		test( 'should track if failed to submit with no score', () => {
			const state = surveyState( undefined, {
				type: NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUEST_FAILURE,
			} );

			expect( state ).toEqual( SUBMIT_FAILURE );
		} );
	} );

	describe( '#surveyName()', () => {
		test( 'should default to null', () => {
			const state = surveyName( undefined, {} );

			expect( state ).toBe( null );
		} );

		test( 'should track if submitting', () => {
			const state = surveyName( undefined, {
				type: NPS_SURVEY_SUBMIT_REQUESTING,
				surveyName: 'boo',
				score: 7,
			} );

			expect( state ).toEqual( 'boo' );
		} );

		test( 'should track if submitting with no score', () => {
			const state = surveyName( undefined, {
				type: NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUESTING,
				surveyName: 'boo',
			} );

			expect( state ).toEqual( 'boo' );
		} );
	} );

	describe( '#score()', () => {
		test( 'should default to null', () => {
			const state = score( undefined, {} );

			expect( state ).toBe( null );
		} );

		test( 'should track if submitting', () => {
			const state = score( undefined, {
				type: NPS_SURVEY_SUBMIT_REQUESTING,
				surveyName: 'boo',
				score: 7,
			} );

			expect( state ).toEqual( 7 );
		} );

		test( 'should track if submitting with no score', () => {
			const state = score( undefined, {
				type: NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUESTING,
				surveyName: 'boo',
			} );

			expect( state ).toEqual( null );
		} );
	} );

	describe( '#feedback()', () => {
		test( 'should default to null', () => {
			const state = feedback( undefined, {} );

			expect( state ).toBe( null );
		} );

		test( 'should track the feedback if submitting', () => {
			const state = feedback( undefined, {
				type: NPS_SURVEY_SEND_FEEDBACK_REQUESTING,
				surveyName: 'boo',
				feedback: 'feedback for testing',
			} );

			expect( state ).toEqual( 'feedback for testing' );
		} );

		test( 'should track if submitting', () => {
			const state = surveyState( undefined, {
				type: NPS_SURVEY_SEND_FEEDBACK_REQUESTING,
				surveyName: 'boo',
				feedback: 'feedback for testing',
			} );

			expect( state ).toEqual( SUBMITTING );
		} );

		test( 'should track if submitted', () => {
			const state = surveyState( undefined, {
				type: NPS_SURVEY_SEND_FEEDBACK_REQUEST_SUCCESS,
			} );

			expect( state ).toEqual( SUBMITTED );
		} );

		test( 'should track if failed to submit', () => {
			const state = surveyState( undefined, {
				type: NPS_SURVEY_SEND_FEEDBACK_REQUEST_FAILURE,
			} );

			expect( state ).toEqual( SUBMIT_FAILURE );
		} );
	} );
} );
