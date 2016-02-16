/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	READER_FULLPOST_HIDE,
	READER_FULLPOST_SHOW
} from 'state/action-types';
import {
	isVisible
} from '../reducer';

describe( 'reducer', () => {
	describe( '#isVisible()', () => {
		it( 'should set visibility correctly', () => {
			const state = isVisible( undefined, {
				type: READER_FULLPOST_SHOW
			} );

			const nextState = isVisible( state, {
				type: READER_FULLPOST_HIDE
			} );

			expect( state ).to.eql( true );
			expect( nextState ).to.eql( false );
		} );
	} );
} );
