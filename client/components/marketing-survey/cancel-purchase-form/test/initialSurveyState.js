/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import initialSurveyState from '../initialSurveyState';

describe( 'initialSurveyState', () => {
	test( 'should contain null values for questions one and two', () => {
		expect( initialSurveyState() ).to.deep.equal( {
			questionOneRadio: null,
			questionTwoRadio: null,
		} );
	} );
} );
