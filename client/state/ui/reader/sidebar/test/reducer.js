/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { SERIALIZE, DESERIALIZE } from 'state/action-types';
import {
	isListsOpen,
	isTagsOpen
} from '../reducer';

describe( 'reducer', () => {
	describe( '#isListsOpen()', () => {
		it( 'should not persist data because this is not implemented', () => {
			const state = isListsOpen( true, {
				type: SERIALIZE
			} );

			expect( state ).to.eql( false );
		} );

		it( 'should not load persisted state because this is not implemented', () => {
			const state = isListsOpen( true, {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( false );
		} );
	} );

	describe( '#isTagsOpen()', () => {
		it( 'should not persist data because this is not implemented', () => {
			const state = isTagsOpen( true, {
				type: SERIALIZE
			} );

			expect( state ).to.eql( false );
		} );

		it( 'should not load persisted state because this is not implemented', () => {
			const state = isTagsOpen( true, {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( false );
		} );
	} );
} );
