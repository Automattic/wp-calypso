/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { setMediaModalView, resetMediaModalView } from '../actions';
import { ModalViews } from '../constants';
import { MEDIA_MODAL_VIEW_SET } from 'state/action-types';

describe( 'actions', () => {
	describe( 'setMediaModalView()', () => {
		it( 'should return an action object', () => {
			const action = setMediaModalView( ModalViews.DETAIL );

			expect( action ).to.eql( {
				type: MEDIA_MODAL_VIEW_SET,
				view: ModalViews.DETAIL
			} );
		} );
	} );

	describe( 'resetMediaModalView()', () => {
		it( 'should return an action object', () => {
			const action = resetMediaModalView();

			expect( action ).to.eql( {
				type: MEDIA_MODAL_VIEW_SET,
				view: null
			} );
		} );
	} );
} );
