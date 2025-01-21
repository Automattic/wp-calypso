import {
	READER_LIST__DELETE,
	READER_LIST__REQUEST,
	READER_LISTS__RECEIVE,
	READER_LISTS__REQUEST,
	READER_LIST__FOLLOW,
	READER_LIST__UNFOLLOW,
} from 'calypso/state/reader/action-types';
import {
	deleteReaderList,
	receiveLists,
	requestList,
	requestSubscribedLists,
	followList,
	unfollowList,
} from '../actions';

describe( 'actions', () => {
	describe( '#receiveLists()', () => {
		test( 'should return an action object', () => {
			const lists = [ { ID: 841, title: 'Hello World', slug: 'hello-world' } ];
			const action = receiveLists( lists );

			expect( action ).toEqual( {
				type: READER_LISTS__RECEIVE,
				lists,
			} );
		} );
	} );

	describe( '#requestList()', () => {
		test( 'should return an action object', () => {
			const action = requestList( 'pob', 'things-i-like' );

			expect( action ).toEqual( {
				type: READER_LIST__REQUEST,
				listOwner: 'pob',
				listSlug: 'things-i-like',
			} );
		} );
	} );

	describe( '#requestSubscribedLists()', () => {
		test( 'should return an action object', () => {
			const action = requestSubscribedLists();

			expect( action ).toEqual( {
				type: READER_LISTS__REQUEST,
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
