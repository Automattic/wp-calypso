import { NPS_SURVEY_DIALOG_IS_SHOWING } from 'calypso/state/action-types';
import reducer, { isNpsSurveyDialogShowing } from '../reducer';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [ 'isNpsSurveyDialogShowing' ] )
		);
	} );

	describe( '#isNpsSurveyDialogShowing()', () => {
		test( 'should default to false', () => {
			const state = isNpsSurveyDialogShowing( undefined, {} );

			expect( state ).toBe( false );
		} );

		test( 'should track if the dialog is showing', () => {
			const state = isNpsSurveyDialogShowing( undefined, {
				type: NPS_SURVEY_DIALOG_IS_SHOWING,
				isShowing: true,
			} );

			expect( state ).toBe( true );
		} );

		test( 'should track if the dialog is not showing', () => {
			const state = isNpsSurveyDialogShowing( undefined, {
				type: NPS_SURVEY_DIALOG_IS_SHOWING,
				isShowing: false,
			} );

			expect( state ).toBe( false );
		} );
	} );
} );
