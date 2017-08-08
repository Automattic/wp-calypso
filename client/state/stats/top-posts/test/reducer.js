/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { flow } from 'lodash';

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
import { getSerializedTopPostsQuery as serializeQuery } from '../utils';

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
			const query = { date: '2017-06-25', period: 'week' };
			const state = requesting( undefined, {
				type: TOP_POSTS_REQUEST,
				siteId: 2916284,
				query,
			} );
			expect( state ).to.eql( {
				[ serializeQuery( query, 2916284 ) ]: true,
			} );
		} );

		it( 'should accumulate requesting values', () => {
			const query1 = { date: '2017-06-25', period: 'week' };
			const query2 = { date: '2017-06-25', period: 'day' };
			const query3 = { date: '2017-06-24', period: 'day' };
			const query4 = { date: '2017-06-25', period: 'day', max: 5 };

			const addRequest = ( query, siteId ) => state =>
				requesting( state, { type: TOP_POSTS_REQUEST, siteId, query } );

			const state = flow(
				addRequest( query1, 2916284 ),
				addRequest( query2, 2916284 ),
				addRequest( query3, 2916284 ),
				addRequest( query4, 2916284 ),
				addRequest( query1, 2916285 ),
			)( {} );

			expect( state ).to.eql( {
				[ serializeQuery( query1, 2916284 ) ]: true,
				[ serializeQuery( query2, 2916284 ) ]: true,
				[ serializeQuery( query3, 2916284 ) ]: true,
				[ serializeQuery( query4, 2916284 ) ]: true,
				[ serializeQuery( query1, 2916285 ) ]: true,
			} );
		} );

		it( 'should remove the request if it finishes successfully', () => {
			const query = { date: '2017-06-25' };
			const prevState = deepFreeze( {
				[ serializeQuery( query, 2916284 ) ]: true,
			} );
			const state = requesting( prevState, {
				type: TOP_POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				query,
			} );
			expect( state ).to.eql( {} );
		} );

		it( 'should remove the request if it finishes with failure', () => {
			const query = { date: '2017-06-25' };
			const prevState = deepFreeze( {
				[ serializeQuery( query, 2916284 ) ]: true,
			} );
			const state = requesting( prevState, {
				type: TOP_POSTS_REQUEST_FAILURE,
				siteId: 2916284,
				query,
			} );
			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should index posts correctly', () => {
			const query = { date: '2017-06-25' };
			const state = items( null, {
				type: TOP_POSTS_RECEIVE,
				siteId: 2916284,
				query,
				postsByDay: {
					'2017-06-25': {
						postviews: [],
						total_views: 12,
					},
				},
			} );

			expect( state ).to.eql( {
				[ serializeQuery( query, 2916284 ) ]: {
					'2017-06-25': {
						postviews: [],
						total_views: 12,
					},
				},
			} );
		} );

		it( 'should accumulate request params', () => {
			const query1 = { date: '2017-06-25', period: 'week' };
			const query2 = { date: '2017-06-25', period: 'day' };
			const query3 = { date: '2017-06-24', period: 'day' };
			const query4 = { date: '2017-06-25', period: 'day', max: 5 };
			const result = { '2017-06-25': { postviews: [], total_views: 12 } };

			const addItems = ( query, siteId ) => state =>
				items( state, { type: TOP_POSTS_RECEIVE, siteId, query, postsByDay: result } );

			const state = flow(
				addItems( query1, 2916284 ),
				addItems( query2, 2916284 ),
				addItems( query3, 2916284 ),
				addItems( query4, 2916284 ),
				addItems( query1, 2916285 ),
			)( {} );

			expect( state ).to.eql( {
				[ serializeQuery( query1, 2916284 ) ]: result,
				[ serializeQuery( query2, 2916284 ) ]: result,
				[ serializeQuery( query3, 2916284 ) ]: result,
				[ serializeQuery( query4, 2916284 ) ]: result,
				[ serializeQuery( query1, 2916285 ) ]: result,
			} );
		} );

		it( 'should override previous stat value of same siteId and query', () => {
			const prevState = deepFreeze( {
				[ serializeQuery( { date: '2017-06-25' }, 2916284 ) ]: {
					'2017-06-25': {
						postviews: [],
						total_views: 12,
					},
				},
			} );
			const state = items( prevState, {
				type: TOP_POSTS_RECEIVE,
				siteId: 2916284,
				query: { date: '2017-06-25' },
				postsByDay: {
					'2017-06-25': {
						postviews: [],
						total_views: 10,
					},
				},
			} );

			expect( state ).to.eql( {
				[ serializeQuery( { date: '2017-06-25' }, 2916284 ) ]: {
					'2017-06-25': {
						postviews: [],
						total_views: 10,
					},
				},
			} );
		} );

		it( 'should persist state', () => {
			const prevState = deepFreeze( {
				[ serializeQuery( { date: '2017-06-25' }, 2916284 ) ]: {
					'2017-06-25': {
						postviews: [],
						total_views: 12,
					},
				},
			} );
			const state = items( prevState, { type: SERIALIZE } );

			expect( state ).to.eql( {
				[ serializeQuery( { date: '2017-06-25' }, 2916284 ) ]: {
					'2017-06-25': {
						postviews: [],
						total_views: 12,
					},
				},
			} );
		} );

		it( 'should load valid persisted state', () => {
			const prevState = deepFreeze( {
				[ serializeQuery( { date: '2017-06-25' }, 2916284 ) ]: {
					'2017-06-25': {
						postviews: [],
						total_views: 12,
					},
				},
			} );
			const state = items( prevState, { type: DESERIALIZE } );

			expect( state ).to.eql( {
				[ serializeQuery( { date: '2017-06-25' }, 2916284 ) ]: {
					'2017-06-25': {
						postviews: [],
						total_views: 12,
					},
				},
			} );
		} );

		it( 'should not load invalid persisted state', () => {
			const previousInvalidState = deepFreeze( {
				[ serializeQuery( { date: '2017-06-25' }, 2916284 ) ]: {
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
