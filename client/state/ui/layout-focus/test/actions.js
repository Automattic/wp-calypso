/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { setLayoutFocus, setNextLayoutFocus, activateNextLayoutFocus } from '../actions';
import {
	LAYOUT_FOCUS_SET,
	LAYOUT_NEXT_FOCUS_SET,
	LAYOUT_NEXT_FOCUS_ACTIVATE,
} from 'calypso/state/action-types';

describe( 'actions', () => {
	describe( 'setLayoutFocus', () => {
		test( 'returns an appropriate action', () => {
			expect( setLayoutFocus( 'foo' ) ).to.eql( { type: LAYOUT_FOCUS_SET, area: 'foo' } );
		} );
	} );

	describe( 'setNextLayoutFocus', () => {
		test( 'returns an appropriate action', () => {
			expect( setNextLayoutFocus( 'foo' ) ).to.eql( { type: LAYOUT_NEXT_FOCUS_SET, area: 'foo' } );
		} );
	} );

	describe( 'activateNextLayoutFocus', () => {
		test( 'returns an appropriate action', () => {
			expect( activateNextLayoutFocus() ).to.eql( { type: LAYOUT_NEXT_FOCUS_ACTIVATE } );
		} );
	} );
} );
