/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	receiveLists,
	requestList,
	requestSubscribedLists,
	followList,
	unfollowList,
	updateListDetails,
	dismissListNotice,
	updateTitle,
	updateDescription,
} from '../actions';
import {
	READER_LIST_DISMISS_NOTICE,
	READER_LIST_REQUEST,
	READER_LIST_UPDATE,
	READER_LISTS_RECEIVE,
	READER_LISTS_REQUEST,
	READER_LISTS_FOLLOW,
	READER_LISTS_UNFOLLOW,
	READER_LIST_UPDATE_TITLE,
	READER_LIST_UPDATE_DESCRIPTION,
} from 'state/reader/action-types';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.resetHistory();
	} );

	describe( '#receiveLists()', () => {
		test( 'should return an action object', () => {
			const lists = [ { ID: 841, title: 'Hello World', slug: 'hello-world' } ];
			const action = receiveLists( lists );

			expect( action ).to.eql( {
				type: READER_LISTS_RECEIVE,
				lists,
			} );
		} );
	} );

	describe( '#requestList()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.2/read/lists/listowner/listslug' )
				.reply( 200, {
					list: {
						ID: 123,
						title: 'My test list',
					},
				} );
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			requestList()( spy );

			expect( spy ).to.have.been.calledWith( {
				type: READER_LIST_REQUEST,
			} );
		} );
	} );

	describe( '#requestSubscribedLists()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.2/read/lists' )
				.reply( 200, {
					found: 2,
					lists: [
						{ ID: 841, title: 'Hello World' },
						{ ID: 413, title: 'Mango & Feijoa' },
					],
				} );
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			requestSubscribedLists()( spy );

			expect( spy ).to.have.been.calledWith( {
				type: READER_LISTS_REQUEST,
			} );
		} );

		test( 'should dispatch lists receive action when request completes', () => {
			return requestSubscribedLists()( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: READER_LISTS_RECEIVE,
					lists: [
						{ ID: 841, title: 'Hello World' },
						{ ID: 413, title: 'Mango & Feijoa' },
					],
				} );
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

			expect( spy ).to.have.been.calledWith( {
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

			expect( spy ).to.have.been.calledWith( {
				type: READER_LISTS_UNFOLLOW,
				owner: 'restapitests',
				slug: 'testlist',
			} );
		} );
	} );

	describe( '#updateListDetails()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.2/read/lists/restapitests/testlist/update' )
				.reply( 200, {
					following: false,
				} );
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			const list = { owner: 'restapitests', slug: 'testlist', title: 'Banana' };
			updateListDetails( list )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: READER_LIST_UPDATE,
				list,
			} );
		} );
	} );

	describe( '#dismissListNotice()', () => {
		test( 'should dispatch the dismiss action', () => {
			const listId = 123;
			dismissListNotice( listId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: READER_LIST_DISMISS_NOTICE,
				listId: 123,
			} );
		} );
	} );

	describe( '#updateTitle()', () => {
		test( 'should dispatch the right action', () => {
			const listId = 123;
			const newTitle = 'Banana';
			updateTitle( listId, newTitle )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: READER_LIST_UPDATE_TITLE,
				listId: 123,
				title: newTitle,
			} );
		} );
	} );

	describe( '#updateDescription()', () => {
		test( 'should dispatch the right action', () => {
			const listId = 123;
			const newDescription = 'Yellow is a excellent fruit colour';
			updateDescription( listId, newDescription )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: READER_LIST_UPDATE_DESCRIPTION,
				listId: 123,
				description: newDescription,
			} );
		} );
	} );
} );
