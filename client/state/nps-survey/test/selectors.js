import { NOT_SUBMITTED, SUBMITTING, SUBMIT_FAILURE, SUBMITTED } from '../constants';
import {
	isSessionEligibleForNpsSurvey,
	isSectionEligibleForNpsSurvey,
	isSectionAndSessionEligibleForNpsSurvey,
	wasNpsSurveyShownThisSession,
	isNpsSurveyNotSubmitted,
	isNpsSurveySubmitting,
	isNpsSurveySubmitted,
	isNpsSurveySubmitFailure,
	getNpsSurveyName,
	getNpsSurveyScore,
	hasAnsweredNpsSurvey,
	hasAnsweredNpsSurveyWithNoScore,
	getNpsSurveyFeedback,
} from '../selectors';

describe( 'isSessionEligibleForNpsSurvey', () => {
	test( 'should return true if the session is eligible for the NPS survey', () => {
		const isEligible = isSessionEligibleForNpsSurvey( {
			npsSurvey: {
				isSessionEligible: true,
			},
		} );

		expect( isEligible ).toBe( true );
	} );

	test( 'should return false if the session is not eligible for the NPS survey', () => {
		const isEligible = isSessionEligibleForNpsSurvey( {
			npsSurvey: {
				isSessionEligible: false,
			},
		} );

		expect( isEligible ).toBe( false );
	} );
} );

describe( 'isSectionEligibleForNpsSurvey', () => {
	test( 'should return true if the section is eligible for the NPS survey', () => {
		const isEligible = isSectionEligibleForNpsSurvey( {
			ui: {
				section: {
					name: 'stats',
				},
			},
		} );

		expect( isEligible ).toBe( true );
	} );

	test( 'should return false if the section is not eligible for the NPS survey', () => {
		const isEligible = isSectionEligibleForNpsSurvey( {
			ui: {
				section: {
					name: 'plans',
				},
			},
		} );

		expect( isEligible ).toBe( false );
	} );
} );

describe( 'isSectionAndSessionEligibleForNpsSurvey', () => {
	test( 'should return true if the section and session is eligible for the NPS survey', () => {
		const isEligible = isSectionAndSessionEligibleForNpsSurvey( {
			ui: {
				section: {
					name: 'stats',
				},
			},
			npsSurvey: {
				isSessionEligible: true,
			},
		} );

		expect( isEligible ).toBe( true );
	} );

	test( 'should return false if the section is eligible but the session is not for the NPS survey', () => {
		const isEligible = isSectionAndSessionEligibleForNpsSurvey( {
			ui: {
				section: {
					name: 'stats',
				},
			},
			npsSurvey: {
				isSessionEligible: false,
			},
		} );

		expect( isEligible ).toBe( false );
	} );

	test( 'should return false if the section is not eligible but the session is for the NPS survey', () => {
		const isEligible = isSectionAndSessionEligibleForNpsSurvey( {
			ui: {
				section: {
					name: 'upgrades',
				},
			},
			npsSurvey: {
				isSessionEligible: true,
			},
		} );

		expect( isEligible ).toBe( false );
	} );

	test( 'should return false if the section and the session are not eligible for the NPS survey', () => {
		const isEligible = isSectionAndSessionEligibleForNpsSurvey( {
			ui: {
				section: {
					name: 'upgrades',
				},
			},
			npsSurvey: {
				isSessionEligible: false,
			},
		} );

		expect( isEligible ).toBe( false );
	} );
} );

describe( 'wasNpsSurveyShownThisSession', () => {
	test( 'should return true if the NPS survey was shown this session', () => {
		const wasShown = wasNpsSurveyShownThisSession( {
			npsSurvey: {
				wasShownThisSession: true,
			},
		} );

		expect( wasShown ).toBe( true );
	} );

	test( 'should return false if the session is not eligible for the NPS survey', () => {
		const wasShown = wasNpsSurveyShownThisSession( {
			npsSurvey: {
				wasShownThisSession: false,
			},
		} );

		expect( wasShown ).toBe( false );
	} );
} );

describe( 'isNpsSurveyNotSubmitted', () => {
	test( 'should return true if the NPS survey has not been submitted', () => {
		const isNotSubmitted = isNpsSurveyNotSubmitted( {
			npsSurvey: {
				surveyState: NOT_SUBMITTED,
			},
		} );

		expect( isNotSubmitted ).toBe( true );
	} );

	test( 'should return false if the NPS survey is being submitted', () => {
		const isNotSubmitted = isNpsSurveyNotSubmitted( {
			npsSurvey: {
				surveyState: SUBMITTING,
			},
		} );

		expect( isNotSubmitted ).toBe( false );
	} );

	test( 'should return false if the NPS survey has been submitted', () => {
		const isNotSubmitted = isNpsSurveyNotSubmitted( {
			npsSurvey: {
				surveyState: SUBMITTED,
			},
		} );

		expect( isNotSubmitted ).toBe( false );
	} );

	test( 'should return false if the NPS survey failed to submit', () => {
		const isNotSubmitted = isNpsSurveyNotSubmitted( {
			npsSurvey: {
				surveyState: SUBMIT_FAILURE,
			},
		} );

		expect( isNotSubmitted ).toBe( false );
	} );
} );

