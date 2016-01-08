/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { POST_RECEIVE } from 'state/action-types';
import { items } from '../reducer';

describe( 'reducer', () => {
	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should index posts by global ID', () => {
			const state = items( null, {
				type: POST_RECEIVE,
				post: { ID: 841, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			} );

			expect( state ).to.eql( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			} );
		} );

		it( 'should accumulate posts', () => {
			const original = Object.freeze( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			} );
			const state = items( original, {
				type: POST_RECEIVE,
				post: { ID: 413, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs & Chicken' }
			} );

			expect( state ).to.eql( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
				'6c831c187ffef321eb43a67761a525a3': { ID: 413, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs & Chicken' }
			} );
		} );

		it( 'should override previous post of same ID', () => {
			const original = Object.freeze( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			} );
			const state = items( original, {
				type: POST_RECEIVE,
				post: { ID: 841, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Ribs & Chicken' }
			} );

			expect( state ).to.eql( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Ribs & Chicken' }
			} );
		} );
	} );
} );
