/** @jest-environment jsdom */
jest.mock( 'lib/media/library-selected-store', () => ( {
	getAll: () => [ require( './fixtures' ).DUMMY_ITEM ]
} ) );
jest.mock( 'lib/media/store', () => ( {
	dispatchToken: require( 'dispatcher' ).register( () => {} ),
	get: () => require( './fixtures' ).DUMMY_ITEM,
} ) );
jest.mock( 'lib/user', () => () => {} );
jest.mock( 'lib/wp', () => require( './mocks/lib/wp' ) );
jest.mock( 'lib/impure-lodash', () => ( {
	isPlainObject: obj => {
		// In the browser, our DUMMY_UPLOAD will be an instanceof
		// window.File, but File is not provided by jsdom
		if ( obj === require( './fixtures' ).DUMMY_UPLOAD ) {
			return false;
		}

		return require.requireActual( 'lodash' ).isPlainObject( obj );
	},
	uniqueId: () => 'media-1',
} ) );

/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';
import { assign } from 'lodash';

/**
 * Internal dependencies
 */
import {
	DUMMY_API_RESPONSE,
	DUMMY_BLOB_UPLOAD,
	DUMMY_ITEM,
	DUMMY_QUERY,
	DUMMY_SITE_ID,
	DUMMY_UPLOAD,
	DUMMY_URL
} from './fixtures';
import {
	stubs
} from './mocks/lib/wp';