describe( 'isNpsSurveySubmitting', () => {
	test( 'should return true if the NPS survey is being submitted', () => {
		const isSubmitting = isNpsSurveySubmitting( {
			npsSurvey: {
				surveyState: SUBMITTING,
			},
		} );

		expect( isSubmitting ).toBe( true );
	} );

	test( 'should return false if the NPS survey has not been submitted', () => {
		const isSubmitting = isNpsSurveySubmitting( {
			npsSurvey: {
				surveyState: NOT_SUBMITTED,
			},
		} );

		expect( isSubmitting ).toBe( false );
	} );

	test( 'should return false if the NPS survey has been submitted', () => {
		const isSubmitting = isNpsSurveySubmitting( {
			npsSurvey: {
				surveyState: SUBMITTED,
			},
		} );

		expect( isSubmitting ).toBe( false );
	} );

	test( 'should return false if the NPS survey has failed to submit', () => {
		const isSubmitting = isNpsSurveySubmitting( {
			npsSurvey: {
				surveyState: SUBMIT_FAILURE,
			},
		} );

		expect( isSubmitting ).toBe( false );
	} );
} );

describe( 'isNpsSurveySubmitted', () => {
	test( 'should return true if the NPS survey has been submitted', () => {
		const isSubmitted = isNpsSurveySubmitted( {
			npsSurvey: {
				surveyState: SUBMITTED,
			},
		} );

		expect( isSubmitted ).toBe( true );
	} );

	test( 'should return false if the NPS survey has not been submitted', () => {
		const isSubmitted = isNpsSurveySubmitted( {
			npsSurvey: {
				surveyState: NOT_SUBMITTED,
			},
		} );

		expect( isSubmitted ).toBe( false );
	} );

	test( 'should return false if the NPS survey is being submitted', () => {
		const isSubmitted = isNpsSurveySubmitted( {
			npsSurvey: {
				surveyState: SUBMITTING,
			},
		} );

		expect( isSubmitted ).toBe( false );
	} );

	test( 'should return false if the NPS survey has failed to submit', () => {
		const isSubmitted = isNpsSurveySubmitted( {
			npsSurvey: {
				surveyState: SUBMIT_FAILURE,
			},
		} );

		expect( isSubmitted ).toBe( false );
	} );
} );

describe( 'isNpsSurveySubmitFailure', () => {
	test( 'should return true if the NPS survey has failed to submit', () => {
		const isSubmitFailure = isNpsSurveySubmitFailure( {
			npsSurvey: {
				surveyState: SUBMIT_FAILURE,
			},
		} );

		expect( isSubmitFailure ).toBe( true );
	} );

	test( 'should return false if the NPS survey has been submitted', () => {
		const isSubmitFailure = isNpsSurveySubmitFailure( {
			npsSurvey: {
				surveyState: SUBMITTED,
			},
		} );

		expect( isSubmitFailure ).toBe( false );
	} );

	test( 'should return false if the NPS survey has not been submitted', () => {
		const isSubmitFailure = isNpsSurveySubmitFailure( {
			npsSurvey: {
				surveyState: NOT_SUBMITTED,
			},
		} );

		expect( isSubmitFailure ).toBe( false );
	} );

	test( 'should return false if the NPS survey is being submitted', () => {
		const isSubmitFailure = isNpsSurveySubmitFailure( {
			npsSurvey: {
				surveyState: SUBMITTING,
			},
		} );

		expect( isSubmitFailure ).toBe( false );
	} );
} );

describe( 'getNpsSurveyName', () => {
	test( 'should return the survey name if set', () => {
		const surveyName = getNpsSurveyName( {
			npsSurvey: {
				surveyName: 'boo',
			},
		} );

		expect( surveyName ).toEqual( 'boo' );
	} );

	test( 'should return null if the survey name is not set', () => {
		const surveyName = getNpsSurveyName( {
			npsSurvey: {},
		} );

		expect( surveyName ).toBe( null );
	} );
} );

describe( 'getNpsSurveyScore', () => {
	test( 'should return the survey score if set', () => {
		const surveyScore = getNpsSurveyScore( {
			npsSurvey: {
				score: 9,
			},
		} );

		expect( surveyScore ).toEqual( 9 );
	} );

	test( 'should return null if the survey score is not set', () => {
		const surveyScore = getNpsSurveyScore( {
			npsSurvey: {},
		} );

		expect( surveyScore ).toBe( null );
	} );
} );

