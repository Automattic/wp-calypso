import { ModalViews } from '../constants';
import { getMediaModalView } from '../selectors';

describe( 'selectors', () => {
	describe( 'getMediaModalView()', () => {
		test( 'should return the current media modal view', () => {
			const view = getMediaModalView( {
				ui: {
					mediaModal: {
						view: ModalViews.DETAIL,
					},
				},
			} );

			expect( view ).toEqual( ModalViews.DETAIL );
		} );
	} );
} );
