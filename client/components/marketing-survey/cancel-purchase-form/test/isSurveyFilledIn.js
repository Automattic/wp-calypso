/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isSurveyFilledIn from '../isSurveyFilledIn';

describe( 'isSurveyFilledIn', function() {
	it( 'should return false when no questions are answered', function() {
		expect( isSurveyFilledIn( { } ) ).to.equal( false );
	} );

	it( 'should return true when question one and two are answered', function() {
		expect( isSurveyFilledIn(
			{
				questionOneRadio: 'tooHard',
				questionTwoRadio: 'tooHard',
			}
		) ).to.equal( true );
	} );

	it( 'should return false when question one is another reason and there is no text', function() {
		expect( isSurveyFilledIn(
			{
				questionOneRadio: 'anotherReasonOne',
				questionOneText: '',
				questionTwoRadio: 'tooHard',
			}
		) ).to.equal( false );
	} );

	it( 'should return false when question two is another reason and there is no text', function() {
		expect( isSurveyFilledIn(
			{
				questionOneRadio: 'tooHard',
				questionTwoRadio: 'anotherReasonTwo',
				questionTwoText: '',
			}
		) ).to.equal( false );
	} );

	it( 'should return true when question one and two are another reason and both have text', function() {
		expect( isSurveyFilledIn(
			{
				questionOneRadio: 'anotherReasonOne',
				questionOneText: 'the reason',
				questionTwoRadio: 'anotherReasonTwo',
				questionTwoText: 'the reason',
			}
		) ).to.equal( true );
	} );
} );
