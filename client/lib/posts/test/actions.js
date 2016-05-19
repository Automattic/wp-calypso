/**
 * External dependencies
 */
var chai = require( 'chai' ),
	defer = require( 'lodash/defer' ),
	expect = chai.expect,
	sinon = require( 'sinon' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	useFakeDom = require( 'test/helpers/use-fake-dom' ),
	wpcom = require( 'lib/wp' );

describe( 'actions', function() {
	let PostActions, PostEditStore, sandbox;

	useFakeDom();

	before( () => {
		PostEditStore = require( '../post-edit-store' );
		PostActions = require( '../actions' );

		sandbox = sinon.sandbox.create();
	} );

	beforeEach( () => {
		sandbox.stub( Dispatcher, 'handleServerAction' );
		sandbox.stub( Dispatcher, 'handleViewAction' );
		sandbox.stub( PostEditStore, 'get' ).returns( {
			metadata: []
		} );
	} );

	afterEach( () => {
		sandbox.restore();
	} );

	describe( '#updateMetadata()', function() {
		it( 'should dispatch a post edit with a new metadata value', function() {
			PostActions.updateMetadata( 'foo', 'bar' );

			expect( Dispatcher.handleViewAction.calledWithMatch( {
				type: 'EDIT_POST',
				post: {
					metadata: [
						{ key: 'foo', value: 'bar', operation: 'update' }
					]
				}
			} ) ).to.be.true;
		} );

		it( 'accepts an object of key value pairs', function() {
			PostActions.updateMetadata( {
				foo: 'bar',
				baz: 'qux'
			} );

			expect( Dispatcher.handleViewAction.calledWithMatch( {
				type: 'EDIT_POST',
				post: {
					metadata: [
						{ key: 'foo', value: 'bar', operation: 'update' },
						{ key: 'baz', value: 'qux', operation: 'update' }
					]
				}
			} ) ).to.be.true;
		} );

		it( 'should include metadata already existing on the post object', function() {
			PostEditStore.get.restore();
			sandbox.stub( PostEditStore, 'get' ).returns( {
				metadata: [
					{ key: 'other', value: '1234' }
				]
			} );

			PostActions.updateMetadata( 'foo', 'bar' );

			expect( Dispatcher.handleViewAction.calledWithMatch( {
				type: 'EDIT_POST',
				post: {
					metadata: [
						{ key: 'other', value: '1234' },
						{ key: 'foo', value: 'bar', operation: 'update' }
					]
				}
			} ) ).to.be.true;
		} );

		it( 'should include metadata edits made previously', function() {
			PostEditStore.get.restore();
			sandbox.stub( PostEditStore, 'get' ).returns( {
				metadata: [
					{ key: 'other', operation: 'delete' }
				]
			} );

			PostActions.updateMetadata( 'foo', 'bar' );

			expect( Dispatcher.handleViewAction.calledWithMatch( {
				type: 'EDIT_POST',
				post: {
					metadata: [
						{ key: 'other', operation: 'delete' },
						{ key: 'foo', value: 'bar', operation: 'update' }
					]
				}
			} ) ).to.be.true;
		} );

		it( 'should not duplicate existing metadata edits', function() {
			PostEditStore.get.restore();
			sandbox.stub( PostEditStore, 'get' ).returns( {
				metadata: [
					{ key: 'bar', value: 'foo' },
					{ key: 'foo', value: 'baz', operation: 'delete' }
				]
			} );

			PostActions.updateMetadata( 'foo', 'bar' );

			expect( Dispatcher.handleViewAction.calledWithMatch( {
				type: 'EDIT_POST',
				post: {
					metadata: [
						{ key: 'bar', value: 'foo' },
						{ key: 'foo', value: 'bar', operation: 'update' }
					]
				}
			} ) ).to.be.true;
		} );
	} );

	describe( '#deleteMetadata()', function() {
		it( 'should dispatch a post edit with a deleted metadata', function() {
			PostEditStore.get.restore();
			sandbox.stub( PostEditStore, 'get' ).returns( {
				metadata: [
					{ key: 'bar', value: 'foo' }
				]
			} );
			PostActions.deleteMetadata( 'foo' );

			expect( Dispatcher.handleViewAction.calledWithMatch( {
				type: 'EDIT_POST',
				post: {
					metadata: [
						{ key: 'bar', value: 'foo' },
						{ key: 'foo', operation: 'delete' }
					]
				}
			} ) ).to.be.true;
		} );

		it( 'should accept an array of metadata keys to delete', function() {
			PostActions.deleteMetadata( [ 'foo', 'bar' ] );

			expect( Dispatcher.handleViewAction.calledWithMatch( {
				type: 'EDIT_POST',
				post: {
					metadata: [
						{ key: 'foo', operation: 'delete', },
						{ key: 'bar', operation: 'delete' }
					]
				}
			} ) ).to.be.true;
		} );
	} );

	describe( '#saveEdited()', function() {
		it( 'should not send a request if the post has no content', function( done ) {
			var spy = sandbox.spy();
			sandbox.stub( PostEditStore, 'hasContent' ).returns( false );

			PostActions.saveEdited( null, spy );

			defer( () => {
				expect( spy ).to.have.been.calledOnce;
				expect( spy.getCall( 0 ).args[ 0 ] ).to.be.an.instanceof( Error );
				expect( spy.getCall( 0 ).args[ 0 ].message ).to.equal( 'NO_CONTENT' );
				expect( spy.getCall( 0 ).args[ 1 ] ).to.eql( PostEditStore.get() );
				done();
			} );
		} );

		it( 'should not send a request if there are no changed attributes', function( done ) {
			var spy = sandbox.spy();
			sandbox.stub( PostEditStore, 'hasContent' ).returns( true );
			sandbox.stub( PostEditStore, 'getChangedAttributes' ).returns( {} );

			PostActions.saveEdited( null, spy );

			defer( () => {
				expect( spy ).to.have.been.calledOnce;
				expect( spy.getCall( 0 ).args[ 0 ] ).to.be.an.instanceof( Error );
				expect( spy.getCall( 0 ).args[ 0 ].message ).to.equal( 'NO_CHANGE' );
				expect( spy.getCall( 0 ).args[ 1 ] ).to.eql( PostEditStore.get() );
				done();
			} );
		} );

		it( 'should normalize attributes and call the API', function( done ) {
			sandbox.stub( PostEditStore, 'hasContent' ).returns( true );

			const changedAttributes = {
				ID: 777,
				site_ID: 123,
				author: {
					ID: 3
				},
				title: 'OMG Unicorns',
				categories: [ 199, 200 ]
			};
			sandbox.stub( PostEditStore, 'getChangedAttributes' ).returns( changedAttributes );

			sandbox.stub( wpcom, 'site' ).returns( {
				post: function() {
					return {
						add: function( query, attributes, callback ) {
							callback( null, attributes );
						}
					};
				}
			} );

			PostActions.saveEdited( null, ( error, data ) => {
				const normalizedAttributes = {
					ID: 777,
					site_ID: 123,
					author: 3,
					title: 'OMG Unicorns',
					categories_by_id: [ '199', '200' ]
				};

				expect( Dispatcher.handleViewAction ).to.have.been.calledTwice;
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					error: null,
					post: normalizedAttributes,
					type: 'RECEIVE_POST_BEING_EDITED'
				} );
				expect( error ).to.be.null;
				expect( data ).to.eql( normalizedAttributes );
				done();
			} );
		} );
	} );
} );
