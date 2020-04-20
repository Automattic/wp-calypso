/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { assign } from 'lodash';
import sinon from 'sinon';

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
	DUMMY_URL,
} from './fixtures';
import { stubs } from './mocks/lib/wp';
import { site } from './fixtures/site';

jest.mock( 'lib/media/library-selected-store', () => ( {
	getAll: () => [ require( './fixtures' ).DUMMY_ITEM ],
} ) );
jest.mock( 'lib/media/store', () => ( {
	dispatchToken: require( 'dispatcher' ).register( () => {} ),
	get: () => require( './fixtures' ).DUMMY_ITEM,
} ) );
jest.mock( 'lib/user', () => () => {} );
jest.mock( 'lib/wp', () => require( './mocks/lib/wp' ) );
jest.mock( 'lib/impure-lodash', () => ( {
	isPlainObject: ( obj ) => {
		// In the browser, our DUMMY_UPLOAD will be an instanceof
		// window.File, but File is not provided by jsdom
		if ( obj === require( './fixtures' ).DUMMY_UPLOAD ) {
			return false;
		}

		return require.requireActual( 'lodash' ).isPlainObject( obj );
	},
	uniqueId: () => 'media-1',
} ) );

let mockReduxPostId = null;
jest.mock( 'lib/redux-bridge', () => ( {
	reduxGetState: () => ( {
		media: { errors: {} },
		ui: { editor: { postId: mockReduxPostId } },
	} ),
	reduxDispatch: () => ( {} ),
} ) );

