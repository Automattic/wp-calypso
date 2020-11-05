/**
 * Internal dependencies
 */
import {
	deleteReaderList,
	receiveLists,
	requestList,
	requestSubscribedLists,
	followList,
	unfollowList,
	dismissListNotice,
} from '../actions';
import {
	READER_LIST_DELETE,
	READER_LIST_DISMISS_NOTICE,
	READER_LIST_REQUEST,
	READER_LISTS_RECEIVE,
	READER_LISTS_REQUEST,
	READER_LISTS_FOLLOW,
	READER_LISTS_UNFOLLOW,
} from 'calypso/state/reader/action-types';
import useNock from 'calypso/test-helpers/use-nock';

describe( 'actions', () => {
	const spy = jest.fn();

	afterEach( () => {
		jest.clearAllMocks();
	} );

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
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.2/read/lists/restapitests/testlist/follow' )
				.reply( 200, {
					following: true,
				} );
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			followList( 'restapitests', 'testlist' )( spy );

			expect( spy ).toHaveBeenCalledWith( {
				type: READER_LISTS_FOLLOW,
				owner: 'restapitests',
				slug: 'testlist',
			} );
		} );
	} );

	describe( '#unfollowList()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.2/read/lists/restapitests/testlist/unfollow' )
				.reply( 200, {
					following: false,
				} );
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			unfollowList( 'restapitests', 'testlist' )( spy );

			expect( spy ).toHaveBeenCalledWith( {
				type: READER_LISTS_UNFOLLOW,
				owner: 'restapitests',
				slug: 'testlist',
			} );
		} );
	} );

	describe( '#dismissListNotice()', () => {
		test( 'should dispatch the dismiss action', () => {
			const listId = 123;
			dismissListNotice( listId )( spy );

			expect( spy ).toHaveBeenCalledWith( {
				type: READER_LIST_DISMISS_NOTICE,
				listId: 123,
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
} );
