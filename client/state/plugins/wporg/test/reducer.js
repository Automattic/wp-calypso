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
import reducer from '../reducer';

describe( 'reducer', () => {
	describe( 'plugins', () => {
		it( 'never persists state because this is not implemented', () => {
			const plugins = { my: { plugin: { shape: {} } } };
			const state = reducer( plugins, { type: SERIALIZE } );
			expect( state ).to.eql( {} );
		} );
		it( 'never loads persisted state because this is not implemented', () => {
			const plugins = { my: { plugin: { shape: {} } } };
			const state = reducer( plugins, { type: DESERIALIZE } );
			expect( state ).to.eql( {} );
		} );
	} );
} );