describe( 'getNpsSurveyFeedback', () => {
	test( 'should return the contextual feedback if set', () => {
		const feedback = getNpsSurveyFeedback( {
			npsSurvey: {
				score: 9,
				feedback: 'contextual feedback',
			},
		} );
		expect( feedback ).toEqual( 'contextual feedback' );
	} );

	test( 'should return null if the contextual feedback is not set', () => {
		const feedback = getNpsSurveyFeedback( {
			npsSurvey: {
				score: 9,
			},
		} );
		expect( feedback ).toBe( null );
	} );
} );

describe( 'hasAnsweredNpsSurvey', () => {
	test( 'should return true if the survey is being submitted with a score', () => {
		const hasAnswered = hasAnsweredNpsSurvey( {
			npsSurvey: {
				surveyState: SUBMITTING,
				score: 9,
			},
		} );

		expect( hasAnswered ).toBe( true );
	} );

	test( 'should return true if the survey has been submitted with a score', () => {
		const hasAnswered = hasAnsweredNpsSurvey( {
			npsSurvey: {
				surveyState: SUBMITTED,
				score: 9,
			},
		} );

		expect( hasAnswered ).toBe( true );
	} );

	test( 'should return true if the survey has failed to submit with a score', () => {
		const hasAnswered = hasAnsweredNpsSurvey( {
			npsSurvey: {
				surveyState: SUBMIT_FAILURE,
				score: 9,
			},
		} );

		expect( hasAnswered ).toBe( true );
	} );

	test( 'should return false if the survey is being submitted without a score', () => {
		const hasAnswered = hasAnsweredNpsSurvey( {
			npsSurvey: {
				surveyState: SUBMITTING,
			},
		} );

		expect( hasAnswered ).toBe( false );
	} );

	test( 'should return false if the survey has been submitted without a score', () => {
		const hasAnswered = hasAnsweredNpsSurvey( {
			npsSurvey: {
				surveyState: SUBMITTED,
			},
		} );

		expect( hasAnswered ).toBe( false );
	} );

	test( 'should return false if the survey has failed to submit without a score', () => {
		const hasAnswered = hasAnsweredNpsSurvey( {
			npsSurvey: {
				surveyState: SUBMIT_FAILURE,
			},
		} );

		expect( hasAnswered ).toBe( false );
	} );

	test( 'should return false if the survey has not been submitted', () => {
		const hasAnswered = hasAnsweredNpsSurvey( {
			npsSurvey: {
				surveyState: NOT_SUBMITTED,
			},
		} );

		expect( hasAnswered ).toBe( false );
	} );
} );

describe( 'hasAnsweredNpsSurveyWithNoScore', () => {
	test( 'should return true if the survey is being submitted without a score', () => {
		const hasAnswered = hasAnsweredNpsSurveyWithNoScore( {
			npsSurvey: {
				surveyState: SUBMITTING,
			},
		} );

		expect( hasAnswered ).toBe( true );
	} );

	test( 'should return true if the survey has been submitted without a score', () => {
		const hasAnswered = hasAnsweredNpsSurveyWithNoScore( {
			npsSurvey: {
				surveyState: SUBMITTED,
			},
		} );

		expect( hasAnswered ).toBe( true );
	} );

	test( 'should return true if the survey has failed to submit without a score', () => {
		const hasAnswered = hasAnsweredNpsSurveyWithNoScore( {
			npsSurvey: {
				surveyState: SUBMIT_FAILURE,
			},
		} );

		expect( hasAnswered ).toBe( true );
	} );

	test( 'should return false if the survey is being submitted with a score', () => {
		const hasAnswered = hasAnsweredNpsSurveyWithNoScore( {
			npsSurvey: {
				surveyState: SUBMITTING,
				score: 9,
			},
		} );

		expect( hasAnswered ).toBe( false );
	} );

	test( 'should return false if the survey has been submitted with a score', () => {
		const hasAnswered = hasAnsweredNpsSurveyWithNoScore( {
			npsSurvey: {
				surveyState: SUBMITTED,
				score: 9,
			},
		} );

		expect( hasAnswered ).toBe( false );
	} );

	test( 'should return false if the survey has failed to submit with a score', () => {
		const hasAnswered = hasAnsweredNpsSurveyWithNoScore( {
			npsSurvey: {
				surveyState: SUBMIT_FAILURE,
				score: 9,
			},
		} );

		expect( hasAnswered ).toBe( false );
	} );

	test( 'should return false if the survey has not been submitted', () => {
		const hasAnswered = hasAnsweredNpsSurveyWithNoScore( {
			npsSurvey: {
				surveyState: NOT_SUBMITTED,
			},
		} );

		expect( hasAnswered ).toBe( false );
	} );
} );
