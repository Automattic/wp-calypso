import { getSurveyVertical, getSurveyOtherText, getSurveySiteType } from '../selectors';

describe( 'selectors', () => {
	test( 'should return empty string as a default state', () => {
		expect( getSurveyVertical( { signup: undefined } ) ).toEqual( '' );
		expect( getSurveyOtherText( { signup: undefined } ) ).toEqual( '' );
		expect( getSurveySiteType( { signup: undefined } ) ).toEqual( 'site' );
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
		).toEqual( 'test-survey' );
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
		).toEqual( 'test-other-text' );
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
		).toEqual( 'test-site-type' );
	} );
} );
