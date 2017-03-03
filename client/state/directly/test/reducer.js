/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	DIRECTLY_INITIALIZED,
} from 'state/action-types';
import reducer, {
	isInitialized,
	config,
} from '../reducer';

describe( 'reducer', () => {
	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'isInitialized',
			'config',
		] );
	} );

	describe( '#isInitialized()', () => {
		it( 'should default to false', () => {
			const state = isInitialized( undefined, {} );
			expect( state ).to.be.false;
		} );

		it( 'should be true once initialization has been invoked', () => {
			const state = isInitialized( undefined, { type: DIRECTLY_INITIALIZED } );
			expect( state ).to.be.true;
		} );
	} );

	describe( '#config()', () => {
		it( 'should default to null', () => {
			const state = config( undefined, {} );
			expect( state ).to.be.null;
		} );

		it( 'should contain configuration sent with initialization action', () => {
			const configObject = { a: 1, b: 2, c: 3 };
			const state = config( undefined, { type: DIRECTLY_INITIALIZED, config: configObject } );
			expect( state ).to.equal( configObject );
		} );
	} );
} );
