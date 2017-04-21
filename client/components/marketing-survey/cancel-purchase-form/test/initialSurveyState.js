/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import initialSurveyState from '../initialSurveyState';

describe( 'initialSurveyState', function() {
	it( 'should contain null values for questions one and two', function() {
		expect( initialSurveyState() ).to.deep.equal(
			{
				questionOneRadio: null,
				questionTwoRadio: null
			}
		);
	} );
} );
