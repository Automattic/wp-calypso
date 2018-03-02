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
import { addLiker, removeLiker, like, unlike } from '../actions';
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

		describe( 'a POST_LIKE action', () => {
			test( 'should create a new state item if none is found', () => {
				const state = items( deepFreeze( {} ), like( 1, 1 ) );
				expect( state ).toEqual( {
					1: {
						1: {
							likes: undefined,
							iLike: true,
							found: 1,
						},
					},
				} );
			} );

			test( 'should update the current state if it is present', () => {
				const state = items(
					deepFreeze( {
						1: {
							1: {
								likes: [],
								iLike: false,
								found: 1,
							},
						},
					} ),
					like( 1, 1 )
				);
				expect( state ).toEqual( {
					1: {
						1: {
							likes: [],
							iLike: true,
							found: 2,
						},
					},
				} );
			} );

			test( 'should not change the state if the user already likes the post', () => {
				const initialState = deepFreeze( {
					1: {
						1: {
							likes: [],
							iLike: true,
							found: 1,
						},
					},
				} );
				const state = items( initialState, like( 1, 1 ) );
				expect( state ).toBe( initialState );
			} );
		} );

		describe( 'a POST_UNLIKE action', () => {
			test( 'should not create a new state item if none is found', () => {
				const initialState = deepFreeze( {} );
				const state = items( initialState, unlike( 1, 1 ) );
				expect( state ).toBe( initialState );
			} );

			test( 'should update the current state if it is present', () => {
				const state = items(
					deepFreeze( {
						1: {
							1: {
								likes: [],
								iLike: true,
								found: 1,
							},
						},
					} ),
					unlike( 1, 1 )
				);
				expect( state ).toEqual( {
					1: {
						1: {
							likes: [],
							iLike: false,
							found: 0,
						},
					},
				} );
			} );

			test( 'should not change the state if the user does not like the post', () => {
				const initialState = deepFreeze( {
					1: {
						1: {
							likes: [],
							iLike: false,
							found: 1,
						},
					},
				} );
				const state = items( initialState, unlike( 1, 1 ) );
				expect( state ).toBe( initialState );
			} );
		} );

		describe( 'a POST_LIKES_ADD_LIKER action', () => {
			const liker = deepFreeze( {
				ID: 10,
			} );
			test( 'should create a new entry when no entry is present', () => {
				expect( items( deepFreeze( {} ), addLiker( 1, 1, 5, liker ) ) ).toEqual( {
					1: {
						1: {
							likes: [ liker ],
							found: 5,
							iLike: false,
						},
					},
				} );
			} );

			test( 'should make a new array if one is not present', () => {
				expect(
					items(
						deepFreeze( {
							1: {
								1: {
									likes: undefined,
									found: 5,
									iLike: false,
								},
							},
						} ),
						addLiker( 1, 1, 6, liker )
					)
				).toEqual( {
					1: {
						1: {
							likes: [ liker ],
							found: 6,
							iLike: false,
						},
					},
				} );
			} );

			test( 'should prepend to the existing array if present', () => {
				expect(
					items(
						deepFreeze( {
							1: {
								1: {
									likes: [ { ID: 5 } ],
									found: 5,
									iLike: false,
								},
							},
						} ),
						addLiker( 1, 1, 6, liker )
					)
				).toEqual( {
					1: {
						1: {
							likes: [ liker, { ID: 5 } ],
							found: 6,
							iLike: false,
						},
					},
				} );
			} );

			test( 'should leave the likes array alone if the liker is already present', () => {
				const initialState = deepFreeze( {
					1: {
						1: {
							likes: [ { ID: 2 }, liker ],
							found: 5,
							iLike: false,
						},
					},
				} );
				const state = items(
					initialState,
					// same liker, new count!
					addLiker( 1, 1, 6, liker )
				);

				expect( state ).toEqual( {
					1: {
						1: {
							likes: [ { ID: 2 }, liker ],
							found: 6,
							iLike: false,
						},
					},
				} );
				expect( state[ '1' ][ '1' ].likes ).toBe( initialState[ '1' ][ '1' ].likes );
			} );
		} );

		describe( 'a POST_LIKES_REMOVE_LIKER action', () => {
			const liker = deepFreeze( {
				ID: 10,
			} );
			test( 'should creat a new entry if none is present', () => {
				const initialState = deepFreeze( {} );
				expect( items( initialState, removeLiker( 1, 1, 5, liker ) ) ).toEqual( {
					1: {
						1: {
							likes: undefined,
							found: 5,
							iLike: false,
						},
					},
				} );
			} );

			test( 'should not update the likes array if none is present, but should update the count', () => {
				expect(
					items(
						deepFreeze( {
							1: {
								1: {
									likes: undefined,
									found: 5,
									iLike: false,
								},
							},
						} ),
						removeLiker( 1, 1, 6, liker )
					)
				).toEqual( {
					1: {
						1: {
							likes: undefined,
							found: 6,
							iLike: false,
						},
					},
				} );
			} );

			test( 'should remove from the existing array if present', () => {
				expect(
					items(
						deepFreeze( {
							1: {
								1: {
									likes: [ liker ],
									found: 5,
									iLike: false,
								},
							},
						} ),
						removeLiker( 1, 1, 5, liker )
					)
				).toEqual( {
					1: {
						1: {
							likes: [],
							found: 5,
							iLike: false,
						},
					},
				} );
			} );

			test( 'should leave the likes array alone if the liker is already missing', () => {
				const initialState = deepFreeze( {
					1: {
						1: {
							likes: [ { ID: 2 } ],
							found: 5,
							iLike: false,
						},
					},
				} );

				const state = items(
					initialState,
					// same liker, new count!
					removeLiker( 1, 1, 3, liker )
				);

				expect( state ).toEqual( {
					1: {
						1: {
							likes: [ { ID: 2 } ],
							found: 3,
							iLike: false,
						},
					},
				} );
				expect( state[ '1' ][ '1' ].likes ).toBe( initialState[ '1' ][ '1' ].likes );
			} );
		} );
	} );
} );
