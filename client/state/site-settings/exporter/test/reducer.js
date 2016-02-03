/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { DESERIALIZE, SERIALIZE } from 'state/action-types';
import { ui, initialUIState } from '../reducers';

describe( 'reducer', () => {
	describe( 'ui', () => {
		it( 'never persists state because this is not implemented', () => {
			const plugins = { my: { ui: { shape: {} } } };
			const state = ui( plugins, { type: SERIALIZE } );
			expect( state ).to.eql( {} );
		} );
		it( 'never loads persisted state because this is not implemented', () => {
			const plugins = { my: { ui: { shape: {} } } };
			const state = ui( plugins, { type: DESERIALIZE } );
			expect( state ).to.eql( initialUIState );
		} );
	} );
} );
