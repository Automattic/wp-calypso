/**
 * Internal dependencies
 */
import { isSitePreviewVisible } from '../selectors';

describe( 'state/signup/preview/selectors', () => {
	describe( 'isSitePreviewVisible()', () => {
		test( 'should default to false.', () => {
			expect( isSitePreviewVisible( {} ) ).toBe( false );
		} );

		test( 'should return preview visibility state', () => {
			const state = {
				signup: {
					preview: {
						isVisible: true,
					},
				},
			};
			expect( isSitePreviewVisible( state ) ).toEqual( state.signup.preview.isVisible );
		} );
	} );
} );
