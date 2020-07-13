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
import { DUMMY_API_RESPONSE, DUMMY_ITEM, DUMMY_QUERY, DUMMY_SITE_ID } from './fixtures';
import { stubs } from './mocks/lib/wp';

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

		return jest.requireActual( 'lodash' ).isPlainObject( obj );
	},
	uniqueId: () => 'media-1',
} ) );

let mockReduxPostId = null;
jest.mock( 'lib/redux-bridge', () => ( {
	reduxGetState: () => ( {
		media: { errors: {} },
		editor: { postId: mockReduxPostId },
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
