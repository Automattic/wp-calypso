/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { DUMMY_API_RESPONSE, DUMMY_QUERY, DUMMY_SITE_ID } from './fixtures';
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
	let MediaActions, sandbox, Dispatcher, savedCreateObjectURL;

	beforeAll( function () {
		Dispatcher = require( 'dispatcher' );
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
} );
