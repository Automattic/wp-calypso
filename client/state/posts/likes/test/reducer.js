/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { requesting, items } from '../reducer';
import {
	POST_LIKES_RECEIVE,
	POST_LIKES_REQUEST,
	POST_LIKES_REQUEST_FAILURE,
	POST_LIKES_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	useSandbox( sandbox => {
		sandbox.stub( console, 'warn' );
	} );

	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'requesting', 'items' ] );
	} );

	describe( 'requesting()', () => {
		test( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should set site ID, post ID to true value if a request is initiated', () => {
			const state = requesting( undefined, {
				type: POST_LIKES_REQUEST,
				siteId: 12345678,
				postId: 50,
			} );

			expect( state ).to.eql( {
				12345678: {
					50: true,
				},
			} );
		} );

		test( 'should accumulate the requested site IDs', () => {
			const state = requesting(
				deepFreeze( {
					12345678: {
						50: true,
					},
				} ),
				{
					type: POST_LIKES_REQUEST,
					siteId: 87654321,
					postId: 10,
				}
			);

			expect( state ).to.eql( {
				12345678: {
					50: true,
				},
				87654321: {
					10: true,
				},
			} );
		} );

		test( 'should accumulate the requested post IDs', () => {
			const state = requesting(
				deepFreeze( {
					12345678: {
						50: true,
					},
				} ),
				{
					type: POST_LIKES_REQUEST,
					siteId: 12345678,
					postId: 10,
				}
			);

			expect( state ).to.eql( {
				12345678: {
					50: true,
					10: true,
				},
			} );
		} );

		test( 'should set requesting to false if request finishes successfully', () => {
			const state = requesting(
				deepFreeze( {
					12345678: {
						50: true,
					},
				} ),
				{
					type: POST_LIKES_REQUEST_SUCCESS,
					siteId: 12345678,
					postId: 50,
				}
			);

			expect( state ).to.eql( {
				12345678: {
					50: false,
				},
			} );
		} );

		test( 'should set post ID to false if request finishes unsuccessfully', () => {
			const state = requesting(
				deepFreeze( {
					12345678: {
						50: true,
					},
				} ),
				{
					type: POST_LIKES_REQUEST_FAILURE,
					siteId: 12345678,
					postId: 50,
				}
			);

			expect( state ).to.eql( {
				12345678: {
					50: false,
				},
			} );
		} );

		test( 'should not persist state', () => {
			const state = requesting(
				deepFreeze( {
					12345678: {
						50: true,
					},
				} ),
				{
					type: SERIALIZE,
				}
			);

			expect( state ).to.eql( {} );
		} );

		test( 'should not load persisted state', () => {
			const state = requesting(
				deepFreeze( {
					12345678: {
						50: true,
					},
				} ),
				{
					type: DESERIALIZE,
				}
			);

			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
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

			expect( state ).to.eql( {
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

			expect( state ).to.eql( {
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

			expect( state ).to.eql( {
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

			expect( state ).to.eql( {
				12345678: {
					50: {
						likes: likes2,
						found: 3,
						iLike: true,
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

			expect( state ).to.eql( {
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

			expect( state ).to.eql( {
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

			expect( state ).to.eql( {} );
		} );
	} );
} );
