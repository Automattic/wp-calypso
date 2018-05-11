/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { defer } from 'lodash';
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

const sampleSite = {
	ID: 123,
	jetpack: false,
	slug: 'example.wordpress.com',
	URL: 'https://example.wordpress.com',
};
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
		test( 'should not send a request if the post has no content', done => {
			const spy = sandbox.spy();
			sandbox.stub( PostEditStore, 'hasContent' ).returns( false );

			PostActions.saveEdited( sampleSite, null, {}, spy );

			defer( () => {
				expect( spy ).to.have.been.calledOnce;
				expect( spy.getCall( 0 ).args[ 0 ] ).to.be.an.instanceof( Error );
				expect( spy.getCall( 0 ).args[ 0 ].message ).to.equal( 'NO_CONTENT' );
				expect( spy.getCall( 0 ).args[ 1 ] ).to.eql( PostEditStore.get() );
				done();
			} );
		} );

		test( 'should not send a request if there are no changed attributes', done => {
			const spy = sandbox.spy();
			sandbox.stub( PostEditStore, 'hasContent' ).returns( true );
			sandbox.stub( PostEditStore, 'getChangedAttributes' ).returns( {} );

			PostActions.saveEdited( sampleSite, null, {}, spy );

			defer( () => {
				expect( spy ).to.have.been.calledOnce;
				expect( spy.getCall( 0 ).args[ 0 ] ).to.be.an.instanceof( Error );
				expect( spy.getCall( 0 ).args[ 0 ].message ).to.equal( 'NO_CHANGE' );
				expect( spy.getCall( 0 ).args[ 1 ] ).to.eql( PostEditStore.get() );
				done();
			} );
		} );

		test( 'should normalize attributes and call the API', done => {
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
			sandbox.stub( PostEditStore, 'getChangedAttributes' ).returns( changedAttributes );

			PostActions.saveEdited( sampleSite, null, {}, ( error, data ) => {
				const normalizedAttributes = {
					ID: 777,
					site_ID: 123,
					author: 3,
					title: 'OMG Unicorns',
					terms: {},
				};

				expect( Dispatcher.handleViewAction ).to.have.been.calledTwice;
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					error: null,
					post: normalizedAttributes,
					type: 'RECEIVE_POST_BEING_EDITED',
				} );
				expect( error ).to.be.null;
				expect( data ).to.eql( normalizedAttributes );
				done();
			} );
		} );
	} );
} );
