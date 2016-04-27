/**
 * External dependencies
 */
import { expect } from 'chai';
import assign from 'lodash/assign';
import find from 'lodash/find';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

var DUMMY_SITE_ID = 1,
	DUMMY_MEDIA_ID = 10,
	DUMMY_MEDIA_OBJECT = { ID: DUMMY_MEDIA_ID, title: 'Image', date: '2015-06-19T09:36:09-04:00', mime_type: 'image/png' },
	DUMMY_MEDIA_RESPONSE = {
		media: [ DUMMY_MEDIA_OBJECT ],
		meta: { next_page: 'value%3D2015-03-04T14%253A38%253A21%252B00%253A00%26id%3D2135' }
	};

describe( 'MediaListStore', function() {
	let Dispatcher, sandbox, MediaListStore, handler, MediaStore;

	useFakeDom();
	useMockery();

	before( function() {
		MediaStore = require( '../store' );
		Dispatcher = require( 'dispatcher' );

		sandbox = sinon.sandbox.create();
		sandbox.spy( Dispatcher, 'register' );
		sandbox.stub( Dispatcher, 'waitFor' ).returns( true );
		sandbox.stub( MediaStore, 'get', function( siteId, postId ) {
			if ( DUMMY_MEDIA_OBJECT.ID === postId ) {
				return DUMMY_MEDIA_OBJECT;
			}
		} );

		MediaListStore = require( '../list-store' );
		handler = Dispatcher.register.lastCall.args[ 0 ];
	} );

	beforeEach( function() {
		MediaListStore._media = {};
		MediaListStore._activeQueries = {};
	} );

	after( function() {
		sandbox.restore();
	} );

	function dispatchSetQuery( action ) {
		handler( {
			action: assign( {
				type: 'SET_MEDIA_QUERY',
				siteId: DUMMY_SITE_ID
			}, action )
		} );
	}

	function dispatchFetchMedia( action ) {
		handler( {
			action: assign( {
				type: 'FETCH_MEDIA_ITEMS',
				siteId: DUMMY_SITE_ID
			}, action )
		} );
	}

	function dispatchReceiveMediaItems( action ) {
		handler( {
			action: assign( {
				type: 'RECEIVE_MEDIA_ITEMS',
				siteId: DUMMY_SITE_ID,
				data: DUMMY_MEDIA_RESPONSE,
				query: MediaListStore.getNextPageQuery( action && action.siteId ? action.siteId : DUMMY_SITE_ID )
			}, action )
		} );
	}

	function dispatchReceiveMediaItem( action ) {
		handler( {
			action: assign( {
				type: 'RECEIVE_MEDIA_ITEM',
				siteId: DUMMY_SITE_ID,
				data: DUMMY_MEDIA_OBJECT
			}, action )
		} );
	}

	function dispatchRemoveMediaItem( action ) {
		handler( {
			action: assign( {
				type: 'REMOVE_MEDIA_ITEM',
				siteId: DUMMY_SITE_ID,
				data: DUMMY_MEDIA_OBJECT
			}, action )
		} );
	}

	describe( '#get()', function() {
		it( 'should return a single value', function() {
			dispatchReceiveMediaItems();

			expect( MediaListStore.get( DUMMY_SITE_ID, DUMMY_MEDIA_ID ) ).to.equal( DUMMY_MEDIA_OBJECT );
		} );

		it( 'should return undefined for an item that does not exist', function() {
			expect( MediaListStore.get( DUMMY_SITE_ID, DUMMY_MEDIA_ID + 1 ) ).to.be.undefined;
		} );
	} );

	describe( '#getAll()', function() {
		it( 'should return all received media', function() {
			dispatchReceiveMediaItems();

			expect( MediaListStore.getAll( DUMMY_SITE_ID ) ).to.eql( DUMMY_MEDIA_RESPONSE.media );
		} );

		it( 'should sort media by date, with newest first', function() {
			var media = [
				DUMMY_MEDIA_OBJECT,
				assign( {}, DUMMY_MEDIA_OBJECT, { ID: 20, date: '2015-06-19T11:36:09-04:00' } )
			];

			MediaStore.get.restore();
			sandbox.stub( MediaStore, 'get', function( siteId, postId ) {
				return find( media, { ID: postId } );
			} );

			dispatchReceiveMediaItems( { data: { media: media } } );

			expect( MediaListStore.getAllIds( DUMMY_SITE_ID ) ).to.eql( [ 20, 10 ] );
		} );

		it( 'should secondary sort media by ID, with larger first', function() {
			var media = [
				DUMMY_MEDIA_OBJECT,
				assign( {}, DUMMY_MEDIA_OBJECT, { ID: 20, date: DUMMY_MEDIA_OBJECT.date } )
			];

			MediaStore.get.restore();
			sandbox.stub( MediaStore, 'get', function( siteId, postId ) {
				return find( media, { ID: postId } );
			} );

			dispatchReceiveMediaItems( { data: { media: media } } );

			expect( MediaListStore.getAllIds( DUMMY_SITE_ID ) ).to.eql( [ 20, 10 ] );
		} );

		it( 'should return undefined for a fetching site', function() {
			dispatchFetchMedia();

			expect( MediaListStore.getAll( DUMMY_SITE_ID ) ).to.be.undefined;
		} );

		it( 'should return an empty array for a site with no media', function() {
			dispatchReceiveMediaItems( { data: { media: [] } } );

			expect( MediaListStore.getAll( DUMMY_SITE_ID ) ).to.eql( [] );
		} );
	} );

	describe( '#getNextPageQuery()', function() {
		it( 'should include default parameters if no query provided', function() {
			expect( MediaListStore.getNextPageQuery( DUMMY_SITE_ID ) ).to.eql( MediaListStore.DEFAULT_QUERY );
		} );

		it( 'should include page_handle if the previous response included next_page meta', function() {
			dispatchReceiveMediaItems();

			expect( MediaListStore.getNextPageQuery( DUMMY_SITE_ID ) ).to.eql( {
				number: MediaListStore.DEFAULT_QUERY.number,
				page_handle: DUMMY_MEDIA_RESPONSE.meta.next_page
			} );
		} );

		it( 'should preserve the query from the previous request', function() {
			var query = { mime_type: 'audio/' };
			dispatchSetQuery( { query: query } );
			dispatchFetchMedia();
			dispatchReceiveMediaItems();

			expect( MediaListStore.getNextPageQuery( DUMMY_SITE_ID ) ).to.eql( assign( {
				number: MediaListStore.DEFAULT_QUERY.number,
				page_handle: DUMMY_MEDIA_RESPONSE.meta.next_page
			}, query ) );
		} );

		it( 'should reset the page handle when the query changes', function() {
			var query = { mime_type: 'audio/' };
			dispatchReceiveMediaItems();
			dispatchSetQuery( { query: query } );

			expect( MediaListStore.getNextPageQuery( DUMMY_SITE_ID ) ).to.eql( assign( {}, query, {
				number: MediaListStore.DEFAULT_QUERY.number,
				page_handle: undefined
			} ) );
		} );
	} );

	describe( '#hasNextPage()', function() {
		it( 'should return true if the previous response included next_page meta', function() {
			dispatchReceiveMediaItems();

			expect( MediaListStore.hasNextPage( DUMMY_SITE_ID ) ).to.be.ok;
		} );

		it( 'should return true if the site is unknown', function() {
			expect( MediaListStore.hasNextPage( DUMMY_SITE_ID ) ).to.be.ok;
		} );

		it( 'should return false if the previous response did not include next_page meta', function() {
			dispatchReceiveMediaItems( { data: { media: [] } } );

			expect( MediaListStore.hasNextPage( DUMMY_SITE_ID ) ).to.not.be.ok;
		} );
	} );

	describe( '#isFetchingNextPage()', function() {
		it( 'should return false no request has been made', function() {
			expect( MediaListStore.isFetchingNextPage( DUMMY_SITE_ID ) ).to.not.be.ok;
		} );

		it( 'should return true if site media is being fetched', function() {
			dispatchFetchMedia();

			expect( MediaListStore.isFetchingNextPage( DUMMY_SITE_ID ) ).to.be.ok;
		} );

		it( 'should return false if site media was received', function() {
			dispatchFetchMedia();
			dispatchReceiveMediaItems();

			expect( MediaListStore.isFetchingNextPage( DUMMY_SITE_ID ) ).to.not.be.ok;
		} );

		it( 'should return false when the query was changed', function() {
			dispatchFetchMedia();
			dispatchSetQuery( { query: { mime_type: 'audio/' } } );

			expect( MediaListStore.isFetchingNextPage( DUMMY_SITE_ID ) ).to.not.be.ok;
		} );
	} );

	describe( '#isItemMatchingQuery', function() {
		var isItemMatchingQuery;

		before( function() {
			isItemMatchingQuery = MediaListStore.isItemMatchingQuery;
		} );

		it( 'should return true if no query exists for site', function() {
			var matches = isItemMatchingQuery( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT );

			expect( matches ).to.be.true;
		} );

		it( 'should return false if a search query is specified, but the item doesn\'t match', function() {
			var matches;
			dispatchSetQuery( { query: { search: 'Notmyitem' } } );

			matches = isItemMatchingQuery( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT );

			expect( matches ).to.be.false;
		} );

		it( 'should return true if a search query is specified, and the item matches', function() {
			var matches;
			dispatchSetQuery( { query: { search: 'Imag' } } );

			matches = isItemMatchingQuery( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT );

			expect( matches ).to.be.true;
		} );

		it( 'should return true if a search query is specified, and the item matches case insensitive', function() {
			var matches;
			dispatchSetQuery( { query: { search: 'imag' } } );

			matches = isItemMatchingQuery( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT );

			expect( matches ).to.be.true;
		} );

		it( 'should return false if a search query and mime_type are specified, and the item matches on title, but not mime_type', function() {
			var matches;
			dispatchSetQuery( { query: { search: 'Imag', mime_type: 'audio/' } } );

			matches = isItemMatchingQuery( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT );

			expect( matches ).to.be.false;
		} );

		it( 'should return false if a mime_type is specified, but the item doesn\'t match', function() {
			var matches;
			dispatchSetQuery( { query: { mime_type: 'audio/' } } );

			matches = isItemMatchingQuery( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT );

			expect( matches ).to.be.false;
		} );

		it( 'should return true if a mime_type is specified, and the item matches', function() {
			var matches;
			dispatchSetQuery( { query: { mime_type: 'image/' } } );

			matches = isItemMatchingQuery( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT );

			expect( matches ).to.be.true;
		} );
	} );

	describe( '.dispatchToken', function() {
		it( 'should expose its dispatcher ID', function() {
			expect( MediaListStore.dispatchToken ).to.be.a( 'string' );
		} );

		it( 'should destroy existing media when a query changes', function() {
			dispatchReceiveMediaItems();
			dispatchSetQuery( { query: { mime_type: 'audio/' } } );

			expect( MediaListStore.getAll( DUMMY_SITE_ID ) ).to.be.undefined;
		} );

		it( 'should not destroy existing media if query change relates to pagination', function() {
			dispatchReceiveMediaItems();
			dispatchSetQuery( { query: { number: 40 } } );

			expect( MediaListStore.getAll( DUMMY_SITE_ID ) ).to.not.be.undefined;
		} );

		it( 'should emit a change event when receiving updates', function( done ) {
			MediaListStore.once( 'change', done );

			dispatchReceiveMediaItems();
		} );

		it( 'should ignore received items where the query does not match', function() {
			dispatchFetchMedia();
			dispatchSetQuery( { query: { mime_type: 'audio/' } } );
			dispatchReceiveMediaItems( { query: MediaListStore.DEFAULT_QUERY } );

			expect( MediaListStore.getAll( DUMMY_SITE_ID ) ).to.be.undefined;
		} );

		it( 'should remove an item when REMOVE_MEDIA_ITEM is dispatched', function() {
			dispatchReceiveMediaItems();
			dispatchRemoveMediaItem();

			expect( MediaListStore.getAllIds( DUMMY_SITE_ID ) ).to.be.be.empty;
		} );

		it( 'should re-add an item when REMOVE_MEDIA_ITEM errors and includes data', function() {
			MediaListStore.ensureActiveQueryForSiteId( DUMMY_SITE_ID );
			dispatchRemoveMediaItem( { error: true } );

			expect( MediaListStore.getAllIds( DUMMY_SITE_ID ) ).to.not.be.empty;
		} );

		it( 'should replace an item when RECEIVE_MEDIA_ITEM includes ID', function() {
			var newItem = assign( {}, DUMMY_MEDIA_OBJECT, { ID: DUMMY_MEDIA_ID + 1 } ),
				allItems;

			MediaStore.get.restore();
			sandbox.stub( MediaStore, 'get', function( siteId, postId ) {
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

			allItems = MediaListStore.getAllIds( DUMMY_SITE_ID );
			expect( allItems ).to.not.contain( DUMMY_MEDIA_ID );
			expect( allItems ).to.contain( newItem.ID );
		} );
	} );
} );
