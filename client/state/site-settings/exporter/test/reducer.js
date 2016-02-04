/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { DESERIALIZE, SERIALIZE } from 'state/action-types';
import {
	selectedPostType,
	exportingState
} from '../reducers';
import { States } from '../constants';

describe( 'reducer', () => {
	describe( 'selectedPostType', () => {
		it( 'persists state', () => {
			const postType = 'feedback';
			const state = selectedPostType( postType, { type: SERIALIZE } );
			expect( state ).to.eql( 'feedback' );
		} );
		it( 'loads persisted state', () => {
			const postType = 'feedback';
			const state = selectedPostType( postType, { type: DESERIALIZE } );
			expect( state ).to.eql( 'feedback' );
		} );
	} );

	describe( 'exportingState', () => {
		it( 'persists state', () => {
			const state = exportingState( States.EXPORTING, { type: SERIALIZE } );
			expect( state ).to.eql( States.EXPORTING );
		} );
		it( 'ignores persisted state since server side checking is not implemented yet', () => {
			const state = exportingState( States.EXPORTING, { type: DESERIALIZE } );
			expect( state ).to.eql( States.READY );
		} );
	} );
} );
