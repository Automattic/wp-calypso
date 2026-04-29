import { READER_RECOMMENDED_BLOGS_ITEMS_REQUEST } from 'calypso/state/reader/action-types';
import { requestUserRecommendedBlogs } from '../actions';

describe( 'actions', () => {
	describe( '#requestUserRecommendedBlogs', () => {
		test( 'should dispatch request action when no request is in progress', () => {
			const dispatch = jest.fn();
			const getState = jest.fn( () => ( {
				reader: {
					lists: {
						isRequestingUserRecommendedBlogs: {
							testuser: false,
						},
					},
				},
			} ) );

			const thunk = requestUserRecommendedBlogs( 'testuser' );
			thunk( dispatch, getState );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: READER_RECOMMENDED_BLOGS_ITEMS_REQUEST,
				listOwner: 'testuser',
			} );
		} );

		test( 'should not dispatch request action when request is already in progress', () => {
			const dispatch = jest.fn();
			const getState = jest.fn( () => ( {
				reader: {
					lists: {
						isRequestingUserRecommendedBlogs: {
							testuser: true,
						},
					},
				},
			} ) );

			const thunk = requestUserRecommendedBlogs( 'testuser' );
			thunk( dispatch, getState );

			expect( dispatch ).not.toHaveBeenCalled();
		} );

		test( 'should dispatch request action when user has no existing request state', () => {
			const dispatch = jest.fn();
			const getState = jest.fn( () => ( {
				reader: {
					lists: {
						isRequestingUserRecommendedBlogs: {},
					},
				},
			} ) );

			const thunk = requestUserRecommendedBlogs( 'testuser' );
			thunk( dispatch, getState );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: READER_RECOMMENDED_BLOGS_ITEMS_REQUEST,
				listOwner: 'testuser',
			} );
		} );

		test( 'should dispatch request action when user has undefined request state', () => {
			const dispatch = jest.fn();
			const getState = jest.fn( () => ( {
				reader: {
					lists: {
						isRequestingUserRecommendedBlogs: {
							testuser: undefined,
						},
					},
				},
			} ) );

			const thunk = requestUserRecommendedBlogs( 'testuser' );
			thunk( dispatch, getState );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: READER_RECOMMENDED_BLOGS_ITEMS_REQUEST,
				listOwner: 'testuser',
			} );
		} );
	} );
} );
