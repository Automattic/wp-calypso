import {
	READER_LIST__DELETE,
	READER_LIST__REQUEST_TARGET_LIST,
	READER_LIST__RECEIVE_CURRENT_USER_SUBSCRIBED_LISTS,
	READER_LIST__REQUEST_CURRENT_USER_SUBSCRIBED_LISTS,
	READER_LIST__FOLLOW,
	READER_LIST__UNFOLLOW,
} from 'calypso/state/reader/action-types';
import {
	deleteReaderList,
	receiveCurrentUserSubscribedLists,
	requestTargetList,
	requestCurrentUserSubscribedLists,
	followList,
	unfollowList,
} from '../actions';

describe( 'actions', () => {
	describe( '#receiveCurrentUserSubscribedLists()', () => {
		test( 'should return an action object', () => {
			const lists = [ { ID: 841, title: 'Hello World', slug: 'hello-world' } ];
			const action = receiveCurrentUserSubscribedLists( lists );

			expect( action ).toEqual( {
				type: READER_LIST__RECEIVE_CURRENT_USER_SUBSCRIBED_LISTS,
				lists,
			} );
		} );
	} );

	describe( '#requestTargetList()', () => {
		test( 'should return an action object', () => {
			const action = requestTargetList( 'pob', 'things-i-like' );

			expect( action ).toEqual( {
				type: READER_LIST__REQUEST_TARGET_LIST,
				listOwner: 'pob',
				listSlug: 'things-i-like',
			} );
		} );
	} );

	describe( '#requestCurrentUserSubscribedLists()', () => {
		test( 'should return an action object', () => {
			const action = requestCurrentUserSubscribedLists();

			expect( action ).toEqual( {
				type: READER_LIST__REQUEST_CURRENT_USER_SUBSCRIBED_LISTS,
			} );
		} );
	} );

	describe( '#followList()', () => {
		test( 'should return an action object', () => {
			const action = followList( 'restapitests', 'testlist' );

			expect( action ).toEqual( {
				type: READER_LIST__FOLLOW,
				listOwner: 'restapitests',
				listSlug: 'testlist',
			} );
		} );
	} );

	describe( '#unfollowList()', () => {
		test( 'should return an action object', () => {
			const action = unfollowList( 'restapitests', 'testlist' );

			expect( action ).toEqual( {
				type: READER_LIST__UNFOLLOW,
				listOwner: 'restapitests',
				listSlug: 'testlist',
			} );
		} );
	} );

	describe( '#deleteReaderList', () => {
		test( 'should return the correct action', () => {
			const action = deleteReaderList( 123, 'restapitests', 'testlist' );
			expect( action ).toEqual( {
				type: READER_LIST__DELETE,
				listId: 123,
				listOwner: 'restapitests',
				listSlug: 'testlist',
			} );
		} );
	} );
} );
