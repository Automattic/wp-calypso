/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSurveyVertical, getSurveyOtherText, getSurveySiteType } from '../selectors';

describe( 'selectors', () => {
	test( 'should return empty string as a default state', () => {
		expect( getSurveyVertical( { signup: undefined } ) ).to.be.eql( '' );
		expect( getSurveyOtherText( { signup: undefined } ) ).to.be.eql( '' );
		expect( getSurveySiteType( { signup: undefined } ) ).to.be.eql( 'site' );
	} );

	test( 'should return chosen vertical from the state', () => {
		expect(
			getSurveyVertical( {
				signup: {
					steps: {
						survey: {
							vertical: 'test-survey',
							otherText: 'test-other-text',
							siteType: 'test-site-type',
						},
					},
				},
			} )
		).to.be.eql( 'test-survey' );
	} );

	test( 'should return typed other text from the state', () => {
		expect(
			getSurveyOtherText( {
				signup: {
					steps: {
						survey: {
							vertical: 'test-survey',
							otherText: 'test-other-text',
							siteType: 'test-site-type',
						},
					},
				},
			} )
		).to.be.eql( 'test-other-text' );
	} );

	test( 'should return site type from the state', () => {
		expect(
			getSurveySiteType( {
				signup: {
					steps: {
						survey: {
							vertical: 'test-survey',
							otherText: 'test-other-text',
							siteType: 'test-site-type',
						},
					},
				},
			} )
		).to.be.eql( 'test-site-type' );
	} );
} );
