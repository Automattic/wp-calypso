import { expect } from 'chai';
import initialSurveyState from '../initial-survey-state';

describe( 'initialSurveyState', () => {
	test( 'should contain null values for questions one and two', () => {
		expect( initialSurveyState() ).to.deep.equal( {
			questionOneRadio: null,
			questionTwoRadio: null,
		} );
	} );
} );
