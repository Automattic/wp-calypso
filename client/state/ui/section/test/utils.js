/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { SECTION_SET } from 'state/action-types';
import { createSectionReducer } from '../utils';

describe( 'utils', () => {
	describe( 'createSectionReducer()', () => {
		let reducer;
		beforeEach( () => {
			reducer = createSectionReducer( null, 'foo' );
		} );

		it( 'should return a function', () => {
			expect( reducer ).to.be.a( 'function' );
		} );

		it( 'should default to the provided initial state', () => {
			const state = reducer( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should return the new value if action section includes key', () => {
			const state = reducer( null, {
				type: SECTION_SET,
				section: {
					foo: 'bar'
				}
			} );

			expect( state ).to.equal( 'bar' );
		} );

		it( 'should return the same state if action section doesn\'t include key', () => {
			const originalState = reducer( null, {
				type: SECTION_SET,
				section: {
					foo: 'bar'
				}
			} );

			const state = reducer( originalState, {
				type: SECTION_SET,
				section: {
					baz: 'qux'
				}
			} );

			expect( state ).to.equal( originalState );
		} );
	} );
} );
