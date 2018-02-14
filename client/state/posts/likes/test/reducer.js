/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { items } from '../reducer';
import { POST_LIKES_RECEIVE, SERIALIZE, DESERIALIZE } from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	useSandbox( sandbox => {
		sandbox.stub( console, 'warn' );
	} );

	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual( [ 'items' ] );
	} );

	describe( 'items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should index post likes by site ID, post Id', () => {
			const likes = [ { ID: 1, login: 'chicken' } ];
			const state = items(
				{},
				{
					type: POST_LIKES_RECEIVE,
					siteId: 12345678,
					postId: 50,
					likes,
					found: 2,
					iLike: false,
				}
			);

			expect( state ).toEqual( {
				12345678: {
					50: {
						likes,
						found: 2,
						iLike: false,
					},
				},
			} );
		} );

		test( 'should accumulate sites', () => {
			const likes = [ { ID: 1, login: 'chicken' } ];
			const likes2 = [ { ID: 2, login: 'ribs' } ];
			const state = items(
				deepFreeze( {
					12345678: {
						50: {
							likes,
							found: 2,
							iLike: false,
						},
					},
				} ),
				{
					type: POST_LIKES_RECEIVE,
					siteId: 87654321,
					postId: 10,
					likes: likes2,
					found: 3,
					iLike: true,
				}
			);

			expect( state ).toEqual( {
				12345678: {
					50: {
						likes,
						found: 2,
						iLike: false,
					},
				},
				87654321: {
					10: {
						likes: likes2,
						found: 3,
						iLike: true,
					},
				},
			} );
		} );

		test( 'should accumulate posts', () => {
			const likes = [ { ID: 1, login: 'chicken' } ];
			const likes2 = [ { ID: 2, login: 'ribs' } ];
			const state = items(
				deepFreeze( {
					12345678: {
						50: {
							likes,
							found: 2,
							iLike: false,
						},
					},
				} ),
				{
					type: POST_LIKES_RECEIVE,
					siteId: 12345678,
					postId: 10,
					likes: likes2,
					found: 3,
					iLike: true,
				}
			);

			expect( state ).toEqual( {
				12345678: {
					50: {
						likes,
						found: 2,
						iLike: false,
					},
					10: {
						likes: likes2,
						found: 3,
						iLike: true,
					},
				},
			} );
		} );

		test( 'should override previous post likes of same site ID post ID', () => {
			const likes = [ { ID: 1, login: 'chicken' } ];
			const likes2 = [ { ID: 2, login: 'ribs' } ];
			const state = items(
				deepFreeze( {
					12345678: {
						50: {
							found: 2,
							iLike: false,
							likes,
						},
					},
				} ),
				{
					type: POST_LIKES_RECEIVE,
					siteId: 12345678,
					postId: 50,
					likes: likes2,
					found: 3,
					iLike: true,
				}
			);

			expect( state ).toEqual( {
				12345678: {
					50: {
						likes: likes2,
						found: 3,
						iLike: true,
					},
				},
			} );
		} );

		test( 'should include all expected like properties and no others', () => {
			const likes = [
				{
					ID: 1,
					avatar_URL: 'https://gravatar.com/whatever',
					login: 'chicken',
					name: 'A Former Egg',
					site_ID: 2,
					site_visible: true,
					some_other_property: 'aaaaa',
				},
			];
			const state = items(
				{},
				{
					type: POST_LIKES_RECEIVE,
					siteId: 12345678,
					postId: 50,
					likes,
					found: 2,
					iLike: false,
				}
			);

			expect( state ).toEqual( {
				12345678: {
					50: {
						likes: [
							{
								ID: 1,
								avatar_URL: 'https://gravatar.com/whatever',
								login: 'chicken',
								name: 'A Former Egg',
								site_ID: 2,
								site_visible: true,
							},
						],
						found: 2,
						iLike: false,
					},
				},
			} );
		} );

		test( 'should persist state', () => {
			const likes = [ { ID: 1, login: 'chicken' } ];
			const state = items(
				deepFreeze( {
					12345678: {
						50: {
							likes,
							found: 2,
							iLike: false,
						},
					},
				} ),
				{
					type: SERIALIZE,
				}
			);

			expect( state ).toEqual( {
				12345678: {
					50: {
						likes,
						found: 2,
						iLike: false,
					},
				},
			} );
		} );

		test( 'should load valid persisted state', () => {
			const likes = [ { ID: 1, login: 'chicken' } ];
			const state = items(
				deepFreeze( {
					12345678: {
						50: {
							likes,
							found: 2,
							iLike: false,
						},
					},
				} ),
				{
					type: DESERIALIZE,
				}
			);

			expect( state ).toEqual( {
				12345678: {
					50: {
						likes,
						found: 2,
						iLike: false,
					},
				},
			} );
		} );

		test( 'should not load invalid persisted state', () => {
			const state = items(
				deepFreeze( {
					status: 'ribs',
				} ),
				{
					type: DESERIALIZE,
				}
			);

			expect( state ).toEqual( {} );
		} );
	} );
} );
