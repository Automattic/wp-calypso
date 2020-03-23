/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isNpsSurveyDialogShowing } from '../selectors';

describe( 'isNpsSurveyDialogShowing', () => {
	test( 'should return true if the NPS survey dialog is showing', () => {
		const isShowing = isNpsSurveyDialogShowing( {
			ui: {
				npsSurveyNotice: {
					isNpsSurveyDialogShowing: true,
				},
			},
		} );

		expect( isShowing ).to.be.true;
	} );

	test( 'should return false if the NPS survey dialog is not showing', () => {
		const isShowing = isNpsSurveyDialogShowing( {
			ui: {
				npsSurveyNotice: {
					isNpsSurveyDialogShowing: false,
				},
			},
		} );

		expect( isShowing ).to.be.false;
	} );
} );
