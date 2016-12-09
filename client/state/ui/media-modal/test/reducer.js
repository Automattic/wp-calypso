/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { MEDIA_MODAL_VIEW_SET } from 'state/action-types';
import { ModalViews } from '../constants';
import reducer, { view } from '../reducer';

describe( 'reducer', () => {
	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'view'
		] );
	} );

	describe( 'view()', () => {
		it( 'should default to null', () => {
			const state = view( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should track current view', () => {
			const state = view( undefined, {
				type: MEDIA_MODAL_VIEW_SET,
				view: ModalViews.DETAIL
			} );

			expect( state ).to.equal( ModalViews.DETAIL );
		} );
	} );
} );
