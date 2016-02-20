/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	SERIALIZE,
	DESERIALIZE,
	READER_FULLPOST_HIDE,
	READER_FULLPOST_SHOW
} from 'state/action-types';
import {
	isVisible
} from '../reducer';

describe( 'reducer', () => {
	describe( '#isVisible()', () => {
		it( 'should not persist data because this is not implemented', () => {
			const state = isVisible( true, {
				type: SERIALIZE
			} );

			expect( state ).to.eql( false );
		} );

		it( 'should not load persisted state because this is not implemented', () => {
			const state = isVisible( true, {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( false );
		} );

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
