/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import {
	TOP_POSTS_RECEIVE,
	TOP_POSTS_REQUEST,
	TOP_POSTS_REQUEST_FAILURE,
	TOP_POSTS_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { requesting, items as unwrappedItems } from '../reducer';
import { withSchemaValidation } from 'state/utils';

const items = withSchemaValidation( unwrappedItems.schema, unwrappedItems );

describe( 'reducer', () => {
	useSandbox( sandbox => {
		sandbox.stub( console, 'warn' );
	} );

	describe( '#requesting()', () => {
		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should set requesting value to true if request in progress', () => {
			const state = requesting( undefined, {
				type: TOP_POSTS_REQUEST,
				siteId: 2916284,
				date: '2017-06-25',
				period: 'week',
				num: 1,
			} );

			expect( state ).to.eql( {
				2916284: {
					'2017-06-25week1': true,
				},
			} );
		} );

		it( 'should accumulate requesting values (period)', () => {
			const previousState = deepFreeze( {
				2916284: {
					'2017-06-25week1': true,
				},
			} );
			const state = requesting( previousState, {
				type: TOP_POSTS_REQUEST,
				siteId: 2916284,
				date: '2017-06-25',
				period: 'day',
				num: 1,
			} );

			expect( state ).to.eql( {
				2916284: {
					'2017-06-25week1': true,
					'2017-06-25day1': true,
				},
			} );
		} );

		it( 'should accumulate requesting values (date)', () => {
			const previousState = deepFreeze( {
				2916284: {
					'2017-06-25week1': true,
				},
			} );
			const state = requesting( previousState, {
				type: TOP_POSTS_REQUEST,
				siteId: 2916284,
				date: '2017-06-24',
				period: 'week',
				num: 1,
			} );

			expect( state ).to.eql( {
				2916284: {
					'2017-06-24week1': true,
					'2017-06-25week1': true,
				},
			} );
		} );

		it( 'should accumulate requesting values (num)', () => {
			const previousState = deepFreeze( {
				2916284: {
					'2017-06-25week1': true,
				},
			} );
			const state = requesting( previousState, {
				type: TOP_POSTS_REQUEST,
				siteId: 2916284,
				date: '2017-06-25',
				period: 'week',
				num: 6,
			} );

			expect( state ).to.eql( {
				2916284: {
					'2017-06-25week1': true,
					'2017-06-25week6': true,
				},
			} );
		} );

		it( 'should accumulate requesting values (siteId)', () => {
			const previousState = deepFreeze( {
				2916284: {
					'2017-06-25week1': true,
				},
			} );
			const state = requesting( previousState, {
				type: TOP_POSTS_REQUEST,
				siteId: 2916285,
				date: '2017-06-25',
				period: 'week',
				num: 1,
			} );

			expect( state ).to.eql( {
				2916284: {
					'2017-06-25week1': true,
				},
				2916285: {
					'2017-06-25week1': true,
				},
			} );
		} );

		it( 'should set request to false if request finishes successfully', () => {
			const previousState = deepFreeze( {
				2916284: {
					'2017-06-25week1': true,
				},
			} );
			const state = requesting( previousState, {
				type: TOP_POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				date: '2017-06-25',
				period: 'week',
				num: 1,
			} );

			expect( state ).to.eql( {
				2916284: {
					'2017-06-25week1': false,
				},
			} );
		} );

		it( 'should set request to false if request finishes with failure', () => {
			const previousState = deepFreeze( {
				2916284: {
					'2017-06-25week1': true,
				},
			} );
			const state = requesting( previousState, {
				type: TOP_POSTS_REQUEST_FAILURE,
				siteId: 2916284,
				date: '2017-06-25',
				period: 'week',
				num: 1,
			} );

			expect( state ).to.eql( {
				2916284: {
					'2017-06-25week1': false,
				},
			} );
		} );
	} );

	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should index post stats by siteId, date, period and num', () => {
			const state = items( null, {
				type: TOP_POSTS_RECEIVE,
				siteId: 2916284,
				date: '2017-06-25',
				period: 'week',
				num: 1,
				postsByDay: {
					'2017-06-25': {
						postviews: [],
						total_views: 12,
					},
				},
			} );

			expect( state ).to.eql( {
				2916284: {
					'2017-06-25week1': {
						'2017-06-25': {
							postviews: [],
							total_views: 12,
						},
					},
				},
			} );
		} );

		it( 'should accumulate period', () => {
			const previousState = deepFreeze( {
				2916284: {
					'2017-06-25week1': {
						'2017-06-25': {
							postviews: [],
							total_views: 12,
						},
					},
				},
			} );

			const state = items( previousState, {
				type: TOP_POSTS_RECEIVE,
				siteId: 2916284,
				date: '2017-06-25',
				period: 'day',
				num: 1,
				postsByDay: {
					'2017-06-25': {
						postviews: [],
						total_views: 12,
					},
				},
			} );

			expect( state ).to.eql( {
				2916284: {
					'2017-06-25week1': {
						'2017-06-25': {
							postviews: [],
							total_views: 12,
						},
					},
					'2017-06-25day1': {
						'2017-06-25': {
							postviews: [],
							total_views: 12,
						},
					},
				},
			} );
		} );

		it( 'should accumulate date', () => {
			const previousState = deepFreeze( {
				2916284: {
					'2017-06-25week1': {
						'2017-06-25': {
							postviews: [],
							total_views: 12,
						},
					},
				},
			} );

			const state = items( previousState, {
				type: TOP_POSTS_RECEIVE,
				siteId: 2916284,
				date: '2017-06-26',
				period: 'week',
				num: 1,
				postsByDay: {
					'2017-06-25': {
						postviews: [],
						total_views: 12,
					},
				},
			} );

			expect( state ).to.eql( {
				2916284: {
					'2017-06-25week1': {
						'2017-06-25': {
							postviews: [],
							total_views: 12,
						},
					},
					'2017-06-26week1': {
						'2017-06-25': {
							postviews: [],
							total_views: 12,
						},
					},
				},
			} );
		} );

		it( 'should accumulate num', () => {
			const previousState = deepFreeze( {
				2916284: {
					'2017-06-25week1': {
						'2017-06-25': {
							postviews: [],
							total_views: 12,
						},
					},
				},
			} );

			const state = items( previousState, {
				type: TOP_POSTS_RECEIVE,
				siteId: 2916284,
				date: '2017-06-25',
				period: 'week',
				num: 2,
				postsByDay: {
					'2017-06-25': {
						postviews: [],
						total_views: 12,
					},
				},
			} );

			expect( state ).to.eql( {
				2916284: {
					'2017-06-25week1': {
						'2017-06-25': {
							postviews: [],
							total_views: 12,
						},
					},
					'2017-06-25week2': {
						'2017-06-25': {
							postviews: [],
							total_views: 12,
						},
					},
				},
			} );
		} );

		it( 'should accumulate site IDs', () => {
			const previousState = deepFreeze( {
				2916284: {
					'2017-06-25week1': {
						'2017-06-25': {
							postviews: [],
							total_views: 12,
						},
					},
				},
			} );

			const state = items( previousState, {
				type: TOP_POSTS_RECEIVE,
				siteId: 2916285,
				date: '2017-06-25',
				period: 'week',
				num: 1,
				postsByDay: {
					'2017-06-25': {
						postviews: [],
						total_views: 12,
					},
				},
			} );

			expect( state ).to.eql( {
				2916284: {
					'2017-06-25week1': {
						'2017-06-25': {
							postviews: [],
							total_views: 12,
						},
					},
				},
				2916285: {
					'2017-06-25week1': {
						'2017-06-25': {
							postviews: [],
							total_views: 12,
						},
					},
				},
			} );
		} );

		it( 'should override previous stat value of same siteId, date, period and num', () => {
			const previousState = deepFreeze( {
				2916284: {
					'2017-06-25week1': {
						'2017-06-25': {
							postviews: [],
							total_views: 12,
						},
					},
				},
			} );
			const state = items( previousState, {
				type: TOP_POSTS_RECEIVE,
				siteId: 2916284,
				date: '2017-06-25',
				period: 'week',
				num: 1,
				postsByDay: {
					'2017-06-25': {
						postviews: [],
						total_views: 10,
					},
				},
			} );

			expect( state ).to.eql( {
				2916284: {
					'2017-06-25week1': {
						'2017-06-25': {
							postviews: [],
							total_views: 10,
						},
					},
				},
			} );
		} );

		it( 'should persist state', () => {
			const previousState = deepFreeze( {
				2916284: {
					'2017-06-25week1': {
						'2017-06-25': {
							postviews: [],
							total_views: 12,
						},
					},
				},
			} );
			const state = items( previousState, { type: SERIALIZE } );

			expect( state ).to.eql( {
				2916284: {
					'2017-06-25week1': {
						'2017-06-25': {
							postviews: [],
							total_views: 12,
						},
					},
				},
			} );
		} );

		it( 'should load valid persisted state', () => {
			const previousState = deepFreeze( {
				2916284: {
					'2017-06-25week1': {
						'2017-06-25': {
							postviews: [],
							total_views: 12,
						},
					},
				},
			} );
			const state = items( previousState, { type: DESERIALIZE } );

			expect( state ).to.eql( {
				2916284: {
					'2017-06-25week1': {
						'2017-06-25': {
							postviews: [],
							total_views: 12,
						},
					},
				},
			} );
		} );

		it( 'should not load invalid persisted state', () => {
			const previousInvalidState = deepFreeze( {
				2916284: {
					'2017-06-251': {
						'2017-06-25': {
							postviews: [],
							total_views: 12,
						},
					},
				},
			} );
			const state = items( previousInvalidState, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );
} );
