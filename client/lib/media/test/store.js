/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

jest.mock( 'lib/user', () => () => {} );

const DUMMY_SITE_ID = 1,
	DUMMY_MEDIA_ID = 10,
	DUMMY_MEDIA_OBJECT = { ID: DUMMY_MEDIA_ID, title: 'Image' },
	DUMMY_MEDIA_RESPONSE = {
		media: [ DUMMY_MEDIA_OBJECT ],
		meta: { next_page: 'value%3D2015-03-04T14%253A38%253A21%252B00%253A00%26id%3D2135' },
	};

describe( 'MediaStore', () => {
	let Dispatcher, sandbox, MediaStore, handler;

	beforeAll( function () {
		Dispatcher = require( 'dispatcher' );

		sandbox = sinon.createSandbox();
		sandbox.spy( Dispatcher, 'register' );
		sandbox.stub( Dispatcher, 'waitFor' ).returns( true );

		MediaStore = require( '../store' );
		handler = Dispatcher.register.lastCall.args[ 0 ];
	} );

	beforeEach( () => {
		MediaStore._media = {};
		MediaStore._pointers = {};
	} );

	afterAll( function () {
		sandbox.restore();
	} );

	function dispatchReceiveMediaItems() {
		handler( {
			action: {
				type: 'RECEIVE_MEDIA_ITEMS',
				siteId: DUMMY_SITE_ID,
				data: DUMMY_MEDIA_RESPONSE,
			},
		} );
	}

	function dispatchReceiveMediaItem( id, data ) {
		handler( {
			action: {
				type: 'RECEIVE_MEDIA_ITEM',
				siteId: DUMMY_SITE_ID,
				id: id,
				data: data || DUMMY_MEDIA_OBJECT,
			},
		} );
	}

	function dispatchRemoveMediaItem( error ) {
		handler( {
			action: {
				error: error,
				type: 'REMOVE_MEDIA_ITEM',
				siteId: DUMMY_SITE_ID,
				data: DUMMY_MEDIA_OBJECT,
			},
		} );
	}

	describe( '#get()', () => {
		test( 'should return a single value', () => {
			dispatchReceiveMediaItems();

			expect( MediaStore.get( DUMMY_SITE_ID, DUMMY_MEDIA_ID ) ).to.equal( DUMMY_MEDIA_OBJECT );
		} );

		test( 'should return undefined for an item that does not exist', () => {
			expect( MediaStore.get( DUMMY_SITE_ID, DUMMY_MEDIA_ID + 1 ) ).to.be.undefined;
		} );

		test( 'should resolve a pointer to another image item', () => {
			MediaStore._media = {
				[ DUMMY_SITE_ID ]: {
					[ DUMMY_MEDIA_ID ]: DUMMY_MEDIA_OBJECT,
				},
			};
			MediaStore._pointers = {
				[ DUMMY_SITE_ID ]: {
					[ DUMMY_MEDIA_ID + 1 ]: DUMMY_MEDIA_ID,
				},
			};

			expect( MediaStore.get( DUMMY_SITE_ID, DUMMY_MEDIA_ID + 1 ) ).to.equal( DUMMY_MEDIA_OBJECT );
		} );
	} );

	describe( '#getAll()', () => {
		test( 'should return all received media', () => {
			dispatchReceiveMediaItems();

			expect( MediaStore.getAll( DUMMY_SITE_ID ) ).to.eql( DUMMY_MEDIA_RESPONSE.media );
		} );

		test( 'should return undefined for an unknown site', () => {
			expect( MediaStore.getAll( DUMMY_SITE_ID ) ).to.be.undefined;
		} );
	} );

	describe( '.dispatchToken', () => {
		test( 'should expose its dispatcher ID', () => {
			expect( MediaStore.dispatchToken ).to.be.a( 'string' );
		} );

		test( 'should emit a change event when receiving updates', ( done ) => {
			MediaStore.once( 'change', done );

			dispatchReceiveMediaItems();
		} );

		test( 'should blank an item when REMOVE_MEDIA_ITEM is dispatched', () => {
			dispatchReceiveMediaItems();
			dispatchRemoveMediaItem();

			expect( MediaStore.get( DUMMY_SITE_ID, DUMMY_MEDIA_ID ) ).to.not.have.any.keys(
				'guid',
				'url'
			);
		} );

		test( 'should re-add an item when REMOVE_MEDIA_ITEM errors and includes data', () => {
			dispatchRemoveMediaItem( true );

			expect( MediaStore.get( DUMMY_SITE_ID, DUMMY_MEDIA_ID ) ).to.not.be.undefined;
		} );

		test( 'should replace an item when RECEIVE_MEDIA_ITEM includes ID', () => {
			const newItem = {
				ID: DUMMY_MEDIA_ID + 1,
				ok: true,
			};

			dispatchReceiveMediaItem();
			dispatchReceiveMediaItem( DUMMY_MEDIA_ID, newItem );

			expect( MediaStore.get( DUMMY_SITE_ID, DUMMY_MEDIA_ID ) ).to.eql( newItem );
			expect( MediaStore.get( DUMMY_SITE_ID, newItem.ID ) ).to.eql( newItem );
		} );

		test( 'should create an item stub when FETCH_MEDIA_ITEM called', () => {
			handler( {
				action: {
					type: 'FETCH_MEDIA_ITEM',
					siteId: DUMMY_SITE_ID,
					id: DUMMY_MEDIA_ID,
				},
			} );

			expect( MediaStore.get( DUMMY_SITE_ID, DUMMY_MEDIA_ID ) ).to.eql( {
				ID: DUMMY_MEDIA_ID,
			} );
		} );

		test( 'should clear all pointers when CHANGE_MEDIA_SOURCE called', () => {
			MediaStore._pointers = {
				[ DUMMY_SITE_ID ]: {
					[ DUMMY_MEDIA_ID + 1 ]: DUMMY_MEDIA_ID,
				},
			};

			handler( {
				action: {
					type: 'CHANGE_MEDIA_SOURCE',
					siteId: DUMMY_SITE_ID,
				},
			} );

			expect( MediaStore._pointers[ DUMMY_SITE_ID ] ).to.eql( {} );
		} );
	} );
} );