describe( 'MediaActions', function() {
	let MediaActions, sandbox, Dispatcher, PostEditStore, MediaListStore;

	before( function() {
		Dispatcher = require( 'dispatcher' );
		PostEditStore = require( 'lib/posts/post-edit-store' );
		MediaListStore = require( '../list-store' );

		MediaActions = require( '../actions' );
	} );

	beforeEach( function() {
		sandbox = sinon.sandbox.create();
		sandbox.stub( Dispatcher, 'handleServerAction' );
		sandbox.stub( Dispatcher, 'handleViewAction' );
		sandbox.stub( stubs, 'mediaGet' ).callsArgWithAsync( 0, null, DUMMY_API_RESPONSE );
		sandbox.stub( stubs, 'mediaList' ).callsArgWithAsync( 1, null, DUMMY_API_RESPONSE );
		sandbox.stub( stubs, 'mediaListExternal' ).callsArgWithAsync( 1, null, DUMMY_API_RESPONSE );
		sandbox.stub( stubs, 'mediaAdd' ).returns( Promise.resolve( DUMMY_API_RESPONSE ) );
		sandbox.stub( stubs, 'mediaAddExternal' ).returns( Promise.resolve( DUMMY_API_RESPONSE ) );
		sandbox.stub( stubs, 'mediaAddUrls' ).returns( Promise.resolve( DUMMY_API_RESPONSE ) );
		sandbox.stub( stubs, 'mediaUpdate' ).callsArgWithAsync( 1, null, DUMMY_API_RESPONSE );
		sandbox.stub( stubs, 'mediaDelete' ).callsArgWithAsync( 0, null, DUMMY_API_RESPONSE );
		MediaActions._fetching = {};
		window.FileList = function() {};
		window.URL = { createObjectURL: sandbox.stub() };
	} );

	afterEach( function() {
		sandbox.restore();
		delete window.FileList;
		delete window.URL;
	} );

	describe( '#setQuery()', function() {
		it( 'should dispatch the SET_MEDIA_QUERY action', function() {
			MediaActions.setQuery( DUMMY_SITE_ID, DUMMY_QUERY );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'SET_MEDIA_QUERY',
				siteId: DUMMY_SITE_ID,
				query: DUMMY_QUERY
			} );
		} );
	} );

	describe( '#fetch()', function() {
		it( 'should call to the WordPress.com REST API', function( done ) {
			Dispatcher.handleViewAction.restore();
			sandbox.stub( Dispatcher, 'handleViewAction', function() {
				expect( MediaActions._fetching ).to.have.all.keys( [ [ DUMMY_SITE_ID, DUMMY_ITEM.ID ].join() ] );
			} );

			MediaActions.fetch( DUMMY_SITE_ID, DUMMY_ITEM.ID );

			expect( Dispatcher.handleViewAction ).to.have.been.calledOnce;
			expect( stubs.mediaGet ).to.have.been.calledOn( [ DUMMY_SITE_ID, DUMMY_ITEM.ID ].join() );
			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: 'RECEIVE_MEDIA_ITEM',
					error: null,
					siteId: DUMMY_SITE_ID,
					data: DUMMY_API_RESPONSE
				} );

				done();
			} );
		} );

		it( 'should not allow simultaneous request for the same item', function() {
			MediaActions.fetch( DUMMY_SITE_ID, DUMMY_ITEM.ID );
			MediaActions.fetch( DUMMY_SITE_ID, DUMMY_ITEM.ID );

			expect( stubs.mediaGet ).to.have.been.calledOnce;
		} );

		it( 'should allow simultaneous request for different items', function() {
			MediaActions.fetch( DUMMY_SITE_ID, DUMMY_ITEM.ID );
			MediaActions.fetch( DUMMY_SITE_ID, DUMMY_ITEM.ID + 1 );

			expect( stubs.mediaGet ).to.have.been.calledTwice;
		} );
	} );

	describe( '#fetchNextPage()', function() {
		it( 'should call to the internal WordPress.com REST API', function( done ) {
			const query = MediaListStore.getNextPageQuery( DUMMY_SITE_ID );

			MediaActions.fetchNextPage( DUMMY_SITE_ID );

			expect( stubs.mediaList ).to.have.been.calledOn( DUMMY_SITE_ID );
			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: 'RECEIVE_MEDIA_ITEMS',
					error: null,
					siteId: DUMMY_SITE_ID,
					data: DUMMY_API_RESPONSE,
					query: query
				} );

				done();
			} );
		} );

		it( 'should call to the external WordPress.com REST API', function( done ) {
			MediaListStore._activeQueries[ DUMMY_SITE_ID ] = { query: { source: 'external' } };

			const query = MediaListStore.getNextPageQuery( DUMMY_SITE_ID );

			MediaActions.fetchNextPage( DUMMY_SITE_ID );

			expect( stubs.mediaListExternal ).to.have.been.calledWithMatch( { source: 'external' } );

			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: 'RECEIVE_MEDIA_ITEMS',
					error: null,
					siteId: DUMMY_SITE_ID,
					data: DUMMY_API_RESPONSE,
					query: query
				} );

				done();
			} );
		} );
	} );

	describe( '#add()', function() {
		it( 'should accept a single upload', function() {
			return MediaActions.add( DUMMY_SITE_ID, DUMMY_UPLOAD ).then( () => {
				expect( Dispatcher.handleViewAction ).to.have.been.calledOnce;
				expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
					type: 'CREATE_MEDIA_ITEM'
				} );
			} );
		} );

		it( 'should accept an array of uploads', function() {
			return MediaActions.add( DUMMY_SITE_ID, [ DUMMY_UPLOAD, DUMMY_UPLOAD ] ).then( () => {
				expect( Dispatcher.handleViewAction ).to.have.been.calledTwice;
				expect( Dispatcher.handleViewAction ).to.have.always.been.calledWithMatch( {
					type: 'CREATE_MEDIA_ITEM'
				} );
			} );
		} );

		it( 'should accept a file URL', function() {
			return MediaActions.add( DUMMY_SITE_ID, DUMMY_URL ).then( () => {
				expect( stubs.mediaAddUrls ).to.have.been.calledWithMatch( {}, DUMMY_URL );
			} );
		} );

		it( 'should accept a FileList of uploads', function() {
			const uploads = [ DUMMY_UPLOAD, DUMMY_UPLOAD ];
			uploads.__proto__ = new window.FileList(); // eslint-disable-line no-proto
			return MediaActions.add( DUMMY_SITE_ID, uploads ).then( () => {
				expect( Dispatcher.handleViewAction ).to.have.been.calledTwice;
				expect( Dispatcher.handleViewAction ).to.have.always.been.calledWithMatch( {
					type: 'CREATE_MEDIA_ITEM'
				} );
			} );
		} );

		it( 'should accept a Blob object wrapper and pass it as "file" parameter', function() {
			return MediaActions.add( DUMMY_SITE_ID, DUMMY_BLOB_UPLOAD ).then( () => {
				expect( stubs.mediaAdd ).to.have.been.calledWithMatch( {}, { file: DUMMY_BLOB_UPLOAD } );
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: 'RECEIVE_MEDIA_ITEM',
					siteId: DUMMY_SITE_ID,
					id: 'media-1',
					data: DUMMY_API_RESPONSE.media[ 0 ]
				} );
			} );
		} );

		it( 'should call to the WordPress.com REST API', function() {
			return MediaActions.add( DUMMY_SITE_ID, DUMMY_UPLOAD ).then( () => {
				expect( stubs.mediaAdd ).to.have.been.calledWithMatch( {}, DUMMY_UPLOAD );
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: 'RECEIVE_MEDIA_ITEM',
					siteId: DUMMY_SITE_ID,
					id: 'media-1',
					data: DUMMY_API_RESPONSE.media[ 0 ]
				} );
			} );
		} );

		it( 'should immediately receive a transient object', function() {
			return MediaActions.add( DUMMY_SITE_ID, DUMMY_UPLOAD ).then( () => {
				expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
					type: 'CREATE_MEDIA_ITEM',
					data: {
						ID: 'media-1',
						file: DUMMY_UPLOAD.name,
						'transient': true
					}
				} );
			} );
		} );

		it( 'should attach file upload to a post if one is being edited', function() {
			sandbox.stub( PostEditStore, 'get' ).returns( { ID: 200 } );

			return MediaActions.add( DUMMY_SITE_ID, DUMMY_UPLOAD ).then( () => {
				expect( stubs.mediaAdd ).to.have.been.calledWithMatch( {}, {
					file: DUMMY_UPLOAD,
					parent_id: 200
				} );
			} );
		} );

		it( 'should attach URL upload to a post if one is being edited', function() {
			sandbox.stub( PostEditStore, 'get' ).returns( { ID: 200 } );

			return MediaActions.add( DUMMY_SITE_ID, DUMMY_URL ).then( () => {
				expect( stubs.mediaAddUrls ).to.have.been.calledWithMatch( {}, {
					url: DUMMY_URL,
					parent_id: 200
				} );
			} );
		} );

		it( 'should upload in series', () => {
			// An awkward test, but the idea is that at the point at which
			// handleServerAction is called for the first received media,
			// only the first of the two items should have started uploading.
			Dispatcher.handleServerAction.restore();
			sandbox.stub( Dispatcher, 'handleServerAction' ).throws();

			return MediaActions.add( DUMMY_SITE_ID, [ DUMMY_UPLOAD, DUMMY_UPLOAD ] ).then( () => {
				expect( Dispatcher.handleServerAction ).to.have.thrown;
			} ).catch( () => {
				expect( stubs.mediaAdd ).to.have.been.calledOnce;
			} );
		} );
	} );

	describe( '#addExternal()', () => {
		it( 'should accept an upload', () => {
			return MediaActions.addExternal( DUMMY_SITE_ID, [ DUMMY_UPLOAD ], 'external' ).then( () => {
				expect( stubs.mediaAddExternal ).to.have.been.calledWithMatch( 'external', [ DUMMY_UPLOAD.guid ] );
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: 'RECEIVE_MEDIA_ITEM',
					siteId: DUMMY_SITE_ID,
					id: 'media-1',
					data: DUMMY_API_RESPONSE.media[ 0 ]
				} );
			} );
		} );
	} );

	describe( '#edit()', function() {
		const item = { ID: 100, description: 'Example' };

		it( 'should immediately edit the existing item', function() {
			MediaActions.edit( DUMMY_SITE_ID, item );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'RECEIVE_MEDIA_ITEM',
				siteId: DUMMY_SITE_ID,
				data: assign( {}, DUMMY_ITEM, item )
			} );
		} );
	} );

	describe( '#update()', function() {
		const item = { ID: 100, description: 'Example' };

		it( 'should accept a single item', function() {
			MediaActions.update( DUMMY_SITE_ID, item );
			expect( stubs.mediaUpdate ).to.have.been.calledOnce;
		} );

		it( 'should accept an array of items', function() {
			MediaActions.update( DUMMY_SITE_ID, [ item, item ] );
			expect( stubs.mediaUpdate ).to.have.been.calledTwice;
		} );

		it( 'should immediately update the existing item', function() {
			MediaActions.update( DUMMY_SITE_ID, item );

			expect( stubs.mediaUpdate ).to.have.been.calledWithMatch( item );
			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'RECEIVE_MEDIA_ITEM',
				siteId: DUMMY_SITE_ID,
				data: assign( {}, DUMMY_ITEM, item )
			} );
		} );

		it( 'should call to the WordPress.com REST API', function( done ) {
			MediaActions.update( DUMMY_SITE_ID, item );

			expect( stubs.mediaUpdate ).to.have.been.calledWithMatch( item );

			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: 'RECEIVE_MEDIA_ITEM',
					error: null,
					siteId: DUMMY_SITE_ID,
					data: DUMMY_API_RESPONSE
				} );

				done();
			} );
		} );
	} );

	describe( '#delete()', function() {
		const item = { ID: 100 };

		it( 'should accept a single item', function() {
			MediaActions.delete( DUMMY_SITE_ID, item );
			expect( stubs.mediaDelete ).to.have.been.calledOnce;
		} );

		it( 'should accept an array of items', function() {
			MediaActions.delete( DUMMY_SITE_ID, [ item, item ] );
			expect( stubs.mediaDelete ).to.have.been.calledTwice;
		} );

		it( 'should call to the WordPress.com REST API', function( done ) {
			MediaActions.delete( DUMMY_SITE_ID, item );

			expect( stubs.mediaDelete ).to.have.been.calledOn( [ DUMMY_SITE_ID, item.ID ].join() );
			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: 'REMOVE_MEDIA_ITEM',
					error: null,
					siteId: DUMMY_SITE_ID,
					data: DUMMY_API_RESPONSE
				} );

				done();
			} );
		} );

		it( 'should immediately remove the item', function() {
			MediaActions.delete( DUMMY_SITE_ID, item );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'REMOVE_MEDIA_ITEM',
				siteId: DUMMY_SITE_ID,
				data: item
			} );
		} );
	} );

	describe( '#clearValidationErrors()', function() {
		it( 'should dispatch the `CLEAR_MEDIA_VALIDATION_ERRORS` action with the specified siteId', function() {
			MediaActions.clearValidationErrors( DUMMY_SITE_ID );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'CLEAR_MEDIA_VALIDATION_ERRORS',
				siteId: DUMMY_SITE_ID,
				itemId: undefined
			} );
		} );

		it( 'should dispatch the `CLEAR_MEDIA_VALIDATION_ERRORS` action with the specified siteId and itemId', function() {
			MediaActions.clearValidationErrors( DUMMY_SITE_ID, DUMMY_ITEM.ID );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'CLEAR_MEDIA_VALIDATION_ERRORS',
				siteId: DUMMY_SITE_ID,
				itemId: DUMMY_ITEM.ID
			} );
		} );
	} );

	describe( '#sourceChanged()', () => {
		it( 'should dispatch the `CHANGE_MEDIA_SOURCE` action with the specified siteId', () => {
			MediaActions.sourceChanged( DUMMY_SITE_ID );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'CHANGE_MEDIA_SOURCE',
				siteId: DUMMY_SITE_ID,
			} );
		} );
	} );
} );
