import {
	READER_LIST_DELETE,
	READER_LIST_REQUEST,
	READER_LISTS_RECEIVE,
	READER_LISTS_REQUEST,
	READER_LIST_FOLLOW,
	READER_LIST_UNFOLLOW,
	READER_LIST_ITEM_ADD_FEED,
	READER_RECOMMENDED_BLOGS_ITEMS_REQUEST,
	READER_LIST_ITEMS_REQUEST,
	READER_LIST_ITEM_DELETE_FEED,
} from 'calypso/state/reader/action-types';
import {
	deleteReaderList,
	receiveLists,
	requestList,
	requestSubscribedLists,
	followList,
	unfollowList,
	requestUserRecommendedBlogs,
	requestRecommendedBlogsListItems,
	addRecommendedBlogsSite,
	removeRecommendedBlogsSite,
} from '../actions';

describe( 'actions', () => {
	describe( '#receiveLists()', () => {
		test( 'should return an action object', () => {
			const lists = [ { ID: 841, title: 'Hello World', slug: 'hello-world' } ];
			const action = receiveLists( lists );

			expect( action ).toEqual( {
				type: READER_LISTS_RECEIVE,
				lists,
			} );
		} );
	} );

	describe( '#requestList()', () => {
		test( 'should return an action object', () => {
			const action = requestList( 'pob', 'things-i-like' );

			expect( action ).toEqual( {
				type: READER_LIST_REQUEST,
				listOwner: 'pob',
				listSlug: 'things-i-like',
			} );
		} );
	} );

	describe( '#requestSubscribedLists()', () => {
		test( 'should return an action object', () => {
			const action = requestSubscribedLists();

			expect( action ).toEqual( {
				type: READER_LISTS_REQUEST,
			} );
		} );
	} );

	describe( '#followList()', () => {
		test( 'should return an action object', () => {
			const action = followList( 'restapitests', 'testlist' );

			expect( action ).toEqual( {
				type: READER_LIST_FOLLOW,
				listOwner: 'restapitests',
				listSlug: 'testlist',
			} );
		} );
	} );

	describe( '#unfollowList()', () => {
		test( 'should return an action object', () => {
			const action = unfollowList( 'restapitests', 'testlist' );

			expect( action ).toEqual( {
				type: READER_LIST_UNFOLLOW,
				listOwner: 'restapitests',
				listSlug: 'testlist',
			} );
		} );
	} );

	describe( '#deleteReaderList', () => {
		test( 'should return the correct action', () => {
			const action = deleteReaderList( 123, 'restapitests', 'testlist' );
			expect( action ).toEqual( {
				type: READER_LIST_DELETE,
				listId: 123,
				listOwner: 'restapitests',
				listSlug: 'testlist',
			} );
		} );
	} );

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

	describe( '#requestRecommendedBlogsListItems()', () => {
		test( 'should return an action object for requesting recommended blogs list items', () => {
			const action = requestRecommendedBlogsListItems( 'testuser' );

			expect( action ).toEqual( {
				type: READER_LIST_ITEMS_REQUEST,
				listOwner: 'testuser',
				listSlug: 'recommended-blogs',
			} );
		} );
	} );

	describe( '#addRecommendedBlogsSite()', () => {
		test( 'should return an action object for adding a feed to recommended blogs', () => {
			const action = addRecommendedBlogsSite( 123, 456, 'testuser' );

			expect( action ).toEqual( {
				type: READER_LIST_ITEM_ADD_FEED,
				listId: 123,
				listOwner: 'testuser',
				listSlug: 'recommended-blogs',
				feedId: 456,
			} );
		} );

		test( 'should include custom options when provided', () => {
			const options = {
				successMessage: 'Custom success message',
				errorMessage: 'Custom error message',
				noticeDuration: 10000,
			};
			const action = addRecommendedBlogsSite( 123, 456, 'testuser', options );

			expect( action ).toEqual( {
				type: READER_LIST_ITEM_ADD_FEED,
				listId: 123,
				listOwner: 'testuser',
				listSlug: 'recommended-blogs',
				feedId: 456,
				successMessage: 'Custom success message',
				errorMessage: 'Custom error message',
				noticeDuration: 10000,
			} );
		} );
	} );

	describe( '#removeRecommendedBlogsSite()', () => {
		test( 'should return an action object for removing a feed from recommended blogs', () => {
			const action = removeRecommendedBlogsSite( 123, 456, 'testuser' );

			expect( action ).toEqual( {
				type: READER_LIST_ITEM_DELETE_FEED,
				listId: 123,
				listOwner: 'testuser',
				listSlug: 'recommended-blogs',
				feedId: 456,
			} );
		} );

		test( 'should include custom options when provided', () => {
			const options = {
				successMessage: 'Custom success message',
				errorMessage: 'Custom error message',
				noticeDuration: 5000,
			};
			const action = removeRecommendedBlogsSite( 123, 456, 'testuser', options );

			expect( action ).toEqual( {
				type: READER_LIST_ITEM_DELETE_FEED,
				listId: 123,
				listOwner: 'testuser',
				listSlug: 'recommended-blogs',
				feedId: 456,
				successMessage: 'Custom success message',
				errorMessage: 'Custom error message',
				noticeDuration: 5000,
			} );
		} );
	} );
} );
