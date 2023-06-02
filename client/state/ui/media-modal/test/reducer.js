import { MEDIA_MODAL_VIEW_SET } from 'calypso/state/action-types';
import { ModalViews } from '../constants';
import reducer, { view } from '../reducer';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [ 'view' ] )
		);
	} );

	describe( 'view()', () => {
		test( 'should default to null', () => {
			const state = view( undefined, {} );

			expect( state ).toBeNull();
		} );

		test( 'should track current view', () => {
			const state = view( undefined, {
				type: MEDIA_MODAL_VIEW_SET,
				view: ModalViews.DETAIL,
			} );

			expect( state ).toEqual( ModalViews.DETAIL );
		} );
	} );
} );
