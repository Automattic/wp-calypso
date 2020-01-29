/**
 * Internal dependencies
 */
import isGutenbergOptInDialogShowing from 'state/selectors/is-gutenberg-opt-in-dialog-showing';

describe( 'isGutenbergOptInDialogShowing()', () => {
	test( 'should return false if the value is not known', () => {
		const result = isGutenbergOptInDialogShowing( { ui: {} } );

		expect( result ).toBe( false );
	} );

	test( 'should return false if the isGutenbergOptInDialogShowing reducer is false', () => {
		const result = isGutenbergOptInDialogShowing( {
			ui: {
				gutenbergOptInDialog: {
					isShowing: false,
				},
			},
		} );

		expect( result ).toBe( false );
	} );

	test( 'should return true if the isGutenbergOptInDialogShowing reducer is true', () => {
		const result = isGutenbergOptInDialogShowing( {
			ui: {
				gutenbergOptInDialog: {
					isShowing: true,
				},
			},
		} );

		expect( result ).toBe( true );
	} );
} );
