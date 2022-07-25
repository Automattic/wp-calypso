import { isActiveThemeFSEEnabled } from 'calypso/lib/theme/utils';

describe( 'Theme Utils', () => {
	describe( 'isActiveThemeFSEEnabled', () => {
		test( 'Should return false if no value is passed in.', () => {
			const activeThemeData = null;
			expect( isActiveThemeFSEEnabled( activeThemeData ) ).toBe( false );
		} );

		test( 'Should return false if data object does not exist', () => {
			const activeThemeData = {};
			expect( isActiveThemeFSEEnabled( activeThemeData ) ).toBe( false );
		} );

		test( 'Should return false if theme_supports property does not exist.', () => {
			const activeThemeData = [
				{
					theme_supports: {},
				},
			];
			expect( isActiveThemeFSEEnabled( activeThemeData ) ).toBe( false );
		} );

		test( 'Should return false if falsey value is passed in', () => {
			expect( isActiveThemeFSEEnabled( false ) ).toBe( false );
		} );

		test( 'Should return false if block_templates property exists with value that is not true.', () => {
			const activeThemeData = [
				{
					theme_supports: {
						'block-templates': false,
					},
				},
			];

			expect( isActiveThemeFSEEnabled( activeThemeData ) ).toBe( false );
		} );

		test( 'Should return true if block_templates property exists with true value.', () => {
			const activeThemeData = [
				{
					theme_supports: {
						'block-templates': true,
					},
				},
			];

			expect( isActiveThemeFSEEnabled( activeThemeData ) ).toBe( true );
		} );
	} );
} );
