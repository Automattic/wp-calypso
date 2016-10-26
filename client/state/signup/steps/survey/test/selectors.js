/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSurveyVertical, getSurveyOtherText } from '../selectors';

describe( 'selectors', () => {
	it( 'should return empty string as a default state', () => {
		expect( getSurveyVertical( { signup: undefined } ) ).to.be.eql( '' );
		expect( getSurveyOtherText( { signup: undefined } ) ).to.be.eql( '' );
	} );

	it( 'should return chosen vertical from the state', () => {
		expect( getSurveyVertical( {
			signup: {
				steps: {
					survey: {
						vertical: 'test-survey',
						otherText: 'test-other-text',
					}
				}
			}
		} ) ).to.be.eql( 'test-survey' );
	} );

	it( 'should return typed other text from the state', () => {
		expect( getSurveyOtherText( {
			signup: {
				steps: {
					survey: {
						vertical: 'test-survey',
						otherText: 'test-other-text',
					}
				}
			}
		} ) ).to.be.eql( 'test-other-text' );
	} );
} );
