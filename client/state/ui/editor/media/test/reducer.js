/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import { editItem } from '../reducer';

describe( 'reducer', () => {
	describe( '#editItem()', () => {
		it( 'never loads persisted state', () => {
			const state = editItem( {}, { type: DESERIALIZE } );
			expect( state ).to.be.null;
		} );

		it( 'never persists state', () => {
			const state = editItem( {}, { type: SERIALIZE } );
			expect( state ).to.be.null;
		} );
	} );
} );
