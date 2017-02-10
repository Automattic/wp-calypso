/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import {
	HELLO_DOLLY_NEXT_LYRIC,
} from '../action-types';

describe( 'reducer', () => {
	it( 'should have initial state', () => {
		const state = reducer( undefined, { type: undefined } );

		expect( state.lyricIndex ).to.be.a( 'number' );
	} );

	it( 'should advance lyric index', () => {
		const initialState = { lyricIndex: 3 };
		const state = reducer( initialState, { type: HELLO_DOLLY_NEXT_LYRIC } );

		expect( state.lyricIndex ).to.equal( 4 );
	} );
} );

