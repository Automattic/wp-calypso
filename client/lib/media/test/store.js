/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

var DUMMY_SITE_ID = 1,
	DUMMY_MEDIA_ID = 10,
	DUMMY_MEDIA_OBJECT = { ID: DUMMY_MEDIA_ID, title: 'Image' },
	DUMMY_MEDIA_RESPONSE = {
		media: [ DUMMY_MEDIA_OBJECT ],
		meta: { next_page: 'value%3D2015-03-04T14%253A38%253A21%252B00%253A00%26id%3D2135' }
	};

describe( 'MediaStore', function() {
	let Dispatcher, sandbox, MediaStore, handler;

	useFakeDom();
	useMockery();

	before( function() {
		Dispatcher = require( 'dispatcher' );

		sandbox = sinon.sandbox.create();
		sandbox.spy( Dispatcher, 'register' );
		sandbox.stub( Dispatcher, 'waitFor' ).returns( true );

		MediaStore = require( '../store' );
		handler = Dispatcher.register.lastCall.args[ 0 ];
	} );

	beforeEach( function() {
		MediaStore._media = {};
		MediaStore._pointers = {};
	} );

	after( function() {
		sandbox.restore();
	} );

	function dispatchReceiveMediaItems() {
		handler( {
			action: {
				type: 'RECEIVE_MEDIA_ITEMS',
				siteId: DUMMY_SITE_ID,
				data: DUMMY_MEDIA_RESPONSE
			}
		} );
	}

	function dispatchReceiveMediaItem( id, data ) {
		handler( {
			action: {
				type: 'RECEIVE_MEDIA_ITEM',
				siteId: DUMMY_SITE_ID,
				id: id,
				data: data || DUMMY_MEDIA_OBJECT
			}
		} );
	}

	function dispatchRemoveMediaItem( error ) {
		handler( {
			action: {
				error: error,
				type: 'REMOVE_MEDIA_ITEM',
				siteId: DUMMY_SITE_ID,
				data: DUMMY_MEDIA_OBJECT
			}
		} );
	}

	describe( '#get()', function() {
		it( 'should return a single value', function() {
			dispatchReceiveMediaItems();

			expect( MediaStore.get( DUMMY_SITE_ID, DUMMY_MEDIA_ID ) ).to.equal( DUMMY_MEDIA_OBJECT );
		} );

		it( 'should return undefined for an item that does not exist', function() {
			expect( MediaStore.get( DUMMY_SITE_ID, DUMMY_MEDIA_ID + 1 ) ).to.be.undefined;
		} );

		it( 'should resolve a pointer to another image item', function() {
			MediaStore._media = {
				[ DUMMY_SITE_ID ]: {
					[ DUMMY_MEDIA_ID ]: DUMMY_MEDIA_OBJECT
				}
			};
			MediaStore._pointers = {
				[ DUMMY_SITE_ID ]: {
					[ DUMMY_MEDIA_ID + 1 ]: DUMMY_MEDIA_ID
				}
			};

			expect( MediaStore.get( DUMMY_SITE_ID, DUMMY_MEDIA_ID + 1 ) ).to.equal( DUMMY_MEDIA_OBJECT );
		} );
	} );

	describe( '#getAll()', function() {
		it( 'should return all received media', function() {
			dispatchReceiveMediaItems();

			expect( MediaStore.getAll( DUMMY_SITE_ID ) ).to.eql( DUMMY_MEDIA_RESPONSE.media );
		} );

		it( 'should return undefined for an unknown site', function() {
			expect( MediaStore.getAll( DUMMY_SITE_ID ) ).to.be.undefined;
		} );
	} );

	describe( '.dispatchToken', function() {
		it( 'should expose its dispatcher ID', function() {
			expect( MediaStore.dispatchToken ).to.be.a( 'string' );
		} );

		it( 'should emit a change event when receiving updates', function( done ) {
			MediaStore.once( 'change', done );

			dispatchReceiveMediaItems();
		} );

		it( 'should remove an item when REMOVE_MEDIA_ITEM is dispatched', function() {
			dispatchReceiveMediaItems();
			dispatchRemoveMediaItem();

			expect( MediaStore.get( DUMMY_SITE_ID, DUMMY_MEDIA_ID ) ).to.be.undefined;
		} );

		it( 'should re-add an item when REMOVE_MEDIA_ITEM errors and includes data', function() {
			dispatchRemoveMediaItem( true );

			expect( MediaStore.get( DUMMY_SITE_ID, DUMMY_MEDIA_ID ) ).to.not.be.undefined;
		} );

		it( 'should replace an item when RECEIVE_MEDIA_ITEM includes ID', function() {
			var newItem = {
				ID: DUMMY_MEDIA_ID + 1,
				ok: true
			};

			dispatchReceiveMediaItem();
			dispatchReceiveMediaItem( DUMMY_MEDIA_ID, newItem );

			expect( MediaStore.get( DUMMY_SITE_ID, DUMMY_MEDIA_ID ) ).to.eql( newItem );
			expect( MediaStore.get( DUMMY_SITE_ID, newItem.ID ) ).to.eql( newItem );
		} );

		it( 'should create an item stub when FETCH_MEDIA_ITEM called', function() {
			handler( {
				action: {
					type: 'FETCH_MEDIA_ITEM',
					siteId: DUMMY_SITE_ID,
					id: DUMMY_MEDIA_ID
				}
			} );

			expect( MediaStore.get( DUMMY_SITE_ID, DUMMY_MEDIA_ID ) ).to.eql( {
				ID: DUMMY_MEDIA_ID
			} );
		} );
	} );
} );
