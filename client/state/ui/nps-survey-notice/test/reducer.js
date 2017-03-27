/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { NPS_SURVEY_DIALOG_IS_SHOWING } from 'state/action-types';
import reducer, { isNpsSurveyDialogShowing } from '../reducer';

describe( 'reducer', () => {
	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'isNpsSurveyDialogShowing'
		] );
	} );

	describe( '#isNpsSurveyDialogShowing()', () => {
		it( 'should default to false', () => {
			const state = isNpsSurveyDialogShowing( undefined, {} );

			expect( state ).to.be.false;
		} );

		it( 'should track if the dialog is showing', () => {
			const state = isNpsSurveyDialogShowing( undefined, {
				type: NPS_SURVEY_DIALOG_IS_SHOWING,
				isShowing: true
			} );

			expect( state ).to.be.true;
		} );

		it( 'should track if the dialog is not showing', () => {
			const state = isNpsSurveyDialogShowing( undefined, {
				type: NPS_SURVEY_DIALOG_IS_SHOWING,
				isShowing: false
			} );

			expect( state ).to.be.false;
		} );
	} );
} );