describe( 'MediaActions', () => {
	let MediaActions, sandbox, Dispatcher, MediaListStore, savedCreateObjectURL;

	beforeAll( function () {
		Dispatcher = require( 'dispatcher' );
		MediaListStore = require( '../list-store' );
		MediaActions = require( '../actions' );
	} );

	beforeEach( () => {
		sandbox = sinon.createSandbox();
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
		window.FileList = function () {};
		window.FileList.prototype[ Symbol.iterator ] = Array.prototype[ Symbol.iterator ];
		savedCreateObjectURL = window.URL.createObjectURL;
		window.URL.createObjectURL = sandbox.stub();
		mockReduxPostId = null;
	} );

	afterEach( () => {
		sandbox.restore();
		delete window.FileList;
		window.URL.createObjectURL = savedCreateObjectURL;
	} );

	describe( '#setQuery()', () => {
		test( 'should dispatch the SET_MEDIA_QUERY action', () => {
			MediaActions.setQuery( DUMMY_SITE_ID, DUMMY_QUERY );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'SET_MEDIA_QUERY',
				siteId: DUMMY_SITE_ID,
				query: DUMMY_QUERY,
			} );
		} );
	} );

	describe( '#fetch()', () => {
		test( 'should call to the WordPress.com REST API', () => {
			return new Promise( ( done ) => {
				Dispatcher.handleViewAction.restore();
				sandbox.stub( Dispatcher, 'handleViewAction' ).callsFake( function () {
					expect( MediaActions._fetching ).to.have.all.keys( [
						[ DUMMY_SITE_ID, DUMMY_ITEM.ID ].join(),
					] );
				} );

				MediaActions.fetch( DUMMY_SITE_ID, DUMMY_ITEM.ID );

				expect( Dispatcher.handleViewAction ).to.have.been.calledOnce;
				expect( stubs.mediaGet ).to.have.been.calledOn( [ DUMMY_SITE_ID, DUMMY_ITEM.ID ].join() );
				process.nextTick( function () {
					expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
						type: 'RECEIVE_MEDIA_ITEM',
						error: null,
						siteId: DUMMY_SITE_ID,
						data: DUMMY_API_RESPONSE,
					} );

					done();
				} );
			} );
		} );

		test( 'should not allow simultaneous request for the same item', () => {
			MediaActions.fetch( DUMMY_SITE_ID, DUMMY_ITEM.ID );
			MediaActions.fetch( DUMMY_SITE_ID, DUMMY_ITEM.ID );

			expect( stubs.mediaGet ).to.have.been.calledOnce;
		} );

		test( 'should allow simultaneous request for different items', () => {
			MediaActions.fetch( DUMMY_SITE_ID, DUMMY_ITEM.ID );
			MediaActions.fetch( DUMMY_SITE_ID, DUMMY_ITEM.ID + 1 );

			expect( stubs.mediaGet ).to.have.been.calledTwice;
		} );
	} );

	describe( '#fetchNextPage()', () => {
		test( 'should call to the internal WordPress.com REST API', () => {
			return new Promise( ( done ) => {
				const query = MediaListStore.getNextPageQuery( DUMMY_SITE_ID );

				MediaActions.fetchNextPage( DUMMY_SITE_ID );

				expect( stubs.mediaList ).to.have.been.calledOn( DUMMY_SITE_ID );
				process.nextTick( function () {
					expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
						type: 'RECEIVE_MEDIA_ITEMS',
						error: null,
						siteId: DUMMY_SITE_ID,
						data: DUMMY_API_RESPONSE,
						query: query,
					} );

					done();
				} );
			} );
		} );

		test( 'should call to the external WordPress.com REST API', () => {
			return new Promise( ( done ) => {
				MediaListStore._activeQueries[ DUMMY_SITE_ID ] = { query: { source: 'external' } };

				const query = MediaListStore.getNextPageQuery( DUMMY_SITE_ID );

				MediaActions.fetchNextPage( DUMMY_SITE_ID );

				expect( stubs.mediaListExternal ).to.have.been.calledWithMatch( { source: 'external' } );

				process.nextTick( function () {
					expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
						type: 'RECEIVE_MEDIA_ITEMS',
						error: null,
						siteId: DUMMY_SITE_ID,
						data: DUMMY_API_RESPONSE,
						query: query,
					} );

					done();
				} );
			} );
		} );
	} );

	describe( '#add()', () => {
		test( 'should accept a single upload', () => {
			return MediaActions.add( site, DUMMY_UPLOAD ).then( () => {
				expect( Dispatcher.handleViewAction ).to.have.been.calledOnce;
				expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
					type: 'CREATE_MEDIA_ITEM',
				} );
			} );
		} );

		test( 'should accept an array of uploads', () => {
			return MediaActions.add( site, [ DUMMY_UPLOAD, DUMMY_UPLOAD ] ).then( () => {
				expect( Dispatcher.handleViewAction ).to.have.been.calledTwice;
				expect( Dispatcher.handleViewAction ).to.have.always.been.calledWithMatch( {
					type: 'CREATE_MEDIA_ITEM',
				} );
			} );
		} );

		test( 'should accept a file URL', () => {
			return MediaActions.add( site, DUMMY_URL ).then( () => {
				expect( stubs.mediaAddUrls ).to.have.been.calledWithMatch( {}, DUMMY_URL );
			} );
		} );

		test( 'should accept a FileList of uploads', () => {
			const uploads = [ DUMMY_UPLOAD, DUMMY_UPLOAD ];
			uploads.__proto__ = new window.FileList(); // eslint-disable-line no-proto
			return MediaActions.add( site, uploads ).then( () => {
				expect( Dispatcher.handleViewAction ).to.have.been.calledTwice;
				expect( Dispatcher.handleViewAction ).to.have.always.been.calledWithMatch( {
					type: 'CREATE_MEDIA_ITEM',
				} );
			} );
		} );

		test( 'should accept a Blob object wrapper and pass it as "file" parameter', () => {
			return MediaActions.add( site, DUMMY_BLOB_UPLOAD ).then( () => {
				expect( stubs.mediaAdd ).to.have.been.calledWithMatch( {}, { file: DUMMY_BLOB_UPLOAD } );
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: 'RECEIVE_MEDIA_ITEM',
					siteId: DUMMY_SITE_ID,
					id: 'media-1',
					data: DUMMY_API_RESPONSE.media[ 0 ],
				} );
			} );
		} );

		test( 'should call to the WordPress.com REST API', () => {
			return MediaActions.add( site, DUMMY_UPLOAD ).then( () => {
				expect( stubs.mediaAdd ).to.have.been.calledWithMatch( {}, DUMMY_UPLOAD );
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: 'RECEIVE_MEDIA_ITEM',
					siteId: DUMMY_SITE_ID,
					id: 'media-1',
					data: DUMMY_API_RESPONSE.media[ 0 ],
				} );
			} );
		} );

		test( 'should immediately receive a transient object', () => {
			return MediaActions.add( site, DUMMY_UPLOAD ).then( () => {
				expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
					type: 'CREATE_MEDIA_ITEM',
					data: {
						ID: 'media-1',
						file: DUMMY_UPLOAD.name,
						transient: true,
					},
				} );
			} );
		} );

		test( 'should attach file upload to a post if one is being edited', () => {
			mockReduxPostId = 200;

			return MediaActions.add( site, DUMMY_UPLOAD ).then( () => {
				expect( stubs.mediaAdd ).to.have.been.calledWithMatch(
					{},
					{
						file: DUMMY_UPLOAD,
						parent_id: 200,
					}
				);
			} );
		} );

		test( 'should attach URL upload to a post if one is being edited', () => {
			mockReduxPostId = 200;

			return MediaActions.add( site, DUMMY_URL ).then( () => {
				expect( stubs.mediaAddUrls ).to.have.been.calledWithMatch(
					{},
					{
						url: DUMMY_URL,
						parent_id: 200,
					}
				);
			} );
		} );

		test( 'should upload in series', () => {
			// An awkward test, but the idea is that at the point at which
			// handleServerAction is called for the first received media,
			// only the first of the two items should have started uploading.
			Dispatcher.handleServerAction.restore();
			sandbox.stub( Dispatcher, 'handleServerAction' ).throws();

			return MediaActions.add( site, [ DUMMY_UPLOAD, DUMMY_UPLOAD ] )
				.then( () => {
					expect( Dispatcher.handleServerAction ).to.have.thrown;
				} )
				.catch( () => {
					expect( stubs.mediaAdd ).to.have.been.calledOnce;
				} );
		} );
	} );

	describe( '#addExternal()', () => {
		test( 'should accept an upload', () => {
			return MediaActions.addExternal( site, [ DUMMY_UPLOAD ], 'external' ).then( () => {
				expect( stubs.mediaAddExternal ).to.have.been.calledWithMatch( 'external', [
					DUMMY_UPLOAD.guid,
				] );
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: 'RECEIVE_MEDIA_ITEM',
					siteId: DUMMY_SITE_ID,
					id: 'media-1',
					data: DUMMY_API_RESPONSE.media[ 0 ],
				} );
			} );
		} );
	} );

	describe( '#edit()', () => {
		const item = { ID: 100, description: 'Example' };

		test( 'should immediately edit the existing item', () => {
			MediaActions.edit( DUMMY_SITE_ID, item );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'RECEIVE_MEDIA_ITEM',
				siteId: DUMMY_SITE_ID,
				data: assign( {}, DUMMY_ITEM, item ),
			} );
		} );
	} );

	describe( '#update()', () => {
		const item = { ID: 100, description: 'Example' };

		test( 'should accept a single item', () => {
			MediaActions.update( DUMMY_SITE_ID, item );
			expect( stubs.mediaUpdate ).to.have.been.calledOnce;
		} );

		test( 'should accept an array of items', () => {
			MediaActions.update( DUMMY_SITE_ID, [ item, item ] );
			expect( stubs.mediaUpdate ).to.have.been.calledTwice;
		} );

		test( 'should immediately update the existing item', () => {
			MediaActions.update( DUMMY_SITE_ID, item );

			expect( stubs.mediaUpdate ).to.have.been.calledWithMatch( item );
			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'RECEIVE_MEDIA_ITEM',
				siteId: DUMMY_SITE_ID,
				data: assign( {}, DUMMY_ITEM, item ),
			} );
		} );

		test( 'should call to the WordPress.com REST API', () => {
			return new Promise( ( done ) => {
				MediaActions.update( DUMMY_SITE_ID, item );

				expect( stubs.mediaUpdate ).to.have.been.calledWithMatch( item );

				process.nextTick( function () {
					expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
						type: 'RECEIVE_MEDIA_ITEM',
						error: null,
						siteId: DUMMY_SITE_ID,
						data: DUMMY_API_RESPONSE,
					} );

					done();
				} );
			} );
		} );
	} );

	describe( '#delete()', () => {
		const item = { ID: 100 };

		test( 'should accept a single item', () => {
			MediaActions.delete( DUMMY_SITE_ID, item );
			expect( stubs.mediaDelete ).to.have.been.calledOnce;
		} );

		test( 'should accept an array of items', () => {
			MediaActions.delete( DUMMY_SITE_ID, [ item, item ] );
			expect( stubs.mediaDelete ).to.have.been.calledTwice;
		} );

		test( 'should call to the WordPress.com REST API', () => {
			return new Promise( ( done ) => {
				MediaActions.delete( DUMMY_SITE_ID, item );

				expect( stubs.mediaDelete ).to.have.been.calledOn( [ DUMMY_SITE_ID, item.ID ].join() );
				process.nextTick( function () {
					expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
						type: 'REMOVE_MEDIA_ITEM',
						error: null,
						siteId: DUMMY_SITE_ID,
						data: DUMMY_API_RESPONSE,
					} );

					done();
				} );
			} );
		} );

		test( 'should immediately remove the item', () => {
			MediaActions.delete( DUMMY_SITE_ID, item );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'REMOVE_MEDIA_ITEM',
				siteId: DUMMY_SITE_ID,
				data: item,
			} );
		} );
	} );

	describe( '#clearValidationErrors()', () => {
		test( 'should dispatch the `CLEAR_MEDIA_VALIDATION_ERRORS` action with the specified siteId', () => {
			MediaActions.clearValidationErrors( DUMMY_SITE_ID );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'CLEAR_MEDIA_VALIDATION_ERRORS',
				siteId: DUMMY_SITE_ID,
				itemId: undefined,
			} );
		} );

		test( 'should dispatch the `CLEAR_MEDIA_VALIDATION_ERRORS` action with the specified siteId and itemId', () => {
			MediaActions.clearValidationErrors( DUMMY_SITE_ID, DUMMY_ITEM.ID );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'CLEAR_MEDIA_VALIDATION_ERRORS',
				siteId: DUMMY_SITE_ID,
				itemId: DUMMY_ITEM.ID,
			} );
		} );
	} );

	describe( '#sourceChanged()', () => {
		test( 'should dispatch the `CHANGE_MEDIA_SOURCE` action with the specified siteId', () => {
			MediaActions.sourceChanged( DUMMY_SITE_ID );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'CHANGE_MEDIA_SOURCE',
				siteId: DUMMY_SITE_ID,
			} );
		} );
	} );
} );
