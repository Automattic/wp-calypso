import { expect } from 'chai';
import initialSurveyState from '../initial-survey-state';

describe( 'initialSurveyState', () => {
	test( 'should contain empty values for questions', () => {
		expect( initialSurveyState() ).to.deep.equal( {
			questionOneRadio: '',
			questionTwoRadio: '',
			importQuestionRadio: '',
		} );
	} );
} );
