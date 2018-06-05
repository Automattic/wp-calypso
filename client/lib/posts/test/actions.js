/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import PostActions from '../actions';
import PostEditStore from '../post-edit-store';
import Dispatcher from 'dispatcher';

jest.mock( 'lib/localforage', () => require( 'lib/localforage/localforage-bypass' ) );
jest.mock( 'lib/wp', () => require( './mocks/lib/wp' ) );

jest.mock( 'lib/redux-bridge', () => ( {
	reduxDispatch: action => action,
	reduxGetState: () => ( { ui: { editor: { saveBlockers: [] } } } ),
} ) );

describe( 'actions', () => {
	let sandbox;

	beforeAll( () => {
		sandbox = sinon.sandbox.create();
	} );

	beforeEach( () => {
		sandbox.stub( Dispatcher, 'handleServerAction' );
		sandbox.stub( Dispatcher, 'handleViewAction' );
		sandbox.stub( PostEditStore, 'get' ).returns( {
			metadata: [],
		} );
	} );

	afterEach( () => {
		sandbox.restore();
	} );

	describe( '#saveEdited()', () => {
		test( 'should not send a request if the post has no content', () => {
			sandbox.stub( PostEditStore, 'hasContent' ).returns( false );

			const saveResult = PostActions.saveEdited( null );
			return expect( saveResult ).rejects.toThrow( 'NO_CONTENT' );
		} );

		test( 'should not send a request if there are no changed attributes', () => {
			sandbox.stub( PostEditStore, 'hasContent' ).returns( true );
			sandbox.stub( PostEditStore, 'getChangedAttributes' ).returns( {} );

			const saveResult = PostActions.saveEdited( null );
			return expect( saveResult ).resolves.toBeUndefined();
		} );

		test( 'should normalize attributes and call the API', async () => {
			sandbox.stub( PostEditStore, 'hasContent' ).returns( true );

			const changedAttributes = {
				ID: 777,
				site_ID: 123,
				author: {
					ID: 3,
				},
				title: 'OMG Unicorns',
				terms: {
					category: [
						{
							ID: 7,
							name: 'ribs',
						},
					],
				},
			};

			const normalizedAttributes = {
				ID: 777,
				site_ID: 123,
				author: 3,
				title: 'OMG Unicorns',
				terms: {},
			};

			sandbox.stub( PostEditStore, 'getChangedAttributes' ).returns( changedAttributes );

			const saveResult = PostActions.saveEdited( null );
			await expect( saveResult ).resolves.toBeUndefined();

			sinon.assert.calledTwice( Dispatcher.handleViewAction );
			sinon.assert.calledWithMatch( Dispatcher.handleServerAction, {
				type: 'RECEIVE_POST_BEING_EDITED',
				post: normalizedAttributes,
			} );
		} );
	} );
} );
