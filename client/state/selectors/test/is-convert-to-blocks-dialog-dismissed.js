/**
 * Internal dependencies
 */
import isConvertToBlocksDialogDismissed from 'state/selectors/is-convert-to-blocks-dialog-dismissed';

const state = {
	ui: {
		convertToBlocksDialog: {
			12345678: {
				1: 'dismissed',
			},
		},
	},
};

describe( 'isConvertToBlocksDialogDismissed()', () => {
	test( 'should return true if the dialog has been dismissed for a given post', () => {
		const isDismissed = isConvertToBlocksDialogDismissed( state, 12345678, 1 );
		expect( isDismissed ).toBe( true );
	} );

	test( 'should return false if the dialog has not been dismissed for a given post', () => {
		const isDismissed = isConvertToBlocksDialogDismissed( state, 12345678, 2 );
		expect( isDismissed ).toBe( false );
	} );

	test( 'should return false if the site is not in state', () => {
		const isDismissed = isConvertToBlocksDialogDismissed( state, 87654321, 1 );
		expect( isDismissed ).toBe( false );
	} );
} );
