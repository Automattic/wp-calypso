/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { popover, ui } from '../reducer';
import {
	INLINE_HELP_POPOVER_SHOW,
	INLINE_HELP_POPOVER_HIDE,
	INLINE_HELP_SHOW,
	INLINE_HELP_HIDE,
} from 'state/action-types';

describe( 'reducer', () => {
	describe( '#popover()', () => {
		test( 'should generate isVisible boolean prop', () => {
			const state = popover( null, {
				type: INLINE_HELP_POPOVER_SHOW,
			} );

			expect( state ).to.eql( {
				isVisible: true,
			} );
		} );
		test( 'should the existing visible status', () => {
			const original = deepFreeze( { isVisible: true } );
			const state = popover( original, {
				type: INLINE_HELP_POPOVER_HIDE,
			} );

			expect( state ).to.eql( {
				isVisible: false,
			} );
		} );
	} );

	describe( '#ui()', () => {
		test( 'should correct set isVisible prop to true', () => {
			const state = ui( null, {
				type: INLINE_HELP_SHOW,
			} );

			expect( state ).to.eql( {
				isVisible: true,
			} );
		} );

		test( 'should correct set isVisible prop to false', () => {
			const original = deepFreeze( { isVisible: true } );
			const state = ui( original, {
				type: INLINE_HELP_HIDE,
			} );

			expect( state ).to.eql( {
				isVisible: false,
			} );
		} );
	} );
} );
