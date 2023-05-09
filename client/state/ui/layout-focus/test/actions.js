import {
	LAYOUT_FOCUS_SET,
	LAYOUT_NEXT_FOCUS_SET,
	LAYOUT_NEXT_FOCUS_ACTIVATE,
} from 'calypso/state/action-types';
import { setLayoutFocus, setNextLayoutFocus, activateNextLayoutFocus } from '../actions';

describe( 'actions', () => {
	describe( 'setLayoutFocus', () => {
		test( 'returns an appropriate action', () => {
			expect( setLayoutFocus( 'foo' ) ).toEqual( { type: LAYOUT_FOCUS_SET, area: 'foo' } );
		} );
	} );

	describe( 'setNextLayoutFocus', () => {
		test( 'returns an appropriate action', () => {
			expect( setNextLayoutFocus( 'foo' ) ).toEqual( { type: LAYOUT_NEXT_FOCUS_SET, area: 'foo' } );
		} );
	} );

	describe( 'activateNextLayoutFocus', () => {
		test( 'returns an appropriate action', () => {
			expect( activateNextLayoutFocus() ).toEqual( { type: LAYOUT_NEXT_FOCUS_ACTIVATE } );
		} );
	} );
} );
