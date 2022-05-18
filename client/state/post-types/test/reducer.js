import deepFreeze from 'deep-freeze';
import { POST_TYPES_RECEIVE } from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import { useSandbox } from 'calypso/test-helpers/use-sinon';
import reducer, { items } from '../reducer';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [ 'items', 'taxonomies' ] )
		);
	} );

	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).toEqual( {} );
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

			expect( state ).toEqual( {
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

			expect( state ).toEqual( {
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

			expect( state ).toEqual( {
				2916284: {
					post: { name: 'post', label: 'Posts' },
				},
			} );
		} );

		test( 'should persist state', () => {
			const state = serialize(
				items,
				deepFreeze( {
					2916284: {
						post: { name: 'post', label: 'Posts' },
					},
				} )
			);

			expect( state.root() ).toEqual( {
				2916284: {
					post: { name: 'post', label: 'Posts' },
				},
			} );
		} );

		test( 'should load valid persisted state', () => {
			const state = deserialize(
				items,
				deepFreeze( {
					2916284: {
						post: { name: 'post', label: 'Posts' },
					},
				} )
			);

			expect( state ).toEqual( {
				2916284: {
					post: { name: 'post', label: 'Posts' },
				},
			} );
		} );

		test( 'should not load invalid persisted state', () => {
			const state = deserialize(
				items,
				deepFreeze( {
					post: { name: 'post', label: 'Posts' },
				} )
			);

			expect( state ).toEqual( {} );
		} );
	} );
} );
