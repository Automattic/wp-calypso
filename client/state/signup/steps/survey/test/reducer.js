/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import signupSurveyReducer from '../reducer';
import { SIGNUP_STEPS_SURVEY_SET, SIGNUP_COMPLETE_RESET } from 'calypso/state/action-types';

describe( 'reducer', () => {
	test( 'should update the survey', () => {
		expect(
			signupSurveyReducer(
				{},
				{
					type: SIGNUP_STEPS_SURVEY_SET,
					survey: {
						vertical: 'test-survey',
						otherText: 'test-other-text',
						siteType: 'test-site-type',
					},
				}
			)
		).to.be.eql( {
			vertical: 'test-survey',
			otherText: 'test-other-text',
			siteType: 'test-site-type',
		} );
	} );

	test( 'should reset the survey on signup complete', () => {
		expect(
			signupSurveyReducer(
				{
					vertical: 'test-survey',
					otherText: 'test-other-text',
					siteType: 'test-site-type',
				},
				{
					type: SIGNUP_COMPLETE_RESET,
					action: {},
				}
			)
		).to.be.eql( {} );
	} );
} );
