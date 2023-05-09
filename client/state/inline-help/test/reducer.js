import deepFreeze from 'deep-freeze';
import { INLINE_HELP_POPOVER_SHOW, INLINE_HELP_POPOVER_HIDE } from 'calypso/state/action-types';
import { popover } from '../reducer';

describe( 'reducer', () => {
	describe( '#popover()', () => {
		test( 'should return the initial state', () => {
			const state = popover( undefined, {} );
			expect( state ).toEqual( { isVisible: false } );
		} );

		test( 'should generate isVisible boolean prop', () => {
			const state = popover( undefined, { type: INLINE_HELP_POPOVER_SHOW } );
			expect( state ).toEqual( { isVisible: true } );
		} );

		test( 'should the existing visible status', () => {
			const original = deepFreeze( { isVisible: true } );
			const state = popover( original, { type: INLINE_HELP_POPOVER_HIDE } );
			expect( state ).toEqual( { isVisible: false } );
		} );
	} );
} );
