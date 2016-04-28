/**
 * External dependencies
 */
import { expect } from 'chai';
import assign from 'lodash/assign';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import Dispatcher from 'dispatcher';

var DUMMY_SITE_ID = 1,
	DUMMY_OBJECTS = {
		100: { ID: 100, title: 'Image' },
		'media-1': { ID: 100, title: 'Image' },
		200: { ID: 200, title: 'Video' }
	},
	DUMMY_MEDIA_OBJECT = DUMMY_OBJECTS[ 100 ],
	DUMMY_TRANSIENT_MEDIA_OBJECT = DUMMY_OBJECTS[ 'media-1' ];

describe( 'MediaLibrarySelectedStore', function() {
	let sandbox, MediaLibrarySelectedStore, handler, MediaStore;

	useFakeDom();

	before( function() {
		MediaStore = require( '../store' );

		sandbox = sinon.sandbox.create();
		sandbox.spy( Dispatcher, 'register' );
		sandbox.stub( Dispatcher, 'waitFor' ).returns( true );
		sandbox.stub( MediaStore, 'get', function( siteId, itemId ) {
			if ( siteId === DUMMY_SITE_ID ) {
				return DUMMY_OBJECTS[ itemId ];
			}
		} );
		MediaLibrarySelectedStore = require( '../library-selected-store' );
		handler = Dispatcher.register.lastCall.args[ 0 ];
	} );

	beforeEach( function() {
		MediaLibrarySelectedStore._media = {};
	} );

	after( function() {
		sandbox.restore();
	} );

	function dispatchSetLibrarySelectedItems( action ) {
		handler( {
			action: assign( {
				type: 'SET_MEDIA_LIBRARY_SELECTED_ITEMS',
				siteId: DUMMY_SITE_ID,
				data: [ DUMMY_TRANSIENT_MEDIA_OBJECT ]
			}, action )
		} );
	}

	function dispatchReceiveMediaItem() {
		handler( {
			action: {
				type: 'RECEIVE_MEDIA_ITEM',
				siteId: DUMMY_SITE_ID,
				data: DUMMY_MEDIA_OBJECT,
				id: DUMMY_TRANSIENT_MEDIA_OBJECT.ID
			}
		} );
	}

	function dispatchRemoveMediaItem( error ) {
		handler( {
			action: {
				error: error,
				type: 'REMOVE_MEDIA_ITEM',
				siteId: DUMMY_SITE_ID,
				data: DUMMY_TRANSIENT_MEDIA_OBJECT
			}
		} );
	}

	describe( '#get()', function() {
		it( 'should return a single value', function() {
			dispatchSetLibrarySelectedItems();

			expect( MediaLibrarySelectedStore.get( DUMMY_SITE_ID, DUMMY_TRANSIENT_MEDIA_OBJECT.ID ) ).to.eql( DUMMY_TRANSIENT_MEDIA_OBJECT );
		} );

		it( 'should return undefined for an item that does not exist', function() {
			expect( MediaLibrarySelectedStore.get( DUMMY_SITE_ID, DUMMY_TRANSIENT_MEDIA_OBJECT.ID + 1 ) ).to.be.undefined;
		} );
	} );

	describe( '#getAll()', function() {
		it( 'should return all selected media', function() {
			dispatchSetLibrarySelectedItems();

			expect( MediaLibrarySelectedStore.getAll( DUMMY_SITE_ID ) ).to.eql( [ DUMMY_TRANSIENT_MEDIA_OBJECT ] );
		} );

		it( 'should return an empty array for a site with no selected items', function() {
			expect( MediaLibrarySelectedStore.getAll( DUMMY_SITE_ID ) ).to.eql( [] );
		} );
	} );

	describe( '.dispatchToken', function() {
		it( 'should expose its dispatcher ID', function() {
			expect( MediaLibrarySelectedStore.dispatchToken ).to.not.be.undefined;
		} );

		it( 'should emit a change event when library items have been set', function( done ) {
			MediaLibrarySelectedStore.once( 'change', done );

			dispatchSetLibrarySelectedItems();
		} );

		it( 'should emit a change event when receiving updates', function( done ) {
			MediaLibrarySelectedStore.once( 'change', done );

			dispatchReceiveMediaItem();
		} );

		it( 'should replace an item when its ID has changed', function() {
			dispatchSetLibrarySelectedItems();
			dispatchReceiveMediaItem();

			expect( MediaLibrarySelectedStore.getAll( DUMMY_SITE_ID ) ).to.eql( [ DUMMY_MEDIA_OBJECT ] );
		} );

		it( 'should remove an item when REMOVE_MEDIA_ITEM is dispatched', function() {
			dispatchSetLibrarySelectedItems();
			dispatchRemoveMediaItem();

			expect( MediaLibrarySelectedStore._media[ DUMMY_SITE_ID ] ).to.be.empty;
		} );
	} );
} );
