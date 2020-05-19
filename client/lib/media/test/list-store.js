/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { assign, find } from 'lodash';
import sinon from 'sinon';

jest.mock( 'lib/user', () => () => {} );

const DUMMY_SITE_ID = 1,
	DUMMY_MEDIA_ID = 10,
	DUMMY_MEDIA_OBJECT = {
		ID: DUMMY_MEDIA_ID,
		title: 'Image',
		date: '2015-06-19T09:36:09-04:00',
		mime_type: 'image/png',
	},
	DUMMY_MEDIA_RESPONSE = {
		media: [ DUMMY_MEDIA_OBJECT ],
		meta: { next_page: 'value%3D2015-03-04T14%253A38%253A21%252B00%253A00%26id%3D2135' },
	};

describe( 'MediaListStore', () => {
	let Dispatcher, sandbox, MediaListStore, handler, MediaStore;

	beforeAll( function () {
		MediaStore = require( '../store' );
		Dispatcher = require( 'dispatcher' );

		sandbox = sinon.createSandbox();
		sandbox.spy( Dispatcher, 'register' );
		sandbox.stub( Dispatcher, 'waitFor' ).returns( true );
		sandbox.stub( MediaStore, 'get' ).callsFake( function ( siteId, postId ) {
			if ( DUMMY_MEDIA_OBJECT.ID === postId ) {
				return DUMMY_MEDIA_OBJECT;
			}
		} );

		MediaListStore = require( '../list-store' );
		handler = Dispatcher.register.lastCall.args[ 0 ];
	} );

	beforeEach( () => {
		MediaListStore._media = {};
		MediaListStore._activeQueries = {};
	} );

	afterAll( function () {
		sandbox.restore();
	} );

	function dispatchSetQuery( action ) {
		handler( {
			action: assign(
				{
					type: 'SET_MEDIA_QUERY',
					siteId: DUMMY_SITE_ID,
				},
				action
			),
		} );
	}

	function dispatchFetchMedia( action ) {
		handler( {
			action: assign(
				{
					type: 'FETCH_MEDIA_ITEMS',
					siteId: DUMMY_SITE_ID,
				},
				action
			),
		} );
	}

	function dispatchReceiveMediaItems( action ) {
		handler( {
			action: assign(
				{
					type: 'RECEIVE_MEDIA_ITEMS',
					siteId: DUMMY_SITE_ID,
					data: DUMMY_MEDIA_RESPONSE,
					query: MediaListStore.getNextPageQuery(
						action && action.siteId ? action.siteId : DUMMY_SITE_ID
					),
				},
				action
			),
		} );
	}

	function dispatchReceiveMediaItem( action ) {
		handler( {
			action: assign(
				{
					type: 'RECEIVE_MEDIA_ITEM',
					siteId: DUMMY_SITE_ID,
					data: DUMMY_MEDIA_OBJECT,
				},
				action
			),
		} );
	}

	function dispatchRemoveMediaItem( action ) {
		handler( {
			action: assign(
				{
					type: 'REMOVE_MEDIA_ITEM',
					siteId: DUMMY_SITE_ID,
					data: DUMMY_MEDIA_OBJECT,
				},
				action
			),
		} );
	}

	describe( '#get()', () => {
		test( 'should return a single value', () => {
			dispatchReceiveMediaItems();

			expect( MediaListStore.get( DUMMY_SITE_ID, DUMMY_MEDIA_ID ) ).to.equal( DUMMY_MEDIA_OBJECT );
		} );

		test( 'should return undefined for an item that does not exist', () => {
			expect( MediaListStore.get( DUMMY_SITE_ID, DUMMY_MEDIA_ID + 1 ) ).to.be.undefined;
		} );
	} );

	describe( '#getAll()', () => {
		test( 'should return all received media', () => {
			dispatchReceiveMediaItems();

			expect( MediaListStore.getAll( DUMMY_SITE_ID ) ).to.eql( DUMMY_MEDIA_RESPONSE.media );
		} );

		test( 'should sort media by date, with newest first', () => {
			const media = [
				DUMMY_MEDIA_OBJECT,
				assign( {}, DUMMY_MEDIA_OBJECT, { ID: 20, date: '2015-06-19T11:36:09-04:00' } ),
			];

			MediaStore.get.restore();
			sandbox.stub( MediaStore, 'get' ).callsFake( function ( siteId, postId ) {
				return find( media, { ID: postId } );
			} );

			dispatchReceiveMediaItems( { data: { media: media } } );

			expect( MediaListStore.getAllIds( DUMMY_SITE_ID ) ).to.eql( [ 20, 10 ] );
		} );

		test( 'should secondary sort media by ID, with larger first', () => {
			const media = [
				DUMMY_MEDIA_OBJECT,
				assign( {}, DUMMY_MEDIA_OBJECT, { ID: 20, date: DUMMY_MEDIA_OBJECT.date } ),
			];

			MediaStore.get.restore();
			sandbox.stub( MediaStore, 'get' ).callsFake( function ( siteId, postId ) {
				return find( media, { ID: postId } );
			} );

			dispatchReceiveMediaItems( { data: { media: media } } );

			expect( MediaListStore.getAllIds( DUMMY_SITE_ID ) ).to.eql( [ 20, 10 ] );
		} );

		test( 'should not sort media if the source is marked as not having a date', () => {
			const media = [
				DUMMY_MEDIA_OBJECT,
				assign( {}, DUMMY_MEDIA_OBJECT, { ID: 20, date: '2015-06-19T11:36:09-04:00' } ),
			];
			const query = { number: 2, source: 'pexels' };

			MediaStore.get.restore();
			dispatchSetQuery( { query } );

			sandbox.stub( MediaStore, 'get' ).callsFake( function ( siteId, postId ) {
				return find( media, { ID: postId } );
			} );

			dispatchReceiveMediaItems( { data: { media: media }, query } );

			expect( MediaListStore.getAllIds( DUMMY_SITE_ID ) ).to.eql( [ 10, 20 ] );
		} );

		test( 'should return undefined for a fetching site', () => {
			dispatchFetchMedia();

			expect( MediaListStore.getAll( DUMMY_SITE_ID ) ).to.be.undefined;
		} );

		test( 'should return an empty array for a site with no media', () => {
			dispatchReceiveMediaItems( { data: { media: [] } } );

			expect( MediaListStore.getAll( DUMMY_SITE_ID ) ).to.eql( [] );
		} );
	} );

	describe( '#getNextPageQuery()', () => {
		test( 'should include default parameters if no query provided', () => {
			expect( MediaListStore.getNextPageQuery( DUMMY_SITE_ID ) ).to.eql(
				MediaListStore.DEFAULT_QUERY
			);
		} );

		test( 'should include page_handle if the previous response included next_page meta', () => {
			dispatchReceiveMediaItems();

			expect( MediaListStore.getNextPageQuery( DUMMY_SITE_ID ) ).to.eql( {
				number: MediaListStore.DEFAULT_QUERY.number,
				page_handle: DUMMY_MEDIA_RESPONSE.meta.next_page,
			} );
		} );

		test( 'should preserve the query from the previous request', () => {
			const query = { mime_type: 'audio/' };
			dispatchSetQuery( { query: query } );
			dispatchFetchMedia();
			dispatchReceiveMediaItems();

			expect( MediaListStore.getNextPageQuery( DUMMY_SITE_ID ) ).to.eql(
				assign(
					{
						number: MediaListStore.DEFAULT_QUERY.number,
						page_handle: DUMMY_MEDIA_RESPONSE.meta.next_page,
					},
					query
				)
			);
		} );

		test( 'should reset the page handle when the query changes', () => {
			const query = { mime_type: 'audio/' };
			dispatchReceiveMediaItems();
			dispatchSetQuery( { query: query } );

			expect( MediaListStore.getNextPageQuery( DUMMY_SITE_ID ) ).to.eql(
				assign( {}, query, {
					number: MediaListStore.DEFAULT_QUERY.number,
					page_handle: undefined,
				} )
			);
		} );
	} );

	describe( '#hasNextPage()', () => {
		test( 'should return true if the previous response included next_page meta', () => {
			dispatchReceiveMediaItems();

			expect( MediaListStore.hasNextPage( DUMMY_SITE_ID ) ).to.be.ok;
		} );

		test( 'should return true if the site is unknown', () => {
			expect( MediaListStore.hasNextPage( DUMMY_SITE_ID ) ).to.be.ok;
		} );

		test( 'should return false if the previous response did not include next_page meta', () => {
			dispatchReceiveMediaItems( { data: { media: [] } } );

			expect( MediaListStore.hasNextPage( DUMMY_SITE_ID ) ).to.not.be.ok;
		} );
	} );

	describe( '#isFetchingNextPage()', () => {
		test( 'should return false no request has been made', () => {
			expect( MediaListStore.isFetchingNextPage( DUMMY_SITE_ID ) ).to.not.be.ok;
		} );

		test( 'should return true if site media is being fetched', () => {
			dispatchFetchMedia();

			expect( MediaListStore.isFetchingNextPage( DUMMY_SITE_ID ) ).to.be.ok;
		} );

		test( 'should return false if site media was received', () => {
			dispatchFetchMedia();
			dispatchReceiveMediaItems();

			expect( MediaListStore.isFetchingNextPage( DUMMY_SITE_ID ) ).to.not.be.ok;
		} );

		test( 'should return false when the query was changed', () => {
			dispatchFetchMedia();
			dispatchSetQuery( { query: { mime_type: 'audio/' } } );

			expect( MediaListStore.isFetchingNextPage( DUMMY_SITE_ID ) ).to.not.be.ok;
		} );
	} );

	describe( '#isItemMatchingQuery', () => {
		let isItemMatchingQuery;

		beforeAll( function () {
			isItemMatchingQuery = MediaListStore.isItemMatchingQuery;
		} );

		test( 'should return true if no query exists for site', () => {
			const matches = isItemMatchingQuery( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT );

			expect( matches ).to.be.true;
		} );

		test( "should return false if a search query is specified, but the item doesn't match", () => {
			dispatchSetQuery( { query: { search: 'Notmyitem' } } );

			const matches = isItemMatchingQuery( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT );

			expect( matches ).to.be.false;
		} );

		test( 'should return true if a search query is specified, and the item matches', () => {
			dispatchSetQuery( { query: { search: 'Imag' } } );

			const matches = isItemMatchingQuery( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT );

			expect( matches ).to.be.true;
		} );

		test( 'should return true if a search query is specified, and the item matches case insensitive', () => {
			dispatchSetQuery( { query: { search: 'imag' } } );

			const matches = isItemMatchingQuery( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT );

			expect( matches ).to.be.true;
		} );

		test( 'should return false if a search query and mime_type are specified, and the item matches on title, but not mime_type', () => {
			dispatchSetQuery( { query: { search: 'Imag', mime_type: 'audio/' } } );

			const matches = isItemMatchingQuery( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT );

			expect( matches ).to.be.false;
		} );

		test( "should return false if a mime_type is specified, but the item doesn't match", () => {
			dispatchSetQuery( { query: { mime_type: 'audio/' } } );

			const matches = isItemMatchingQuery( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT );

			expect( matches ).to.be.false;
		} );

		test( 'should return true if a mime_type is specified, and the item matches', () => {
			dispatchSetQuery( { query: { mime_type: 'image/' } } );

			const matches = isItemMatchingQuery( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT );

			expect( matches ).to.be.true;
		} );

		test( 'should return true if item matches an external source but doesnt match title', () => {
			dispatchSetQuery( { query: { search: 'monkey', source: 'external' } } );

			const matches = isItemMatchingQuery( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT );

			expect( matches ).to.be.true;
		} );
	} );

	describe( '.dispatchToken', () => {
		test( 'should expose its dispatcher ID', () => {
			expect( MediaListStore.dispatchToken ).to.be.a( 'string' );
		} );

		test( 'should destroy existing media when a query changes', () => {
			dispatchReceiveMediaItems();
			dispatchSetQuery( { query: { mime_type: 'audio/' } } );

			expect( MediaListStore.getAll( DUMMY_SITE_ID ) ).to.be.undefined;
		} );

		test( 'should not destroy existing media if query change relates to pagination', () => {
			dispatchReceiveMediaItems();
			dispatchSetQuery( { query: { number: 40 } } );

			expect( MediaListStore.getAll( DUMMY_SITE_ID ) ).to.not.be.undefined;
		} );

		test( 'should emit a change event when receiving updates', ( done ) => {
			MediaListStore.once( 'change', done );

			dispatchReceiveMediaItems();
		} );

		test( 'should ignore received items where the query does not match', () => {
			dispatchFetchMedia();
			dispatchSetQuery( { query: { mime_type: 'audio/' } } );
			dispatchReceiveMediaItems( { query: MediaListStore.DEFAULT_QUERY } );

			expect( MediaListStore.getAll( DUMMY_SITE_ID ) ).to.be.undefined;
		} );

		test( 'should remove an item when REMOVE_MEDIA_ITEM is dispatched', () => {
			dispatchReceiveMediaItems();
			dispatchRemoveMediaItem();

			expect( MediaListStore.getAllIds( DUMMY_SITE_ID ) ).to.be.be.empty;
		} );

		test( 'should re-add an item when REMOVE_MEDIA_ITEM errors and includes data', () => {
			MediaListStore.ensureActiveQueryForSiteId( DUMMY_SITE_ID );
			dispatchRemoveMediaItem( { error: true } );

			expect( MediaListStore.getAllIds( DUMMY_SITE_ID ) ).to.not.be.empty;
		} );

		test( 'should replace an item when RECEIVE_MEDIA_ITEM includes ID', () => {
			const newItem = assign( {}, DUMMY_MEDIA_OBJECT, { ID: DUMMY_MEDIA_ID + 1 } );

			MediaStore.get.restore();
			sandbox.stub( MediaStore, 'get' ).callsFake( function ( siteId, postId ) {
				if ( siteId !== DUMMY_SITE_ID ) {
					return;
				}

				if ( postId === newItem.ID ) {
					return newItem;
				}

				if ( postId === DUMMY_MEDIA_ID ) {
					return DUMMY_MEDIA_OBJECT;
				}
			} );

			dispatchFetchMedia();
			dispatchReceiveMediaItem();
			dispatchReceiveMediaItem( { id: DUMMY_MEDIA_ID, data: newItem } );

			const allItems = MediaListStore.getAllIds( DUMMY_SITE_ID );
			expect( allItems ).to.not.contain( DUMMY_MEDIA_ID );
			expect( allItems ).to.contain( newItem.ID );
		} );
	} );
} );
