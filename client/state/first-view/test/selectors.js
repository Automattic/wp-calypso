/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isViewDisabled,
	isViewVisible,
	getDisabledViews
} from '../selectors';

describe( 'selectors', () => {
	describe( '#isViewDisabled()', () => {
		it( 'should return true if the view is disabled', () => {
			const isDisabled = isViewDisabled( {
				firstView: {
					disabled: [ 'stats' ],
					visible: []
				}
			}, 'stats' );

			expect( isDisabled ).to.be.true;
		} );
	} );

	describe( '#isViewVisible()', () => {
		it( 'should return false if the view is disabled', () => {
			const isVisible = isViewVisible( {
				firstView: {
					disabled: [ 'stats' ],
					visible: []
				}
			}, 'stats' );

			expect( isVisible ).to.be.false;
		} );

		it( 'should return true if the view is enabled and the dialog is visible', () => {
			const isVisible = isViewVisible( {
				firstView: {
					disabled: [],
					visible: [ 'stats' ]
				}
			}, 'stats' );

			expect( isVisible ).to.be.true;
		} );

		it( 'should return false if the view is enabled but the dialog is not visible', () => {
			const isVisible = isViewVisible( {
				firstView: {
					disabled: [],
					visible: []
				}
			}, 'stats' );

			expect( isVisible ).to.be.false;
		} );
	} );

	describe( 'getDisabledViews()', () => {
		it( 'should return the disabled views', () => {
			const disabledViews = getDisabledViews( {
				firstView: {
					disabled: [ 'stats' ],
					visible: []
				}
			} );

			expect( disabledViews ).to.have.members( [ 'stats' ] );
		} );
	} );
} );
