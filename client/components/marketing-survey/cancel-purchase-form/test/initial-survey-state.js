import initialSurveyState from '../initial-survey-state';

describe( 'initialSurveyState', () => {
	test( 'should contain empty values for questions', () => {
		expect( initialSurveyState() ).toEqual( {
			questionOneRadio: '',
			questionTwoRadio: '',
			importQuestionRadio: '',
		} );
	} );
} );
