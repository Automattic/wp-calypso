/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { items } from '../reducer';
import { POST_TYPES_RECEIVE, SERIALIZE, DESERIALIZE } from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'items', 'taxonomies' ] );
	} );

	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should index post types by site ID, post type name pairing', () => {
			const state = items( undefined, {
				type: POST_TYPES_RECEIVE,
				siteId: 2916284,
				types: [
					{ name: 'post', label: 'Posts' },
					{ name: 'page', label: 'Pages' },
				],
			} );

			expect( state ).to.eql( {
				2916284: {
					post: { name: 'post', label: 'Posts' },
					page: { name: 'page', label: 'Pages' },
				},
			} );
		} );

		test( 'should accumulate sites', () => {
			const state = items(
				deepFreeze( {
					2916284: {
						post: { name: 'post', label: 'Posts' },
						page: { name: 'page', label: 'Pages' },
					},
				} ),
				{
					type: POST_TYPES_RECEIVE,
					siteId: 77203074,
					types: [ { name: 'post', label: 'Posts' } ],
				}
			);

			expect( state ).to.eql( {
				2916284: {
					post: { name: 'post', label: 'Posts' },
					page: { name: 'page', label: 'Pages' },
				},
				77203074: {
					post: { name: 'post', label: 'Posts' },
				},
			} );
		} );

		test( 'should override previous post types of same site ID', () => {
			const state = items(
				deepFreeze( {
					2916284: {
						post: { name: 'post', label: 'Posts' },
						page: { name: 'page', label: 'Pages' },
					},
				} ),
				{
					type: POST_TYPES_RECEIVE,
					siteId: 2916284,
					types: [ { name: 'post', label: 'Posts' } ],
				}
			);

			expect( state ).to.eql( {
				2916284: {
					post: { name: 'post', label: 'Posts' },
				},
			} );
		} );

		test( 'should persist state', () => {
			const state = items(
				deepFreeze( {
					2916284: {
						post: { name: 'post', label: 'Posts' },
					},
				} ),
				{ type: SERIALIZE }
			);

			expect( state.root() ).to.eql( {
				2916284: {
					post: { name: 'post', label: 'Posts' },
				},
			} );
		} );

		test( 'should load valid persisted state', () => {
			const state = items(
				deepFreeze( {
					2916284: {
						post: { name: 'post', label: 'Posts' },
					},
				} ),
				{ type: DESERIALIZE }
			);

			expect( state ).to.eql( {
				2916284: {
					post: { name: 'post', label: 'Posts' },
				},
			} );
		} );

		test( 'should not load invalid persisted state', () => {
			const state = items(
				deepFreeze( {
					post: { name: 'post', label: 'Posts' },
				} ),
				{ type: DESERIALIZE }
			);

			expect( state ).to.eql( {} );
		} );
	} );
} );
