import deepFreeze from 'deep-freeze';
import { POST_LIKES_RECEIVE } from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import { addLiker, removeLiker, like, unlike, receivePostLikers } from '../actions';
import reducer, { items, itemReducer } from '../reducer';

describe( 'reducer', () => {
	jest.spyOn( console, 'warn' ).mockImplementation();

	const FAKE_NOW = 1000;

	beforeEach( () => {
		jest.useFakeTimers().setSystemTime( FAKE_NOW );
	} );

	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual( [ 'items' ] );
	} );

	describe( 'items()', () => {
		const DEFAULT_ITEM_STATE = deepFreeze( {
			likes: undefined,
			iLike: false,
			found: 0,
			lastUpdated: undefined,
		} );
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
						likes: undefined,
						found: 2,
						iLike: false,
						lastUpdated: FAKE_NOW,
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
						likes: undefined,
						found: 3,
						iLike: true,
						lastUpdated: FAKE_NOW,
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
						likes: undefined,
						found: 3,
						iLike: true,
						lastUpdated: FAKE_NOW,
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
						likes,
						found: 3,
						iLike: true,
						lastUpdated: FAKE_NOW,
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
			const state = itemReducer( undefined, {
				type: POST_LIKES_RECEIVE,
				siteId: 12345678,
				postId: 50,
				likes,
				found: 2,
				iLike: false,
			} );

			expect( state ).toEqual( {
				likes: undefined,
				found: 2,
				iLike: false,
				lastUpdated: FAKE_NOW,
			} );
		} );

		test( 'should persist state', () => {
			const likes = [ { ID: 1, login: 'chicken' } ];
			const state = serialize(
				items,
				deepFreeze( {
					12345678: {
						50: {
							likes,
							found: 2,
							iLike: false,
							lastUpdated: 2000,
						},
					},
				} )
			);

			expect( state.root() ).toEqual( {
				12345678: {
					50: {
						likes,
						found: 2,
						iLike: false,
						lastUpdated: 2000,
					},
				},
			} );
		} );

		test( 'should load valid persisted state', () => {
			const likes = [ { ID: 1, login: 'chicken' } ];
			const state = deserialize(
				items,
				deepFreeze( {
					12345678: {
						50: {
							likes,
							found: 2,
							iLike: false,
							lastUpdated: 4000,
						},
					},
				} )
			);

			expect( state ).toEqual( {
				12345678: {
					50: {
						likes,
						found: 2,
						iLike: false,
						lastUpdated: 4000,
					},
				},
			} );
		} );

		test( 'should not load invalid persisted state', () => {
			const state = deserialize(
				items,
				deepFreeze( {
					status: 'ribs',
				} )
			);

			expect( state ).toEqual( {} );
		} );

		describe( 'a POST_LIKE action', () => {
			test( 'should create a new state item if none is found', () => {
				const state = itemReducer( undefined, like( 1, 1 ) );
				expect( state ).toEqual( {
					likes: undefined,
					iLike: true,
					found: 1,
				} );
			} );

			test( 'should update the current state if it is present', () => {
				const state = itemReducer(
					deepFreeze( {
						likes: [],
						iLike: false,
						found: 1,
					} ),
					like( 1, 1 )
				);
				expect( state ).toEqual( {
					likes: [],
					iLike: true,
					found: 2,
				} );
			} );

			test( 'should not change the state if the user already likes the post', () => {
				const initialState = deepFreeze( {
					likes: [],
					iLike: true,
					found: 1,
				} );
				const state = itemReducer( initialState, like( 1, 1 ) );
				expect( state ).toBe( initialState );
			} );
		} );

		describe( 'a POST_UNLIKE action', () => {
			test( 'should not create a new state item if none is found', () => {
				const state = itemReducer( DEFAULT_ITEM_STATE, unlike( 1, 1 ) );
				expect( state ).toBe( DEFAULT_ITEM_STATE );
			} );

			test( 'should update the current state if it is present', () => {
				const state = itemReducer(
					deepFreeze( {
						likes: [],
						iLike: true,
						found: 1,
					} ),
					unlike( 1, 1 )
				);
				expect( state ).toEqual( {
					likes: [],
					iLike: false,
					found: 0,
				} );
			} );

			test( 'should not change the state if the user does not like the post', () => {
				const initialState = deepFreeze( {
					likes: [],
					iLike: false,
					found: 1,
				} );
				const state = itemReducer( initialState, unlike( 1, 1 ) );
				expect( state ).toBe( initialState );
			} );
		} );

		describe( 'a POST_LIKES_ADD_LIKER action', () => {
			const liker = deepFreeze( {
				ID: 10,
			} );
			test( 'should create a new entry when no entry is present', () => {
				expect( itemReducer( undefined, addLiker( 1, 1, 5, liker ) ) ).toEqual( {
					likes: [ liker ],
					found: 0,
					iLike: false,
				} );
			} );

			test( 'should make a new array if one is not present', () => {
				expect(
					itemReducer(
						deepFreeze( {
							likes: undefined,
							found: 5,
							iLike: false,
						} ),
						addLiker( 1, 1, 6, liker )
					)
				).toEqual( {
					likes: [ liker ],
					found: 5,
					iLike: false,
				} );
			} );

			test( 'should prepend to the existing array if present', () => {
				expect(
					itemReducer(
						deepFreeze( {
							likes: [ { ID: 5 } ],
							found: 5,
							iLike: false,
						} ),
						addLiker( 1, 1, 6, liker )
					)
				).toEqual( {
					likes: [ liker, { ID: 5 } ],
					found: 5,
					iLike: false,
				} );
			} );

			test( 'should return previous state if liker is already present', () => {
				const initialState = deepFreeze( {
					likes: [ { ID: 2 }, liker ],
					found: 5,
					iLike: false,
				} );
				const state = itemReducer(
					initialState,
					// same liker, different count
					addLiker( 1, 1, 6, liker )
				);

				expect( state ).toBe( initialState );
			} );
		} );

		// POST_LIKERS_RECEIVE
		describe( 'a POST_LIKES_REMOVE_LIKER action', () => {
			const liker = deepFreeze( {
				ID: 10,
			} );

			test( 'should not create a new entry if none is present', () => {
				expect( itemReducer( undefined, removeLiker( 1, 1, 5, liker ) ) ).toEqual( {
					found: 0,
					iLike: false,
				} );
			} );

			test( 'should remove from the existing array if present', () => {
				expect(
					itemReducer(
						deepFreeze( {
							likes: [ { ID: 123 }, liker, { ID: 456 } ],
							found: 5,
							iLike: true,
						} ),
						removeLiker( 1, 1, 4, liker )
					)
				).toEqual( {
					likes: [ { ID: 123 }, { ID: 456 } ],
					found: 5,
					iLike: true,
				} );
			} );

			test( 'should return previous state if liker is not present', () => {
				const initialState = deepFreeze( {
					likes: [ { ID: 2 } ],
					found: 5,
					iLike: false,
					lastUpdated: undefined,
				} );
				const state = itemReducer(
					initialState,
					// same liker, reduced count
					removeLiker( 1, 1, 4, liker )
				);

				expect( state ).toBe( initialState );
			} );
		} );

		describe( 'a POST_LIKERS_RECEIVE action', () => {
			const likersReceiveData = deepFreeze( {
				likes: [
					{
						ID: 1234,
						login: 'test1234',
					},
					{
						ID: 12345,
						login: 'test12345',
					},
				],
				found: 2,
				iLike: true,
			} );
			test( 'should create a new entry if none is present, without initialising non-likes fields', () => {
				expect( itemReducer( undefined, receivePostLikers( 1, 1, likersReceiveData ) ) ).toEqual( {
					likes: likersReceiveData.likes,
					found: 0,
					iLike: false,
					lastUpdated: undefined,
				} );
			} );

			test( 'should update the likes array and should not update found', () => {
				expect(
					itemReducer(
						deepFreeze( {
							likes: undefined,
							found: 5,
							iLike: false,
						} ),
						receivePostLikers( 1, 1, likersReceiveData )
					)
				).toEqual( {
					likes: likersReceiveData.likes,
					found: 5,
					iLike: false,
				} );
			} );

			test( 'should replace the existing likes data', () => {
				expect(
					itemReducer(
						deepFreeze( {
							likes: [ { ID: 123 }, { ID: 456 } ],
							found: 5,
							iLike: false,
						} ),
						receivePostLikers( 1, 1, likersReceiveData )
					)
				).toEqual( {
					likes: likersReceiveData.likes,
					found: 5,
					iLike: false,
				} );
			} );

			test( 'should replace the likes array when the incoming data has empty likes', () => {
				const initialState = deepFreeze( {
					likes: [ { ID: 2 } ],
					found: 5,
					iLike: false,
				} );

				const state = itemReducer(
					initialState,
					receivePostLikers( 1, 1, { likes: [], found: 0 } )
				);

				expect( state ).toEqual( {
					likes: [],
					found: 5,
					iLike: false,
				} );
			} );

			test( 'should replace the likes array when the incoming data has undefined likes', () => {
				const initialState = deepFreeze( {
					likes: [ { ID: 2 } ],
					found: 5,
					iLike: false,
				} );

				const state = itemReducer(
					initialState,
					receivePostLikers( 1, 1, { likes: undefined, found: 0 } )
				);

				expect( state ).toEqual( {
					likes: undefined,
					found: 5,
					iLike: false,
				} );
			} );
		} );
	} );
} );
