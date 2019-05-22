/** @format */

/**
 * External dependencies
 */
import initialSurveyState from '../initial-survey-state';

describe( 'initialSurveyState', () => {
	test( 'should contain null values for questions one and two', () => {
		expect( initialSurveyState() ).toEqual( {
			questionOneRadio: null,
			questionTwoRadio: null,
		} );
	} );
} );
