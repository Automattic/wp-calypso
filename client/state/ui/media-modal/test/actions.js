import { MEDIA_MODAL_VIEW_SET } from 'calypso/state/action-types';
import { setMediaModalView, resetMediaModalView } from '../actions';
import { ModalViews } from '../constants';

describe( 'actions', () => {
	describe( 'setMediaModalView()', () => {
		test( 'should return an action object', () => {
			const action = setMediaModalView( ModalViews.DETAIL );

			expect( action ).toEqual( {
				type: MEDIA_MODAL_VIEW_SET,
				view: ModalViews.DETAIL,
			} );
		} );
	} );

	describe( 'resetMediaModalView()', () => {
		test( 'should return an action object', () => {
			const action = resetMediaModalView();

			expect( action ).toEqual( {
				type: MEDIA_MODAL_VIEW_SET,
				view: null,
			} );
		} );
	} );
} );
