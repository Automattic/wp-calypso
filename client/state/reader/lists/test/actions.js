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
} from '../actions';
import {
	READER_LIST_DELETE,
	READER_LIST_REQUEST,
	READER_LISTS_RECEIVE,
	READER_LISTS_REQUEST,
	READER_LIST_FOLLOW,
	READER_LIST_UNFOLLOW,
} from 'calypso/state/reader/action-types';

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
} );
