import isSurveyFilledIn from '../is-survey-filled-in';

describe( 'isSurveyFilledIn', () => {
	test( 'should return false when no questions are answered', () => {
		expect( isSurveyFilledIn( {} ) ).toEqual( false );
	} );

	test( 'should return true when question one and two are answered', () => {
		expect(
			isSurveyFilledIn( {
				questionOneRadio: 'tooHard',
				questionTwoRadio: 'tooHard',
			} )
		).toEqual( true );
	} );

	test( 'should return true when question one is answered and there are no options for question two', () => {
		expect(
			isSurveyFilledIn( {
				questionOneRadio: 'tooHard',
				questionTwoOrder: [],
			} )
		).toEqual( true );
	} );

	test( 'should return false when question one is another reason and there is no text', () => {
		expect(
			isSurveyFilledIn( {
				questionOneRadio: 'anotherReasonOne',
				questionOneText: '',
				questionTwoRadio: 'tooHard',
			} )
		).toEqual( false );
	} );

	test( 'should return false when question two is another reason and there is no text', () => {
		expect(
			isSurveyFilledIn( {
				questionOneRadio: 'tooHard',
				questionTwoRadio: 'anotherReasonTwo',
				questionTwoText: '',
			} )
		).toEqual( false );
	} );

	test( 'should return true when question one and two are another reason and both have text', () => {
		expect(
			isSurveyFilledIn( {
				questionOneRadio: 'anotherReasonOne',
				questionOneText: 'the reason',
				questionTwoRadio: 'anotherReasonTwo',
				questionTwoText: 'the reason',
			} )
		).toEqual( true );
	} );
} );
