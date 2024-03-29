import deepFreeze from 'deep-freeze';
import {
	POST_STATS_RECEIVE,
	POST_STATS_REQUEST,
	POST_STATS_REQUEST_FAILURE,
	POST_STATS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import { requesting, items } from '../reducer';

describe( 'reducer', () => {
	jest.spyOn( console, 'warn' ).mockImplementation();

	describe( '#requesting()', () => {
		test( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should set requesting value to true if request in progress', () => {
			const state = requesting( undefined, {
				type: POST_STATS_REQUEST,
				siteId: 2916284,
				postId: 2454,
				fields: [ 'views', 'years' ],
			} );

			expect( state ).toEqual( {
				2916284: {
					2454: {
						'views,years': true,
					},
				},
			} );
		} );

		test( 'should accumulate requesting values (stat)', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: { views: true },
				},
			} );
			const state = requesting( previousState, {
				type: POST_STATS_REQUEST,
				siteId: 2916284,
				postId: 2454,
				fields: [ 'countComments' ],
			} );

			expect( state ).toEqual( {
				2916284: {
					2454: {
						views: true,
						countComments: true,
					},
				},
			} );
		} );

		test( 'should accumulate requesting values (postId)', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: { views: true },
				},
			} );
			const state = requesting( previousState, {
				type: POST_STATS_REQUEST,
				siteId: 2916284,
				postId: 2455,
				fields: [ 'views' ],
			} );

			expect( state ).toEqual( {
				2916284: {
					2454: { views: true },
					2455: { views: true },
				},
			} );
		} );

		test( 'should accumulate requesting values (siteId)', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: { views: true },
				},
			} );
			const state = requesting( previousState, {
				type: POST_STATS_REQUEST,
				siteId: 2916285,
				postId: 2454,
				fields: [ 'views' ],
			} );

			expect( state ).toEqual( {
				2916284: {
					2454: { views: true },
				},
				2916285: {
					2454: { views: true },
				},
			} );
		} );

		test( 'should set request to false if request finishes successfully', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: { views: true },
				},
			} );
			const state = requesting( previousState, {
				type: POST_STATS_REQUEST_SUCCESS,
				siteId: 2916284,
				postId: 2454,
				fields: [ 'views' ],
			} );

			expect( state ).toEqual( {
				2916284: {
					2454: { views: false },
				},
			} );
		} );

		test( 'should set request to false if request finishes with failure', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: { views: true },
				},
			} );
			const state = requesting( previousState, {
				type: POST_STATS_REQUEST_FAILURE,
				siteId: 2916284,
				postId: 2454,
				fields: [ 'views' ],
			} );

			expect( state ).toEqual( {
				2916284: {
					2454: { views: false },
				},
			} );
		} );
	} );

	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should index post stats by site ID, post id and stat', () => {
			const state = items( null, {
				type: POST_STATS_RECEIVE,
				siteId: 2916284,
				postId: 2454,
				stats: { views: 2, years: [] },
			} );

			expect( state ).toEqual( {
				2916284: {
					2454: { views: 2, years: [] },
				},
			} );
		} );

		test( 'should accumulate stats', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: { views: 2 },
				},
			} );
			const state = items( previousState, {
				type: POST_STATS_RECEIVE,
				siteId: 2916284,
				postId: 2454,
				stats: { countComments: 3 },
			} );

			expect( state ).toEqual( {
				2916284: {
					2454: {
						views: 2,
						countComments: 3,
					},
				},
			} );
		} );

		test( 'should accumulate post IDs', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: { views: 2 },
				},
			} );
			const state = items( previousState, {
				type: POST_STATS_RECEIVE,
				siteId: 2916284,
				postId: 2455,
				stats: { views: 3 },
			} );

			expect( state ).toEqual( {
				2916284: {
					2454: { views: 2 },
					2455: { views: 3 },
				},
			} );
		} );

		test( 'should accumulate site IDs', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: { views: 2 },
				},
			} );
			const state = items( previousState, {
				type: POST_STATS_RECEIVE,
				siteId: 2916285,
				postId: 2454,
				stats: { views: 3 },
			} );

			expect( state ).toEqual( {
				2916284: {
					2454: { views: 2 },
				},
				2916285: {
					2454: { views: 3 },
				},
			} );
		} );

		test( 'should override previous stat value of same site ID, post ID and stat key', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: { views: 2 },
				},
			} );
			const state = items( previousState, {
				type: POST_STATS_RECEIVE,
				siteId: 2916284,
				postId: 2454,
				stats: { views: 3 },
			} );

			expect( state ).toEqual( {
				2916284: {
					2454: { views: 3 },
				},
			} );
		} );

		test( 'should persist state', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: { views: 2 },
				},
			} );
			const state = serialize( items, previousState );

			expect( state ).toEqual( {
				2916284: {
					2454: { views: 2 },
				},
			} );
		} );

		test( 'should load valid persisted state', () => {
			const previousState = deepFreeze( {
				2916284: {
					2454: { views: 2 },
				},
			} );
			const state = deserialize( items, previousState );

			expect( state ).toEqual( {
				2916284: {
					2454: { views: 2 },
				},
			} );
		} );

		test( 'should not load invalid persisted state', () => {
			const previousInvalidState = deepFreeze( {
				2454: { views: 2 },
			} );
			const state = deserialize( items, previousInvalidState );

			expect( state ).toEqual( {} );
		} );
	} );
} );
