/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer, { isNpsSurveyDialogShowing } from '../reducer';
import { NPS_SURVEY_DIALOG_IS_SHOWING } from 'calypso/state/action-types';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'isNpsSurveyDialogShowing' ] );
	} );

	describe( '#isNpsSurveyDialogShowing()', () => {
		test( 'should default to false', () => {
			const state = isNpsSurveyDialogShowing( undefined, {} );

			expect( state ).to.be.false;
		} );

		test( 'should track if the dialog is showing', () => {
			const state = isNpsSurveyDialogShowing( undefined, {
				type: NPS_SURVEY_DIALOG_IS_SHOWING,
				isShowing: true,
			} );

			expect( state ).to.be.true;
		} );

		test( 'should track if the dialog is not showing', () => {
			const state = isNpsSurveyDialogShowing( undefined, {
				type: NPS_SURVEY_DIALOG_IS_SHOWING,
				isShowing: false,
			} );

			expect( state ).to.be.false;
		} );
	} );
} );
