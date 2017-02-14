/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	DIRECTLY_INITIALIZING,
	DIRECTLY_INITIALIZED,
	DIRECTLY_INITIALIZATION_ERROR,
} from 'state/action-types';
import reducer, {
	isInitializing,
	isReady,
	error,
	config,
} from '../reducer';

describe( 'reducer', () => {
	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'isInitializing',
			'isReady',
			'error',
			'config',
		] );
	} );

	describe( '#isInitializing()', () => {
		it( 'should default to false', () => {
			const state = isInitializing( undefined, {} );
			expect( state ).to.be.false;
		} );

		it( 'should be true once initialization has started', () => {
			const state = isInitializing( undefined, { type: DIRECTLY_INITIALIZING } );
			expect( state ).to.be.true;
		} );

		it( 'should be false after successful initialization', () => {
			let state = isInitializing( undefined, { type: DIRECTLY_INITIALIZING } );
			state = isInitializing( state, { type: DIRECTLY_INITIALIZED } );
			expect( state ).to.be.false;
		} );

		it( 'should be false after failed initialization', () => {
			let state = isInitializing( undefined, { type: DIRECTLY_INITIALIZING } );
			state = isInitializing( state, { type: DIRECTLY_INITIALIZATION_ERROR } );
			expect( state ).to.be.false;
		} );
	} );

	describe( '#isReady()', () => {
		it( 'should default to false', () => {
			const state = isReady( undefined, {} );
			expect( state ).to.be.false;
		} );

		it( 'should be false once initialization has started', () => {
			const state = isReady( undefined, { type: DIRECTLY_INITIALIZING } );
			expect( state ).to.be.false;
		} );

		it( 'should be true after successful initialization', () => {
			let state = isReady( undefined, { type: DIRECTLY_INITIALIZING } );
			state = isReady( state, { type: DIRECTLY_INITIALIZED } );
			expect( state ).to.be.true;
		} );

		it( 'should be false after failed initialization', () => {
			let state = isReady( undefined, { type: DIRECTLY_INITIALIZING } );
			state = isReady( state, { type: DIRECTLY_INITIALIZATION_ERROR } );
			expect( state ).to.be.false;
		} );
	} );

	describe( '#error()', () => {
		it( 'should default to null', () => {
			const state = error( undefined, {} );
			expect( state ).to.be.null;
		} );

		it( 'should be null once initialization has started', () => {
			const state = error( undefined, { type: DIRECTLY_INITIALIZING } );
			expect( state ).to.be.null;
		} );

		it( 'should be null after successful initialization', () => {
			let state = error( undefined, { type: DIRECTLY_INITIALIZING } );
			state = error( state, { type: DIRECTLY_INITIALIZED } );
			expect( state ).to.be.null;
		} );

		it( 'should be an error object after failed initialization', () => {
			const errorObject = { src: '/path/to/script.js' };

			let state = error( undefined, { type: DIRECTLY_INITIALIZING } );
			state = error( state, { type: DIRECTLY_INITIALIZATION_ERROR, error: errorObject } );
			expect( state ).to.equal( errorObject );
		} );
	} );

	describe( '#config()', () => {
		it( 'should default to null', () => {
			const state = config( undefined, {} );
			expect( state ).to.be.null;
		} );

		it( 'should contain configuration sent with initialization action', () => {
			const configObject = { a: 1, b: 2, c: 3 };
			const state = config( undefined, { type: DIRECTLY_INITIALIZING, config: configObject } );
			expect( state ).to.equal( configObject );
		} );
	} );
} );
